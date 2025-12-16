import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { userId, title, description, nodes, edges } = body

    // 워크스페이스 제목이 있을 때 저장
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Supabase에 저장
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

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create workspace',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: data.workspace_id,
        title: data.title,
        createdAt: data.created_at,
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
