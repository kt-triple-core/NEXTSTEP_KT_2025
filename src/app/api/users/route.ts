import { getCurrentUser } from '@/features/user/api/getCurrentUser'
import { supabase } from '@/shared/libs/supabaseClient'
// import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const MAX_EXPERIENCES_PER_USER = 3

type PatchBody = {
  name?: string

  // UI 버튼(추가/수정/삭제)에 맞춘 "명령형" 구조
  experiences?: {
    create?: Array<{ field: string; year: number }>
    update?: Array<{ experienceId: string; field?: string; year?: number }>
    delete?: string[] // experienceId 리스트
  }
}

function validateField(field: string) {
  const v = String(field ?? '').trim()
  if (!v || v.length > 50) throw new Error('INVALID_FIELD')
  return v
}

function validateYear(year: number) {
  const v = Number(year)
  if (!Number.isInteger(v) || v < 0 || v > 60) throw new Error('INVALID_YEAR')
  return v
}

// GET: 사용자 프로필 + 커리어 리스트 조회
export async function GET() {
  try {
    const users = await getCurrentUser()

    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('experience_id, field, year, created_at')
      .eq('user_id', users.user_id)
      .eq('status', true)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      userId: users.user_id,
      email: users.email,
      name: users.name,
      avatar: users.avatar,
      experiences: (experiences ?? []).map((e) => ({
        experienceId: e.experience_id,
        field: e.field,
        year: e.year,
      })),
    })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    if (e.message === 'USER_NOT_FOUND')
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// PATCH: 사용자 프로필(이름) 및 커리어 리스트 수정
export async function PATCH(req: Request) {
  try {
    const users = await getCurrentUser()
    const body = (await req.json()) as PatchBody

    //  1) 이름 업데이트(옵션) — name만 보내도 동작
    if (body.name !== undefined) {
      const name = String(body.name ?? '').trim()
      if (!name || name.length > 30) {
        return NextResponse.json({ message: 'Invalid name' }, { status: 400 })
      }

      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('user_id', users.user_id)

      if (error) throw error
    }

    //  2) experiences 변경(옵션) — experiences가 "명시적으로" 있을 때만 처리
    if (body.experiences !== undefined) {
      const creates = body.experiences.create ?? []
      const updates = body.experiences.update ?? []
      const deletes = body.experiences.delete ?? []

      // 현재 활성 experiences 개수 체크(최대 3 제한을 안전하게)
      const { count, error: countError } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', users.user_id)
        .eq('status', true)

      if (countError) throw countError

      // 최종 개수 예측:
      // - delete는 -1씩
      // - create는 +1씩
      // (update는 개수 영향 없음)
      const current = count ?? 0
      const predicted = current - deletes.length + creates.length

      if (predicted > MAX_EXPERIENCES_PER_USER) {
        return NextResponse.json(
          {
            message: 'Experience limit exceeded',
            max: MAX_EXPERIENCES_PER_USER,
          },
          { status: 409 }
        )
      }

      // 2-1) delete (soft delete)
      if (deletes.length > 0) {
        const { error } = await supabase
          .from('experiences')
          .update({ status: false })
          .in('experience_id', deletes)
          .eq('user_id', users.user_id) //  본인것만

        if (error) throw error
      }

      // 2-2) update
      for (const u of updates) {
        const patch: Record<string, any> = {}
        if (u.field !== undefined) patch.field = validateField(u.field)
        if (u.year !== undefined) patch.year = validateYear(u.year)

        if (Object.keys(patch).length === 0) continue

        const { error } = await supabase
          .from('experiences')
          .update(patch)
          .eq('experience_id', u.experienceId)
          .eq('user_id', users.user_id)
          .eq('status', true)

        if (error) throw error
      }

      // 2-3) create
      if (creates.length > 0) {
        const rows = creates.map((c) => ({
          user_id: users.user_id,
          field: validateField(c.field),
          year: validateYear(c.year),
          status: true,
        }))

        const { error } = await supabase.from('experiences').insert(rows)
        if (error) throw error
      }
    }

    //  변경 후 최신 데이터 다시 내려주기(프론트 react-query 갱신에 편함)
    const { data: updatedUser, error: userErr } = await supabase
      .from('users')
      .select('user_id, email, name, avatar')
      .eq('user_id', users.user_id)
      .single()
    if (userErr) throw userErr

    const { data: experiences, error: expErr } = await supabase
      .from('experiences')
      .select('experience_id, field, year, created_at')
      .eq('user_id', users.user_id)
      .eq('status', true)
      .order('created_at', { ascending: true })
    if (expErr) throw expErr

    return NextResponse.json({
      message: 'OK',
      userId: updatedUser.user_id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      experiences: (experiences ?? []).map((e) => ({
        experienceId: e.experience_id,
        field: e.field,
        year: e.year,
      })),
    })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    if (e.message === 'INVALID_FIELD')
      return NextResponse.json({ message: 'Invalid field' }, { status: 400 })

    if (e.message === 'INVALID_YEAR')
      return NextResponse.json({ message: 'Invalid year' }, { status: 400 })

    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
