import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

// 커뮤니티 카드 목록 조회
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const listId = searchParams.get('list')

    let query = supabase
      .from('posts')
      .select(
        `
        posts_id,
        user_id,
        title,
        nodes,
        edges,
        like_count,
        created_at
      `
      )
      .eq('status', true)
      .order('created_at', { ascending: false })

    // ⭐ list 버튼을 눌렀을 때만 필터링
    if (listId) {
      query = query.eq('list_id', listId)
    }

    const { data: posts, error } = await query
    if (error) throw error

    const safePosts = posts ?? []
    if (safePosts.length === 0) return NextResponse.json([])

    // 2) post에 있는 user_id들만 뽑아서 users 조회
    const userIds = Array.from(
      new Set(safePosts.map((p) => p.user_id).filter(Boolean))
    )

    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('user_id, name, avatar')
      .in('user_id', userIds)

    if (userError) throw userError

    const userMap = new Map(
      (users ?? []).map((u) => [
        u.user_id,
        { user_id: u.user_id, name: u.name, avatar: u.avatar },
      ])
    )
    const result = safePosts.map((p) => ({
      ...p,
      users: userMap.get(p.user_id) ?? null,
    }))
    return NextResponse.json(result)
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
    const { workspaceId, title, content, nodes, edges, listId } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // 워크스페이스를 workspaces에 저장
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

    // 워크스페이스를 posts에 저장
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title: title.trim(),
        content,
        nodes: nodes || [],
        edges: edges || [],
        list_id: listId,
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
