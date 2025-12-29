import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { techId, memo } = body

    // 메모가 있을 때 저장
    if (!memo || memo.trim() === '') {
      return NextResponse.json({ error: 'memo is required' }, { status: 400 })
    }

    // Supabase에 저장
    const { data, error } = await supabase
      .from('node_memos')
      .upsert(
        {
          user_id: userId,
          tech_id: techId,
          memo,
        },
        {
          onConflict: 'user_id,tech_id',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create memo',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        techId: data.tech_id,
        memo: data.memo,
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
