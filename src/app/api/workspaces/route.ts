import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'

// 1. roadmaps INSERT (nodes, edges)
// 2. workspaces INSERT (roadmap_id, title)
// 3. node_* INSERT (roadmap_id 기준)
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { title, nodes, edges, snapshot } = body

    // 워크스페이스 제목이 있을 때 저장
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // 1. 로드맵 저장
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
      return NextResponse.json(
        { error: 'Failed to create roadmap' },
        { status: 500 }
      )
    }

    const roadmapId = roadmap.roadmap_id

    // 2. 워크스페이스 저장
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        roadmap_id: roadmapId,
        title: title.trim(),
      })
      .select()
      .single()

    if (workspaceError) {
      return NextResponse.json(
        { error: 'Failed to create workspace' },
        { status: 500 }
      )
    }

    // 3-1. 메모 저장
    if (snapshot.memos && Object.keys(snapshot.memos).length > 0) {
      // 모든 노드에 대한 메모 정보(user_id, roadmap_id, tech_id, memo)를 배열 형태로 생성
      // [
      //   {user_id: 'xx', tech_id: 'xx', roadmap_id: 'xx', memo: 'xx'},
      //   {user_id: 'xx', tech_id: 'xx', roadmap_id: 'xx', memo: 'yy'}
      // ]
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
        console.error('Supabase error:', memoError)
        return NextResponse.json(
          {
            error: 'Failed to create memo',
            details: memoError.message,
          },
          { status: 500 }
        )
      }
    }

    // 3-2. 자료 저장
    // 모든 노드에 대한 자료 정보(user_id, roadmap_id, tech_id, title, url)를 배열 형태로 생성
    // [
    //   {user_id: 'xx', tech_id: 'xx', roadmap_id: 'xx', title: 'xx', url: 'xx'},
    //   {user_id: 'xx', tech_id: 'xx', roadmap_id: 'xx', title: 'yy', url: 'yy'}
    // ]
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
        console.error('Supabase error:', linkError)
        return NextResponse.json(
          {
            error: 'Failed to create links',
            details: linkError.message,
          },
          { status: 500 }
        )
      }
    }

    // 3-3. 트러블슈팅 저장
    // 모든 노드에 대한 트러블슈팅 정보(user_id, roadmap_id, tech_id, troubleshooting)를 배열 형태로 생성
    // [
    //   {user_id: 'xx', tech_id: 'xx', roadmap_id: 'xx', troubleshooting: 'xx'},
    //   {user_id: 'xx', tech_id: 'xx', roadmap_id: 'xx', troubleshooting: 'yy'}
    // ]
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
        console.error('Supabase error:', troubleshootingError)
        return NextResponse.json(
          {
            error: 'Failed to create troubleshootings',
            details: troubleshootingError.message,
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: workspace.workspace_id,
        title: workspace.title,
        createdAt: workspace.created_at,
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
