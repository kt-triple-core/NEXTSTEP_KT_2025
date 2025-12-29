import { NextResponse } from 'next/server'
import { requireUser } from '@/shared/libs/requireUser'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

const MAX_EXPERIENCES_PER_USER = 3

const AVATAR_BUCKET = 'avatars'

type Category = 'accessory' | 'border' | 'title' | 'nickname'
type Position = 'top' | 'bottom-left' | 'bottom-right'

type ApplyDecorationBody =
  | {
      action: 'applyDecoration'
      decorationId: string
      category: Category
      style?: Position | null // accessory만
    }
  | {
      action: 'clearDecoration'
      category: Category
      style?: Position | null // accessory만 (어느 슬롯 비울지)
    }

type PatchBody = {
  name?: string

  // UI 버튼(추가/수정/삭제)에 맞춘 "명령형" 구조
  experiences?: {
    create?: Array<{ field: string; year: number }>
    update?: Array<{ experienceId: string; field?: string; year?: number }>
    delete?: string[] // experienceId 리스트
  }
}

type PatchRequestBody = PatchBody | ApplyDecorationBody

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

// GET: 사용자 프로필 + 커리어 리스트 조회 + 구매 내역 조회
export async function GET() {
  try {
    const { userId } = await requireUser()

    // 사용자 정보 조회
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select(
        ` user_id, email, name, avatar, point, status,
    decoration_border,
    decoration_title,
    decoration_name_color,
    decoration_top,
    decoration_bottom_left,
    decoration_bottom_right`
      )
      .eq('user_id', userId)
      .eq('status', true)
      .single()
    if (userErr || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    if (user.status !== true) {
      return NextResponse.json({ message: 'User inactive' }, { status: 403 })
    }

    // 커리어 리스트 조회
    const { data: experiences, error: expErr } = await supabaseAdmin
      .from('experiences')
      .select('experience_id, field, year, created_at')
      .eq('user_id', userId)
      .eq('status', true)
      .order('created_at', { ascending: true })

    if (expErr) throw expErr

    //  구매 내역 조회 (orders -> decorations 조인)
    const { data: orders, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select(
        `
        order_id,
        created_at,
        decoration:decorations (
          decoration_id,
          name,
          price,
          category,
          style,
          source,
          status
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', true)
      .order('created_at', { ascending: false })

    if (orderErr) throw orderErr

    //  프론트에서 쓰기 좋은 형태로 변환
    const purchased = (orders ?? [])
      .filter((o: any) => o.decoration && o.decoration.status === true)
      .map((o: any) => ({
        orderId: o.order_id,
        purchasedAt: o.created_at,
        decorationId: o.decoration.decoration_id,
        name: o.decoration.name,
        price: o.decoration.price,
        category: o.decoration.category,
        style: o.decoration.style,
        source: o.decoration.source,
      }))

    return NextResponse.json({
      userId: user.user_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      point: user.point ?? 0,
      experiences: (experiences ?? []).map((e) => ({
        experienceId: e.experience_id,
        field: e.field,
        year: e.year,
      })),
      //  추가된 부분
      orders: purchased,

      applied: {
        borderId: user.decoration_border ?? null,
        titleId: user.decoration_title ?? null,
        nicknameColorId: user.decoration_name_color ?? null,
        topId: user.decoration_top ?? null,
        bottomLeftId: user.decoration_bottom_left ?? null,
        bottomRightId: user.decoration_bottom_right ?? null,
      },
    })
  } catch (e: any) {
    console.error('GET /api/users error:', e)
    return NextResponse.json(
      { message: 'Server error', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}

// PATCH: 사용자 프로필(이름) 및 커리어 리스트 수정 + 아바타 업로드
export async function PATCH(req: Request) {
  try {
    const { userId } = await requireUser()

    // 존재하는 유저인지 확인(토큰은 있지만 DB에서 삭제되었을 수도 있음)
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('user_id, status')
      .eq('user_id', userId)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    if (user.status !== true) {
      return NextResponse.json({ message: 'User inactive' }, { status: 403 })
    }

    const contentType = req.headers.get('content-type') || ''
    let body: PatchBody = {}
    let avatarFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()

      // 폼데이터로 name/experiences를 같이 받을 경우
      const name = formData.get('name')
      const experiences = formData.get('experiences') // JSON string
      const action = formData.get('action')
      const decorationId = formData.get('decorationId')
      const category = formData.get('category')
      const style = formData.get('style')

      const obj: any = {}
      if (typeof name === 'string') obj.name = name
      if (typeof experiences === 'string')
        obj.experiences = JSON.parse(experiences)

      // 데코 적용도 multipart로 보낼 수 있게(선택)
      if (typeof action === 'string') obj.action = action
      if (typeof decorationId === 'string') obj.decorationId = decorationId
      if (typeof category === 'string') obj.category = category
      if (typeof style === 'string') obj.style = style

      body = obj as PatchRequestBody

      const file = formData.get('avatar')
      if (file instanceof File) avatarFile = file
    } else {
      // application/json
      body = (await req.json()) as PatchRequestBody
    }

    // ✅ 0) 데코 적용 / 해제 요청
    if (
      body &&
      (body as any).action &&
      ((body as any).action === 'applyDecoration' ||
        (body as any).action === 'clearDecoration')
    ) {
      const { action, category, style } = body as ApplyDecorationBody
      const decorationId =
        action === 'applyDecoration' ? (body as any).decorationId : null

      if (!category) {
        return NextResponse.json(
          { message: 'category is required' },
          { status: 400 }
        )
      }

      // apply일 때만 구매 검증
      if (action === 'applyDecoration') {
        if (!decorationId) {
          return NextResponse.json(
            { message: 'decorationId is required' },
            { status: 400 }
          )
        }

        const { data: order, error } = await supabaseAdmin
          .from('orders')
          .select('order_id')
          .eq('user_id', userId)
          .eq('decoration_id', decorationId)
          .eq('status', true)
          .maybeSingle()

        if (error) throw error
        if (!order) {
          return NextResponse.json(
            { message: '구매한 아이템만 적용할 수 있습니다.' },
            { status: 403 }
          )
        }
      }

      // users 테이블 업데이트 payload
      const patch: Record<string, string | null> = {}

      switch (category) {
        case 'border':
          patch.decoration_border =
            action === 'applyDecoration' ? decorationId : null
          break

        case 'title':
          patch.decoration_title =
            action === 'applyDecoration' ? decorationId : null
          break

        case 'nickname':
          patch.decoration_name_color =
            action === 'applyDecoration' ? decorationId : null
          break

        case 'accessory':
          if (!style) {
            return NextResponse.json(
              { message: 'accessory requires style' },
              { status: 400 }
            )
          }

          if (style === 'top') {
            patch.decoration_top =
              action === 'applyDecoration' ? decorationId : null
          }
          if (style === 'bottom-left') {
            patch.decoration_bottom_left =
              action === 'applyDecoration' ? decorationId : null
          }
          if (style === 'bottom-right') {
            patch.decoration_bottom_right =
              action === 'applyDecoration' ? decorationId : null
          }
          break
      }

      const { error: updErr } = await supabaseAdmin
        .from('users')
        .update(patch)
        .eq('user_id', userId)
        .eq('status', true)

      if (updErr) throw updErr

      return NextResponse.json({
        message: action === 'applyDecoration' ? '적용 완료' : '해제 완료',
        applied: patch,
      })
    }

    // -----------------------------
    // 아래부터는 기존 프로필 PATCH 로직
    // -----------------------------
    const profileBody = body as PatchBody

    // PDF, exe, txt업로드 방지
    if (avatarFile) {
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json(
          { message: 'Only image files allowed' },
          { status: 400 }
        )
      }

      // "덮어쓰기"를 위해 경로를 고정
      // 확장자 통일(예: png)해버리면 관리가 쉬움
      const filePath = `${userId}/avatar.png`

      const { error: uploadErr } = await supabaseAdmin.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, avatarFile, {
          contentType: avatarFile.type,
          upsert: true, // 같은 경로면 덮어쓰기
        })

      if (uploadErr) {
        console.error('Storage upload error:', uploadErr)
        return NextResponse.json(
          { message: 'Upload failed', detail: uploadErr.message },
          { status: 400 }
        )
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath)

      // 같은 URL이면 브라우저/CDN 캐시 때문에 안 바뀐 것처럼 보일 수 있음
      // 그래서 쿼리로 버전 붙여서 DB에 저장
      const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`

      const { error: avatarUpdateErr } = await supabaseAdmin
        .from('users')
        .update({ avatar: avatarUrl }) // DB에 최신 URL 저장
        .eq('user_id', userId)

      if (avatarUpdateErr) {
        console.error('DB update error:', avatarUpdateErr)
        return NextResponse.json(
          { message: 'DB update failed', detail: avatarUpdateErr.message },
          { status: 400 }
        )
      }
    }

    //  1) 이름 업데이트(옵션) — name만 보내도 동작
    if (profileBody.name !== undefined) {
      const name = String(profileBody.name ?? '').trim()
      if (!name || name.length > 30) {
        return NextResponse.json({ message: 'Invalid name' }, { status: 400 })
      }

      const { error } = await supabaseAdmin
        .from('users')
        .update({ name })
        .eq('user_id', userId)

      if (error) throw error
    }

    //  2) experiences 변경(옵션) — experiences가 "명시적으로" 있을 때만 처리
    if (profileBody.experiences !== undefined) {
      const creates = profileBody.experiences.create ?? []
      const updates = profileBody.experiences.update ?? []
      const deletes = profileBody.experiences.delete ?? []

      // 현재 활성 experiences 개수 체크(최대 3 제한을 안전하게)
      const { count, error: countError } = await supabaseAdmin
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
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
        const { error } = await supabaseAdmin
          .from('experiences')
          .update({ status: false })
          .in('experience_id', deletes)
          .eq('user_id', userId) //  본인것만

        if (error) throw error
      }

      // 2-2) update
      for (const u of updates) {
        const patch: Record<string, any> = {}
        if (u.field !== undefined) patch.field = validateField(u.field)
        if (u.year !== undefined) patch.year = validateYear(u.year)

        if (Object.keys(patch).length === 0) continue

        const { error } = await supabaseAdmin
          .from('experiences')
          .update(patch)
          .eq('experience_id', u.experienceId)
          .eq('user_id', userId)
          .eq('status', true)

        if (error) throw error
      }

      // 2-3) create
      if (creates.length > 0) {
        const rows = creates.map((c) => ({
          user_id: userId,
          field: validateField(c.field),
          year: validateYear(c.year),
          status: true,
        }))

        const { error } = await supabaseAdmin.from('experiences').insert(rows)
        if (error) throw error
      }
    }

    //  변경 후 최신 데이터 다시 내려주기(프론트 react-query 갱신에 편함)
    const { data: updatedUser, error: updatedErr } = await supabaseAdmin
      .from('users')
      .select('user_id, email, name, avatar, point, status')
      .eq('user_id', userId)
      .single()

    if (updatedErr || !updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    if (updatedUser.status !== true) {
      return NextResponse.json({ message: 'User inactive' }, { status: 403 })
    }

    const { data: experiences, error: expErr } = await supabaseAdmin
      .from('experiences')
      .select('experience_id, field, year, created_at')
      .eq('user_id', userId)
      .eq('status', true)
      .order('created_at', { ascending: true })
    if (expErr) throw expErr

    return NextResponse.json({
      message: 'OK',
      userId: updatedUser.user_id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      point: updatedUser.point ?? 0,
      experiences: (experiences ?? []).map((e) => ({
        experienceId: e.experience_id,
        field: e.field,
        year: e.year,
      })),
    })
  } catch (e: any) {
    if (e?.message === 'INVALID_FIELD') {
      return NextResponse.json({ message: 'Invalid field' }, { status: 400 })
    }
    if (e?.message === 'INVALID_YEAR') {
      return NextResponse.json({ message: 'Invalid year' }, { status: 400 })
    }
    console.error('PATCH /api/users error:', e)
    return NextResponse.json(
      { message: 'Server error', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
