import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

export async function GET() {
  try {
    // 1️⃣ 게시글 + 게시판 이름 조회
    const { data: posts, error: postError } = await supabaseAdmin
      .from('posts')
      .select(
        `
        posts_id,
        list_id,
        like_count,
        created_at,
        list:lists (
          name
        )
      `
      )
      .eq('status', true)

    if (postError) throw postError
    if (!posts) return NextResponse.json([])

    // 2️⃣ 댓글 수 집계 (post_id 기준)
    const postIds = posts.map((p) => p.posts_id)

    const { data: comments, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('post_id')

    if (commentError) throw commentError

    // post_id → 댓글 수 map
    const commentCountMap = new Map<string, number>()
    for (const c of comments ?? []) {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) ?? 0) + 1)
    }

    // 3️⃣ 게시판(list)별 집계
    const map = new Map<
      string,
      {
        board: string
        posts: number
        comments: number
        likes: number
        updatedAt: string
      }
    >()

    for (const p of posts) {
      const boardName = p.list?.name ?? 'UNKNOWN'

      if (!map.has(boardName)) {
        map.set(boardName, {
          board: boardName,
          posts: 0,
          comments: 0,
          likes: 0,
          updatedAt: p.created_at,
        })
      }

      const item = map.get(boardName)!
      item.posts += 1
      item.likes += p.like_count ?? 0
      item.comments += commentCountMap.get(p.posts_id) ?? 0

      if (new Date(p.created_at) > new Date(item.updatedAt)) {
        item.updatedAt = p.created_at
      }
    }

    return NextResponse.json(Array.from(map.values()))
  } catch (e) {
    console.error('admin board-stats error:', e)
    return NextResponse.json(
      { error: 'failed to load board stats' },
      { status: 500 }
    )
  }
}
