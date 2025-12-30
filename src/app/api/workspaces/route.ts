import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/shared/libs/requireUser'
import { createWorkspace } from '@/shared/libs/workspaceLib'

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()

    const result = await createWorkspace(userId, body)

    return NextResponse.json({
      success: true,
      content: result,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
