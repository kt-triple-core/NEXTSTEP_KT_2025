// shared/libs/workspaceLib.ts
import { supabase } from './supabaseClient'

/**
 * workspace 생성 (private roadmap 포함)
 * 1. roadmaps INSERT (nodes, edges)
 * 2. workspaces INSERT (roadmap_id, title)
 * 3. node_* INSERT (roadmap_id 기준)
 */
export const createWorkspace = async (userId: string, body: any) => {
  const { title, nodes, edges, snapshot } = body

  if (!title || title.trim() === '') {
    throw new Error('title is required')
  }

  // 1. roadmap 생성
  const { data: roadmap, error: roadmapError } = await supabase
    .from('roadmaps')
    .insert({
      user_id: userId,
      nodes: nodes || [],
      edges: edges || [],
      visibility: 'private',
    })
    .select('roadmap_id')
    .single()

  if (roadmapError) {
    console.error('Failed to create roadmap:', roadmapError)
    throw new Error('Failed to create roadmap')
  }

  const roadmapId = roadmap.roadmap_id

  // 2. workspace 생성
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      roadmap_id: roadmapId,
      title: title.trim(),
    })
    .select()
    .single()

  if (workspaceError) {
    console.error('Failed to create workspace:', workspaceError)
    throw new Error('Failed to create workspace')
  }

  // 3. node 데이터 생성
  await createNodeData(userId, roadmapId, snapshot)

  return {
    workspaceId: workspace.workspace_id,
    roadmapId: roadmapId,
    title: workspace.title,
    createdAt: workspace.created_at,
  }
}

/**
 * workspace 업데이트 (private roadmap 포함)
 * 1. workspaces, roadmaps SELECT
 * 2. access
 * 3. roadmaps UPDATE
 * 4. workspaces UPDATE
 * 5~7. node_* UPDATE (roadmap_id 기준)
 */
export const updateWorkspace = async (
  userId: string,
  workspaceId: string,
  body: any
) => {
  const { title, nodes, edges, snapshot } = body

  if (!title || title.trim() === '') {
    throw new Error('title is required')
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
    throw new Error('Workspace not found')
  }

  // 2. 권한 확인
  if (
    !workspace.roadmap ||
    workspace.roadmap.user_id !== userId ||
    workspace.roadmap.visibility !== 'private'
  ) {
    throw new Error('Workspace not found or access denied')
  }

  const roadmapId = workspace.roadmap.roadmap_id

  // 3. roadmap 업데이트
  const { error: roadmapUpdateError } = await supabase
    .from('roadmaps')
    .update({
      nodes: nodes || [],
      edges: edges || [],
      updated_at: new Date().toISOString(),
    })
    .eq('roadmap_id', roadmapId)

  if (roadmapUpdateError) {
    console.error('Failed to update roadmap:', roadmapUpdateError)
    throw new Error('Failed to update roadmap')
  }

  // 4. workspace 업데이트
  const { data: updatedWorkspace, error: workspaceUpdateError } = await supabase
    .from('workspaces')
    .update({
      title: title.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .select()
    .single()

  if (workspaceUpdateError) {
    console.error('Failed to update workspace:', workspaceUpdateError)
    throw new Error('Failed to update workspace')
  }

  // 5. node 데이터 업데이트
  await updateNodeData(userId, roadmapId, snapshot)

  return {
    workspaceId: updatedWorkspace.workspace_id,
    roadmapId: roadmapId,
    title: updatedWorkspace.title,
    updatedAt: updatedWorkspace.updated_at,
  }
}

/**
 * node 데이터 생성 (memos, links, troubleshootings)
 */
const createNodeData = async (
  userId: string,
  roadmapId: string,
  snapshot: any
) => {
  if (!snapshot) return

  // 1. memos 생성
  if (snapshot.memos && Object.keys(snapshot.memos).length > 0) {
    const memosToInsert = Object.entries(snapshot.memos).map(
      ([techId, memo]: [string, any]) => ({
        user_id: userId,
        tech_id: techId,
        roadmap_id: roadmapId,
        memo: memo.memo,
      })
    )

    const { error: memoError } = await supabase
      .from('node_memos')
      .insert(memosToInsert)

    if (memoError) {
      console.error('Failed to create memos:', memoError)
      throw new Error('Failed to create memo')
    }
  }

  // 2. links 생성
  const linksToInsert: any[] = []
  Object.entries(snapshot.links || {}).forEach(
    ([techId, links]: [string, any]) => {
      links.forEach((link: any) => {
        linksToInsert.push({
          user_id: userId,
          tech_id: techId,
          roadmap_id: roadmapId,
          title: link.title,
          url: link.url,
        })
      })
    }
  )

  if (linksToInsert.length > 0) {
    const { error: linkError } = await supabase
      .from('node_links')
      .insert(linksToInsert)

    if (linkError) {
      console.error('Failed to create links:', linkError)
      throw new Error('Failed to create links')
    }
  }

  // 3. troubleshootings 생성
  const troubleshootingsToInsert: any[] = []
  Object.entries(snapshot.troubleshootings || {}).forEach(
    ([techId, troubleshootings]: [string, any]) => {
      troubleshootings.forEach((t: any) => {
        troubleshootingsToInsert.push({
          user_id: userId,
          tech_id: techId,
          roadmap_id: roadmapId,
          troubleshooting: t.troubleshooting,
        })
      })
    }
  )

  if (troubleshootingsToInsert.length > 0) {
    const { error: troubleshootingError } = await supabase
      .from('node_troubleshootings')
      .insert(troubleshootingsToInsert)

    if (troubleshootingError) {
      console.error('Failed to create troubleshootings:', troubleshootingError)
      throw new Error('Failed to create troubleshootings')
    }
  }
}

/**
 * node 데이터 업데이트 (memos, links, troubleshootings)
 */
const updateNodeData = async (
  userId: string,
  roadmapId: string,
  snapshot: any
) => {
  if (!snapshot) return

  // 1. 기존 link, troubleshooting 조회
  const [{ data: linkData }, { data: troubleshootingData }] = await Promise.all(
    [
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
    ]
  )

  const existingLinks = linkData ?? []
  const existingTroubleshootings = troubleshootingData ?? []

  // 2. memo 업데이트
  if (snapshot.memos && Object.keys(snapshot.memos).length > 0) {
    const memosToInsert: any[] = []
    const memosToUpdate: any[] = []

    Object.entries(snapshot.memos).forEach(([techId, memo]: [string, any]) => {
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
    })

    // insert
    if (memosToInsert.length > 0) {
      const { error } = await supabase.from('node_memos').insert(memosToInsert)
      if (error) {
        console.error('Failed to insert memos:', error)
        throw new Error('Failed to insert memos')
      }
    }

    // update
    for (const memo of memosToUpdate) {
      const { error } = await supabase
        .from('node_memos')
        .update({ memo: memo.memo })
        .eq('node_memo_id', memo.node_memo_id)

      if (error) {
        console.error('Failed to update memo:', error)
        throw new Error('Failed to update memo')
      }
    }
  }

  // 3. link 업데이트
  // 3-1. 기존 데이터 매핑
  const existingLinkIds = new Set(existingLinks.map((l) => l.node_link_id))

  // 3-2. diff 탐색
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

  // 3-3. DB 반영
  if (linkIdsToDelete.length > 0) {
    const { error } = await supabase
      .from('node_links')
      .delete()
      .in('node_link_id', linkIdsToDelete)

    if (error) {
      console.error('Failed to delete links:', error)
      throw new Error('Failed to delete links')
    }
  }

  if (linksToInsert.length > 0) {
    const { error } = await supabase.from('node_links').insert(linksToInsert)
    if (error) {
      console.error('Failed to insert links:', error)
      throw new Error('Failed to insert links')
    }
  }

  // 4. troubleshooting 업데이트
  // 4-1. 기존 데이터 매핑
  const existingTroubleIds = new Set(
    existingTroubleshootings.map((t) => t.node_troubleshooting_id)
  )

  // 4-2. diff 탐색
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

  // 4-3. DB 반영
  if (troubleIdsToDelete.length > 0) {
    const { error } = await supabase
      .from('node_troubleshootings')
      .delete()
      .in('node_troubleshooting_id', troubleIdsToDelete)

    if (error) {
      console.error('Failed to delete troubleshootings:', error)
      throw new Error('Failed to delete troubleshootings')
    }
  }

  if (troublesToInsert.length > 0) {
    const { error } = await supabase
      .from('node_troubleshootings')
      .insert(troublesToInsert)

    if (error) {
      console.error('Failed to insert troubleshootings:', error)
      throw new Error('Failed to insert troubleshootings')
    }
  }
}
