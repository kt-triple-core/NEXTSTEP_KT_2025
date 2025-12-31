import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'
import { createWorkspace, updateWorkspace } from '@/shared/libs/workspaceLib'
import { cloneRoadmapAsPublic } from '@/shared/libs/roadmapLib'
import type { PostWithRoadmap } from '@/features/community/model/types'

// ✅ 공용 유틸 (decorations + experience까지 필요하면 이걸)
import { buildUserProfileMap } from '@/shared/libs/communityUserMap'

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

    if (listId) query = query.eq('list_id', listId)

    const { data: posts, error } = await query.returns<PostWithRoadmap[]>()
    if (error) throw error

    const safePosts = posts ?? []
    if (safePosts.length === 0) return NextResponse.json([])

    // 1) 작성자 user_id 수집
    const userIds = Array.from(
      new Set(safePosts.map((p) => p.roadmap?.user_id).filter(Boolean))
    ) as string[]

    // 2) authorMap 만들기 (decorations + experience까지)
    //    - experience가 "배열"이어야 하면 유틸 수정 필요.
    //    - 현재 유틸은 experience: {field, year} | null 형태
    const authorMap = await buildUserProfileMap(userIds, {
      includeExperience: true,
      borderScale: 0.6,
      accessoryScale: 0.7,
    })

    // 3) posts에 author 붙여서 반환
    const result = safePosts.map((p) => {
      const authorId = p.roadmap?.user_id ?? null

      return {
        ...p,
        authorId,
        author: authorId ? (authorMap.get(authorId) ?? null) : null,
      }
    })

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
// 게시글 작성
// ================================
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { workspaceId, content, listId } = body

    // 1) workspace, roadmap, node 정보 저장
    const result = workspaceId
      ? await updateWorkspace(userId, workspaceId, body)
      : await createWorkspace(userId, body)

    // 2) public roadmap 복제
    const publicRoadmapId = await cloneRoadmapAsPublic(userId, result.roadmapId)

    // 3) post 생성
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
