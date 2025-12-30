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

    // 1. workspace 조회
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('workspace_id, roadmap_id, title, updated_at')
      .eq('workspace_id', workspaceId)
      .eq('status', true)
      .maybeSingle()

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // 2. roadmap 조회(실제 데이터)
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .select('roadmap_id, user_id, nodes, edges')
      .eq('roadmap_id', workspace.roadmap_id)
      .eq('status', true)
      .maybeSingle()

    if (roadmapError || !roadmap || roadmap.user_id !== userId) {
      return NextResponse.json(
        { error: 'Roadmap not found or access denied' },
        { status: 403 }
      )
    }

    const roadmapId = roadmap.roadmap_id

    // techId 추출
    const techIds = (roadmap.nodes ?? [])
      .map((node: any) => node.data?.techId)
      .filter((id: string) => id && id !== 'start')

    // techId 없는 경우
    if (techIds.length === 0) {
      return NextResponse.json({
        success: true,
        content: {
          workspaceId: workspace.workspace_id,
          title: workspace.title,
          nodes: roadmap.nodes,
          edges: roadmap.edges,
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
          .eq('status', true)
          .in('tech_id', techIds)
          .in('roadmap_id', [roadmapId]),

        supabase
          .from('node_links')
          .select('*')
          .eq('status', true)
          .in('tech_id', techIds)
          .in('roadmap_id', [roadmapId]),

        supabase
          .from('node_troubleshootings')
          .select('*')
          .eq('status', true)
          .in('tech_id', techIds)
          .in('roadmap_id', [roadmapId]),
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
        nodes: roadmap.nodes,
        edges: roadmap.edges,
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
    const { title, nodes, edges, snapshot } = body

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

    // 1. workspace + roadmap 조회
    type WorkspaceWithRoadmap = {
      workspace_id: string
      title: string
      roadmap_id: string
      updated_at: string
      roadmap: {
        roadmap_id: string
        user_id: string
        visibility: 'private' | 'public'
      }
    }

    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select(
        `
      workspace_id,
      title,
      roadmap_id,
      updated_at,
      roadmap:roadmaps!inner (
        roadmap_id,
        user_id,
        visibility
      )
    `
      )
      .eq('workspace_id', workspaceId)
      .eq('status', true)
      .maybeSingle<WorkspaceWithRoadmap>()

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // 2. roadmap 추출
    if (
      !workspace.roadmap ||
      workspace.roadmap.user_id !== userId ||
      workspace.roadmap.visibility !== 'private'
    ) {
      return NextResponse.json(
        { error: 'Workspace not found or access denied' },
        { status: 403 }
      )
    }

    const roadmapId = workspace.roadmap.roadmap_id

    // 3. 업데이트
    const { error: roadmapUpdateError } = await supabase
      .from('roadmaps')
      .update({
        nodes: nodes || [],
        edges: edges || [],
        updated_at: new Date().toISOString(),
      })
      .eq('roadmap_id', roadmapId)

    if (roadmapUpdateError) {
      return NextResponse.json(
        { error: 'Failed to update roadmap' },
        { status: 500 }
      )
    }
    const { error: workspaceUpdateError } = await supabase
      .from('workspaces')
      .update({
        title: title.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)

    if (workspaceUpdateError) {
      return NextResponse.json(
        { error: 'Failed to update workspace' },
        { status: 500 }
      )
    }

    // 4. 기존 link, troubleshooting 조회
    const [{ data: linkData }, { data: troubleshootingData }] =
      await Promise.all([
        supabase
          .from('node_links')
          .select('*')
          .eq('roadmap_id', roadmapId)
          .eq('status', true),

        supabase
          .from('node_troubleshootings')
          .select('*')
          .eq('roadmap_id', roadmapId)
          .eq('status', true),
      ])

    const existingLinks = linkData ?? []
    const existingTroubleshootings = troubleshootingData ?? []

    // 5. memo 저장
    // 5-1. memo 덮어쓰기
    if (snapshot.memos && Object.keys(snapshot.memos).length > 0) {
      const memosToInsert: any[] = []
      const memosToUpdate: any[] = []

      Object.entries(snapshot.memos).forEach(
        ([techId, memo]: [string, any]) => {
          if (memo.nodeMemoId) {
            // 기존 row 업데이트
            memosToUpdate.push({
              node_memo_id: memo.nodeMemoId,
              memo: memo.memo,
            })
          } else {
            // 새로 삽입
            memosToInsert.push({
              user_id: userId,
              tech_id: techId,
              roadmap_id: roadmapId,
              memo: memo.memo,
            })
          }
        }
      )

      // insert
      if (memosToInsert.length > 0) {
        await supabase.from('node_memos').insert(memosToInsert)
      }

      // update
      for (const memo of memosToUpdate) {
        await supabase
          .from('node_memos')
          .update({ memo: memo.memo })
          .eq('node_memo_id', memo.node_memo_id)
      }
    }

    // 6. link 저장
    // 6-1. 기존 데이터 매핑
    const existingLinkIds = new Set(existingLinks.map((l) => l.node_link_id))

    // 6-2. diff 탐색
    const snapshotLinkIds = new Set<string>()
    const linksToInsert: any[] = []

    Object.entries(
      snapshot.links as Record<
        string,
        { nodeLinkId?: string; title: string; url: string }[]
      >
    ).forEach(([techId, links]) => {
      links.forEach((link) => {
        if (link.nodeLinkId && existingLinkIds.has(link.nodeLinkId)) {
          snapshotLinkIds.add(link.nodeLinkId)
        } else {
          linksToInsert.push({
            user_id: userId,
            roadmap_id: roadmapId,
            tech_id: techId,
            title: link.title,
            url: link.url,
          })
        }
      })
    })

    const linkIdsToDelete = [...existingLinkIds].filter(
      (id) => !snapshotLinkIds.has(id)
    )

    // 6-3. DB 반영
    if (linkIdsToDelete.length > 0) {
      await supabase
        .from('node_links')
        .delete()
        .in('node_link_id', linkIdsToDelete)
    }

    if (linksToInsert.length > 0) {
      await supabase.from('node_links').insert(linksToInsert)
    }

    // 7. troubleshooting 저장
    // 7-1. 기존 데이터 매핑
    const existingTroubleIds = new Set(
      existingTroubleshootings.map((t) => t.node_troubleshooting_id)
    )

    // 7-2. diff 탐색
    const snapshotTroubleIds = new Set<string>()
    const troublesToInsert: any[] = []

    Object.entries(
      snapshot.troubleshootings as Record<
        string,
        { nodeTroubleshootingId?: string; troubleshooting: string }[]
      >
    ).forEach(([techId, troubles]) => {
      troubles.forEach((t) => {
        if (
          t.nodeTroubleshootingId &&
          existingTroubleIds.has(t.nodeTroubleshootingId)
        ) {
          snapshotTroubleIds.add(t.nodeTroubleshootingId)
        } else {
          troublesToInsert.push({
            user_id: userId,
            roadmap_id: roadmapId,
            tech_id: techId,
            troubleshooting: t.troubleshooting,
          })
        }
      })
    })
    const troubleIdsToDelete = [...existingTroubleIds].filter(
      (id) => !snapshotTroubleIds.has(id)
    )

    // 7-3. DB 반영
    if (troubleIdsToDelete.length > 0) {
      await supabase
        .from('node_troubleshootings')
        .delete()
        .in('node_troubleshooting_id', troubleIdsToDelete)
    }

    if (troublesToInsert.length > 0) {
      await supabase.from('node_troubleshootings').insert(troublesToInsert)
    }

    return NextResponse.json({
      success: true,
      content: {
        workspace_id: workspace.workspace_id,
        title: workspace.title,
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
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('workspace_id, roadmap_id')
      .eq('workspace_id', workspaceId)
      .eq('status', true)
      .maybeSingle()

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .select('roadmap_id, user_id')
      .eq('roadmap_id', workspace.roadmap_id)
      .eq('status', true)
      .maybeSingle()

    if (roadmapError || !roadmap || roadmap.user_id !== userId) {
      return NextResponse.json(
        { error: 'Roadmap not found or access denied' },
        { status: 403 }
      )
    }

    // soft delete
    const { data: deletedRoadmap, error: deleteRoadmapError } = await supabase
      .from('roadmaps')
      .update({
        status: false,
        updated_at: new Date().toISOString(),
      })
      .eq('roadmap_id', roadmap.roadmap_id)
      .select()
      .single()

    if (deleteRoadmapError || !deletedRoadmap) {
      console.error('Supabase error:', deleteRoadmapError)
      return NextResponse.json(
        {
          error: 'Failed to delete roadmap',
          details: deleteRoadmapError?.message,
        },
        { status: 500 }
      )
    }

    const { data: deletedWorkspace, error: deleteWorkspaceError } =
      await supabase
        .from('workspaces')
        .update({
          status: false,
          updated_at: new Date().toISOString(),
        })
        .eq('workspace_id', workspace.workspace_id)
        .select()
        .single()

    if (deleteWorkspaceError || !deletedWorkspace) {
      console.error('Supabase error:', deleteWorkspaceError)
      return NextResponse.json(
        {
          error: 'Failed to delete workspace',
          details: deleteWorkspaceError?.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: workspace.workspace_id,
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
