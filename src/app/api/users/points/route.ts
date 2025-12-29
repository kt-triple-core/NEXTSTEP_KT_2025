import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await requireUser()

    // 해당 유저의 포인트 내역 조회
    const { data, error } = await supabase
      .from('point_history')
      .select('*')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    const rows = (data ?? []).map((row, idx) => ({
      no: idx + 1,
      id: row.point_history_id,
      content: row.content,
      amount: row.amount,
      running_total: row.running_total,
      date: row.created_at,
    }))
    return NextResponse.json({ rows })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to load point history' },
      { status: 500 }
    )
  }
}
