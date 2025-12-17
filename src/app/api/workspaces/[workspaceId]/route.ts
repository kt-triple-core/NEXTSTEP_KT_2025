import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await requireUser()

    const { workspaceId } = await params
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: data.workspace_id,
        title: data.title,
        nodes: data.nodes,
        edges: data.edges,
        updatedAd: data.updated_at,
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await requireUser()
    const { workspaceId } = await params
    const body = await req.json()
    const { title, nodes, edges } = body

    // 입력 검증
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      )
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // 워크스페이스 소유자 확인
    const { data: existingWorkspace, error: checkError } = await supabase
      .from('workspaces')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .single()

    if (checkError || !existingWorkspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    if (existingWorkspace.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 업데이트
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

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update workspace',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        workspace_id: data.id,
        title: data.title,
        updatedAt: data.updated_at,
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
