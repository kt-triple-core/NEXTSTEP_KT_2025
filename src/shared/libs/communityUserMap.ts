// /shared/libs/communityUserMap.ts
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

export type AccessoryPosition = 'top' | 'bottom-left' | 'bottom-right'

export type AvatarDecoration = {
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

type UserRow = {
  user_id: string
  name: string | null
  avatar: string | null
  decoration_border: string | null
  decoration_top: string | null
  decoration_bottom_left: string | null
  decoration_bottom_right: string | null
}

type DecoRow = {
  decoration_id: string
  category: string | null
  style: string | null
  source: string | null
}

export async function buildUserDecorationMap(
  userIds: string[],
  opts?: { borderScale?: number; accessoryScale?: number }
) {
  const borderScale = opts?.borderScale ?? 0.6
  const accessoryScale = opts?.accessoryScale ?? 0.7

  if (userIds.length === 0) return new Map()

  // 1) users
  const { data: users, error: userError } = await supabaseAdmin
    .from('users')
    .select(
      `
        user_id, name, avatar,
        decoration_border,
        decoration_top, decoration_bottom_left, decoration_bottom_right
      `
    )
    .in('user_id', userIds)
    .eq('status', true)

  if (userError) throw userError

  const safeUsers = (users ?? []) as unknown as UserRow[]

  // 2) decoration_id 모으기
  const decorationIds = Array.from(
    new Set(
      safeUsers
        .flatMap((u) => [
          u.decoration_border,
          u.decoration_top,
          u.decoration_bottom_left,
          u.decoration_bottom_right,
        ])
        .filter(Boolean)
    )
  ) as string[]

  // 3) decorations 조회
  const decoById = new Map<string, DecoRow>()
  if (decorationIds.length > 0) {
    const { data: decos, error: decoErr } = await supabaseAdmin
      .from('decorations')
      .select('decoration_id, category, style, source')
      .in('decoration_id', decorationIds)
      .eq('status', true)

    if (decoErr) throw decoErr

    for (const d of (decos ?? []) as unknown as DecoRow[]) {
      decoById.set(d.decoration_id, d)
    }
  }

  // 4) userMap 만들기
  const userMap = new Map<
    string,
    {
      user_id: string
      name: string | null
      avatar: string | null
      decorations: AvatarDecoration | null
    }
  >()

  for (const u of safeUsers) {
    const borderRow = u.decoration_border
      ? decoById.get(u.decoration_border)
      : null
    const topRow = u.decoration_top ? decoById.get(u.decoration_top) : null
    const blRow = u.decoration_bottom_left
      ? decoById.get(u.decoration_bottom_left)
      : null
    const brRow = u.decoration_bottom_right
      ? decoById.get(u.decoration_bottom_right)
      : null

    const decorations: AvatarDecoration | null =
      borderRow || topRow || blRow || brRow
        ? {
            border: borderRow
              ? {
                  source: borderRow.source ?? null,
                  style: borderRow.style ?? null,
                  scale: borderScale,
                }
              : null,
            accessories: {
              top: topRow
                ? {
                    source: topRow.source ?? null,
                    style: (topRow.style ?? 'top') as any,
                    scale: accessoryScale,
                  }
                : undefined,
              'bottom-left': blRow
                ? {
                    source: blRow.source ?? null,
                    style: (blRow.style ?? 'bottom-left') as any,
                    scale: accessoryScale,
                  }
                : undefined,
              'bottom-right': brRow
                ? {
                    source: brRow.source ?? null,
                    style: (brRow.style ?? 'bottom-right') as any,
                    scale: accessoryScale,
                  }
                : undefined,
            },
          }
        : null

    userMap.set(u.user_id, {
      user_id: u.user_id,
      name: u.name ?? null,
      avatar: u.avatar ?? null,
      decorations,
    })
  }

  return userMap
}

export async function buildUserProfileMap(
  userIds: string[],
  opts?: {
    includeExperience?: boolean
    borderScale?: number
    accessoryScale?: number
  }
) {
  const baseMap = await buildUserDecorationMap(userIds, {
    borderScale: opts?.borderScale,
    accessoryScale: opts?.accessoryScale,
  })

  if (!opts?.includeExperience) return baseMap

  // experience만 추가
  const { data: experiences, error: expError } = await supabaseAdmin
    .from('experiences')
    .select('user_id, field, year')
    .in('user_id', userIds)
    .eq('status', true)

  if (expError) throw expError

  const expByUser = new Map(
    (experiences ?? []).map((e) => [
      e.user_id,
      { field: e.field, year: e.year },
    ])
  )

  const merged = new Map<string, any>()
  for (const [uid, u] of baseMap.entries()) {
    merged.set(uid, { ...u, experience: expByUser.get(uid) ?? null })
  }
  return merged
}
