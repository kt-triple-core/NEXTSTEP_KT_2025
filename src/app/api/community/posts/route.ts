import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { userId, workspaceId, title, content, nodes, edges } = body

    // 워크스페이스 제목이 있을 때 저장
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    let newWorkspaceData: {
      workspace_id: string
      title: string
      created_at: string
    } = {
      workspace_id: '',
      title: '',
      created_at: '',
    }
    // Supabase에 업데이트(workspaces)
    if (workspaceId) {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .update({
          title: title.trim(),
          nodes: nodes || [],
          edges: edges || [],
        })
        .eq('workspace_id', workspaceId)
        .select()
        .single()

      if (workspaceError) {
        console.error('Supabase error:', workspaceError)
        return NextResponse.json(
          {
            error: 'Failed to create workspace',
            details: workspaceError.message,
          },
          { status: 500 }
        )
      }
      newWorkspaceData = { ...workspaceData }
    }
    // Supabase에 저장(workspaces)
    else {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          user_id: userId,
          title: title.trim(),
          nodes: nodes || [],
          edges: edges || [],
        })
        .select()
        .single()

      if (workspaceError) {
        console.error('Supabase error:', workspaceError)
        return NextResponse.json(
          {
            error: 'Failed to create workspace',
            details: workspaceError.message,
          },
          { status: 500 }
        )
      }
      newWorkspaceData = { ...workspaceData }
    }

    // Supabase에 저장(posts)
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title: title.trim(),
        content: content,
        nodes: nodes || [],
        edges: edges || [],
        list_id: 'a61e69b3-d55d-49da-b614-066dfcdc36be',
      })
      .select()
      .single()

    if (postError) {
      console.error('Supabase error:', postError)
      return NextResponse.json(
        {
          error: 'Failed to create workspace',
          details: postError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: newWorkspaceData.workspace_id,
        title: newWorkspaceData.title,
        createdAt: newWorkspaceData.created_at,
        postId: postData.post_id,
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
