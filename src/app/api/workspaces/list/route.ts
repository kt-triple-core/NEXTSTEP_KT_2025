import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export const GET = async () => {
  try {
    // 유저 검증
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', data: {} },
        { status: 401 }
      )
    }

    const userId = session.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session', data: {} },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch workspaces', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      error: null,
      data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
