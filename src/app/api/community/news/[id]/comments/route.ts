// [경로] api/community/news/[id]/comments/route.ts
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { buildUserProfileMap } from '@/shared/libs/communityUserMap'

// 댓글 목록 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params

    // 1) 댓글 조회
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('post_id', articleId)
      .eq('status', true)
      .order('created_at', { ascending: true })

    if (commentsError) throw commentsError

    const safeComments = comments ?? []
    if (safeComments.length === 0) return NextResponse.json([])

    // 2) user_id 목록 추출 (중복 제거 + 빈값 제거)
    const userIds = Array.from(
      new Set(safeComments.map((c) => c.user_id).filter(Boolean))
    ) as string[]

    // 공용 유틸 사용: 댓글은 experience도 필요
    const userMap = await buildUserProfileMap(userIds, {
      includeExperience: true,
      borderScale: 0.6,
      accessoryScale: 0.7,
    })

    // 3) comments에 user 붙여서 반환
    const processedData = safeComments.map((comment) => ({
      ...comment,
      user: userMap.get(comment.user_id) ?? null,
    }))

    return NextResponse.json(processedData)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params
    const body = await request.json()
    const { content, parent_comment_id, user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: articleId,
        user_id: user_id,
        content,
        parent_comment_id: parent_comment_id || null,
        status: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
