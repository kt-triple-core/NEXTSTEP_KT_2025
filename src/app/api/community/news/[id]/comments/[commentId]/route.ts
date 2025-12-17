// api/community/news/[id]/comments/[commentId]/route.ts
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

// 댓글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const { content, user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 댓글 소유자 확인
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('comment_id', commentId)
      .single()

    if (fetchError) throw fetchError

    if (comment.user_id !== user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 댓글 수정
    const { data, error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('comment_id', commentId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 댓글 소유자 확인
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('comment_id', commentId)
      .single()

    if (fetchError) throw fetchError

    if (comment.user_id !== user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // status를 false로 변경 (soft delete)
    const { error } = await supabase
      .from('comments')
      .update({ status: false })
      .eq('comment_id', commentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
