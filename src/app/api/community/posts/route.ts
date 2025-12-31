import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { createWorkspace, updateWorkspace } from '@/shared/libs/workspaceLib'
import { cloneRoadmapAsPublic } from '@/shared/libs/roadmapLib'
import { PostWithRoadmap } from '@/features/community/model/types'

// ================================
// 커뮤니티 카드 목록 조회
// ================================
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const listId = searchParams.get('list')

    let query = supabase
      .from('posts')
      .select(
        `
          post_id,
          title,
          content,
          like_count,
          roadmap_id,
          created_at,
          updated_at,
          roadmap:roadmaps!inner (
            roadmap_id,
            user_id,
            nodes,
            edges,
            visibility,
            status
          )
        `
      )
      .eq('status', true)
      .eq('roadmap.status', true)
      .order('created_at', { ascending: false })

    if (listId) {
      query = query.eq('list_id', listId)
    }

    const { data: posts, error } = await query.returns<PostWithRoadmap[]>()
    if (error) throw error

    const safePosts = posts ?? []
    if (safePosts.length === 0) {
      return NextResponse.json([])
    }

    // --------------------------------
    // user_id 수집
    // --------------------------------
    const userIds = Array.from(
      new Set(safePosts.map((p) => p.roadmap.user_id).filter(Boolean))
    )

    // --------------------------------
    // users 조회 (기존 그대로)
    // --------------------------------
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('user_id, name, avatar')
      .in('user_id', userIds)

    if (userError) throw userError

    // --------------------------------
    // experience 조회 (추가된 부분)
    // --------------------------------
    const { data: experiences, error: expError } = await supabaseAdmin
      .from('experiences')
      .select('user_id, field, year')
      .in('user_id', userIds)
      .eq('status', true)

    if (expError) throw expError

    // --------------------------------
    // experience를 user_id 기준으로 묶기
    // --------------------------------
    const experienceMap = new Map<string, { field: string; year: number }[]>()

    ;(experiences ?? []).forEach((exp) => {
      if (!experienceMap.has(exp.user_id)) {
        experienceMap.set(exp.user_id, [])
      }
      experienceMap.get(exp.user_id)!.push({
        field: exp.field,
        year: exp.year,
      })
    })

    // --------------------------------
    // userMap 생성 (기존 + experiences만 추가)
    // --------------------------------
    const userMap = new Map(
      (users ?? []).map((u) => [
        u.user_id,
        {
          user_id: u.user_id,
          name: u.name,
          avatar: u.avatar,
          experiences: experienceMap.get(u.user_id) ?? [],
        },
      ])
    )

    // --------------------------------
    // post에 users 붙이기
    // --------------------------------
    const result = safePosts.map((p) => ({
      ...p,
      users: userMap.get(p.roadmap.user_id) ?? null,
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

// ================================
// 커뮤니티 글 생성
// ================================
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { workspaceId, content, listId } = body

    let result
    if (workspaceId) {
      result = await updateWorkspace(userId, workspaceId, body)
    } else {
      result = await createWorkspace(userId, body)
    }

    const publicRoadmapId = await cloneRoadmapAsPublic(userId, result.roadmapId)

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        roadmap_id: publicRoadmapId,
        list_id: listId,
        title: result.title,
        content,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      content: {
        workspaceId: result.workspaceId,
        title: result.title,
        createdAt: result.createdAt,
        postId: post.post_id,
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
