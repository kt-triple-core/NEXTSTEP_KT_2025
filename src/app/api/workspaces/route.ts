import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { title, nodes, edges, snapshot } = body

    // 워크스페이스 제목이 있을 때 저장
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // 1. 워크스페이스 Supabase에 저장
    const { data: workspace, error: workspaceError } = await supabase
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

    const workspaceId = workspace.workspace_id

    // 2. 메모 저장
    if (snapshot.memos && Object.keys(snapshot.memos).length > 0) {
      // 모든 노드에 대한 메모 정보(user_id, workspace_id, tech_id, memo)를 배열 형태로 생성
      // [
      //   {user_id: 'xx', tech_id: 'xx', workspace_id: 'xx', memo: 'xx'},
      //   {user_id: 'xx', tech_id: 'xx', workspace_id: 'xx', memo: 'yy'}
      // ]
      const memosToInsert = Object.entries(snapshot.memos).map(
        ([techId, memo]: [string, any]) => ({
          user_id: userId,
          tech_id: techId,
          workspace_id: workspaceId,
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

    // 3. 자료 저장
    // 모든 노드에 대한 자료 정보(user_id, workspace_id, tech_id, title, url)를 배열 형태로 생성
    // [
    //   {user_id: 'xx', tech_id: 'xx', workspace_id: 'xx', title: 'xx', url: 'xx'},
    //   {user_id: 'xx', tech_id: 'xx', workspace_id: 'xx', title: 'yy', url: 'yy'}
    // ]
    const linksToInsert: any[] = []
    Object.entries(snapshot.links || {}).forEach(
      ([techId, links]: [string, any]) => {
        links.forEach((link: any) => {
          linksToInsert.push({
            user_id: userId,
            tech_id: techId,
            workspace_id: workspaceId,
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

    // 4. 트러블슈팅 저장
    // 모든 노드에 대한 트러블슈팅 정보(user_id, workspace_id, tech_id, troubleshooting)를 배열 형태로 생성
    // [
    //   {user_id: 'xx', tech_id: 'xx', workspace_id: 'xx', troubleshooting: 'xx'},
    //   {user_id: 'xx', tech_id: 'xx', workspace_id: 'xx', troubleshooting: 'yy'}
    // ]
    const troubleshootingsToInsert: any[] = []
    Object.entries(snapshot.troubleshootings || {}).forEach(
      ([techId, troubleshootings]: [string, any]) => {
        troubleshootings.forEach((t: any) => {
          troubleshootingsToInsert.push({
            user_id: userId,
            tech_id: techId,
            workspace_id: workspaceId,
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
        workspaceId,
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
