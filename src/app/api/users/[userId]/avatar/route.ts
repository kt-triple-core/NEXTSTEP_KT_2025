// app/api/users/[userId]/avatar/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

type AccessoryPosition = 'top' | 'bottom-left' | 'bottom-right'

type AvatarDecoration = {
  border?: {
    source: string | null
    style: string | null
    scale?: number | null
  } | null
  accessories?: Partial<
    Record<
      AccessoryPosition,
      { source: string | null; style: string | null; scale?: number | null }
    >
  >
}

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // 1) 유저 + 적용 상태만 가볍게 가져오기
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select(
        `
        user_id, name, avatar, status,
        decoration_border,
        decoration_top, decoration_bottom_left, decoration_bottom_right
      `
      )
      .eq('user_id', userId)
      .eq('status', true)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // 2) “적용된 decorationId들만” decorations에서 source/style 뽑기 (orders 전부 조회 X)
    const ids = [
      user.decoration_border,
      user.decoration_top,
      user.decoration_bottom_left,
      user.decoration_bottom_right,
    ].filter(Boolean) as string[]

    let decorations: AvatarDecoration | null = null

    if (ids.length > 0) {
      const { data: decos, error: decoErr } = await supabaseAdmin
        .from('decorations')
        .select('decoration_id, category, style, source')
        .in('decoration_id', ids)
        .eq('status', true)

      if (decoErr) throw decoErr

      const byId = new Map(decos?.map((d) => [d.decoration_id, d]) ?? [])

      const borderRow = user.decoration_border
        ? byId.get(user.decoration_border)
        : null

      const acc = {
        top: user.decoration_top ? byId.get(user.decoration_top) : null,
        'bottom-left': user.decoration_bottom_left
          ? byId.get(user.decoration_bottom_left)
          : null,
        'bottom-right': user.decoration_bottom_right
          ? byId.get(user.decoration_bottom_right)
          : null,
      } as const

      decorations = {
        border: borderRow
          ? {
              source: borderRow.source ?? null,
              style: borderRow.style ?? null,
              scale: 0.5,
            }
          : null,
        accessories: {
          top: acc.top
            ? {
                source: acc.top.source ?? null,
                style: acc.top.style ?? 'top',
                scale: 0.5,
              }
            : undefined,
          'bottom-left': acc['bottom-left']
            ? {
                source: acc['bottom-left'].source ?? null,
                style: acc['bottom-left'].style ?? 'bottom-left',
                scale: 0.5,
              }
            : undefined,
          'bottom-right': acc['bottom-right']
            ? {
                source: acc['bottom-right'].source ?? null,
                style: acc['bottom-right'].style ?? 'bottom-right',
                scale: 0.5,
              }
            : undefined,
        },
      }
    }

    return NextResponse.json({
      userId: user.user_id,
      name: user.name,
      avatar: user.avatar,
      decorations,
    })
  } catch (e: any) {
    console.error('GET /api/users/[userId]/avatar error:', e)
    return NextResponse.json(
      { message: 'Server error', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
