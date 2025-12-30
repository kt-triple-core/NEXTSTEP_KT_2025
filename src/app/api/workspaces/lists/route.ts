import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'

export const GET = async () => {
  try {
    const { userId } = await requireUser()

    const { data, error } = await supabase
      .from('workspaces')
      .select(
        `
        workspace_id,
        title,
        updated_at,
        roadmaps!inner (
          roadmap_id,
          visibility,
          user_id,
          status
        )
      `
      )
      .eq('roadmaps.user_id', userId)
      .eq('roadmaps.visibility', 'private')
      .eq('roadmaps.status', true)
      .eq('status', true)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch workspaces', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      error: null,
      content: [
        ...data.map((workspace) => ({
          workspaceId: workspace.workspace_id,
          title: workspace.title,
          updatedAt: workspace.updated_at,
        })),
      ],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
