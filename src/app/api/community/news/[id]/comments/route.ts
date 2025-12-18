// [경로] api/community/news/[id]/comments/route.ts
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

// 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params

    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        user:users!user_id (
          user_id,
          name,
          avatar
        )
      `
      )
      .eq('post_id', articleId)
      .eq('status', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data)
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

    const { data, error } = await supabase
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
