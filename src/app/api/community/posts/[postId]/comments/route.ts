// app/api/community/posts/[postId]/comments/route.ts

import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

// 댓글 목록 조회
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params

    // 1단계: 댓글만 먼저 가져오기
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', true)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Comments error:', commentsError)
      throw commentsError
    }

    console.log('Comments:', comments)

    // 2단계: user_id 목록 추출
    const userIds = [...new Set(comments.map((c) => c.user_id))]

    // 3단계: users 정보 가져오기
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('user_id, name, avatar')
      .in('user_id', userIds)

    if (usersError) {
      console.error('Users error:', usersError)
    }

    console.log('Users:', users)

    // 4단계: experiences 정보 가져오기
    const { data: experiences, error: expError } = await supabaseAdmin
      .from('experiences')
      .select('user_id, field, year')
      .in('user_id', userIds)
      .eq('status', true)

    if (expError) {
      console.error('Experiences error:', expError)
    }

    console.log('Experiences:', experiences)

    // 5단계: 데이터 합치기
    const processedData = comments.map((comment) => {
      const user = users?.find((u) => u.user_id === comment.user_id)
      const experience = experiences?.find((e) => e.user_id === comment.user_id)

      return {
        ...comment,
        user: user
          ? {
              ...user,
              experience: experience || null,
            }
          : null,
      }
    })

    console.log('Processed data:', processedData)

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
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params
    const body = await request.json()
    const { content, parent_comment_id, user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
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
