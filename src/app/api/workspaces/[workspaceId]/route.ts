import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

// GET 요청 시, link, trounbleshooting을 tech_id로 묶기
const groupByTechId = <T extends { tech_id: string }>(rows: T[]) =>
  rows.reduce<Record<string, T[]>>((acc, row) => {
    const techId = row.tech_id
    if (!acc[techId]) acc[techId] = []
    acc[techId].push(row)
    return acc
  }, {})

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await requireUser()
    const { workspaceId } = await params

    // 워크스페이스 조회
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('status', true)
      .maybeSingle()

    if (error || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // techId 추출
    const techIds = (workspace.nodes ?? [])
      .map((node: any) => node.data?.techId)
      .filter((id: string) => id && id !== 'start')

    // techId 없는 경우
    if (techIds.length === 0) {
      return NextResponse.json({
        success: true,
        content: {
          workspaceId: workspace.workspace_id,
          title: workspace.title,
          nodes: workspace.nodes,
          edges: workspace.edges,
          memos: [],
          links: [],
          troubleshootings: [],
          updatedAt: workspace.updated_at,
        },
      })
    }

    // memo, link, troubleshooting 조회
    const [{ data: memos }, { data: links }, { data: troubleshootings }] =
      await Promise.all([
        supabase
          .from('node_memos')
          .select('*')
          .eq('user_id', userId)
          .eq('status', true)
          .in('tech_id', techIds),

        supabase
          .from('node_links')
          .select('*')
          .eq('user_id', userId)
          .eq('status', true)
          .in('tech_id', techIds),

        supabase
          .from('node_troubleshootings')
          .select('*')
          .eq('user_id', userId)
          .eq('status', true)
          .in('tech_id', techIds),
      ])

    const sanitizedMemos = Object.fromEntries(
      (memos ?? []).map((memo) => [
        memo.tech_id,
        {
          nodeMemoId: memo.node_memo_id,
          memo: memo.memo,
        },
      ])
    )

    // tech_id 기준 group
    const linksByTechId = groupByTechId(links ?? [])
    const troubleshootingsByTechId = groupByTechId(troubleshootings ?? [])

    // user_id 제거 + 응답용 구조로 정제
    const sanitizedLinks = Object.fromEntries(
      Object.entries(linksByTechId).map(([techId, rows]) => [
        techId,
        rows.map(
          ({
            node_link_id,
            user_id,
            tech_id,
            url,
            title,
            created_at,
            updated_at,
          }) => ({
            nodeLinkId: node_link_id,
            url,
            title,
            createdAt: created_at,
            updatedAt: updated_at,
          })
        ),
      ])
    )

    const sanitizedTroubleshootings = Object.fromEntries(
      Object.entries(troubleshootingsByTechId).map(([techId, rows]) => [
        techId,
        rows.map(
          ({
            node_troubleshooting_id,
            user_id,
            tech_id,
            troubleshooting,
            created_at,
            updated_at,
          }) => ({
            nodeTroubleshootingId: node_troubleshooting_id,
            troubleshooting,
            createdAt: created_at,
            updatedAt: updated_at,
          })
        ),
      ])
    )

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: workspace.workspace_id,
        title: workspace.title,
        nodes: workspace.nodes,
        edges: workspace.edges,
        memos: sanitizedMemos,
        links: sanitizedLinks,
        troubleshootings: sanitizedTroubleshootings,
        updatedAt: workspace.updated_at,
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
        updated_at: new Date().toISOString(),
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await requireUser()
    const { workspaceId } = await params

    // 검증
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      )
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

    // soft delete
    const { data, error } = await supabase
      .from('workspaces')
      .update({
        status: false,
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete workspace',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: data.workspace_id,
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
