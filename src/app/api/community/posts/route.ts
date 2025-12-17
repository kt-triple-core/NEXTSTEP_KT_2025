import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'

// 커뮤니티 카드 목록 조회
export const GET = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        posts_id,
        title,
        nodes,
        edges,
        like_count,
        created_at
      `
      )
      .eq('status', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 기존 POST (그대로 유지)
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { workspaceId, title, content, nodes, edges } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    let newWorkspaceData = {
      workspace_id: '',
      title: '',
      created_at: '',
    }

    if (workspaceId) {
      const { data, error } = await supabase
        .from('workspaces')
        .update({
          title: title.trim(),
          nodes: nodes || [],
          edges: edges || [],
        })
        .eq('workspace_id', workspaceId)
        .select()
        .single()

      if (error) throw error
      newWorkspaceData = data
    } else {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          user_id: userId,
          title: title.trim(),
          nodes: nodes || [],
          edges: edges || [],
        })
        .select()
        .single()

      if (error) throw error
      newWorkspaceData = data
    }

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title: title.trim(),
        content,
        nodes: nodes || [],
        edges: edges || [],
        list_id: 'a61e69b3-d55d-49da-b614-066dfcdc36be',
      })
      .select()
      .single()

    if (postError) throw postError

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: newWorkspaceData.workspace_id,
        title: newWorkspaceData.title,
        createdAt: newWorkspaceData.created_at,
        postId: postData.posts_id, // ← 여기 중요
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
