import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await requireUser()

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        order_id,
        created_at,
        decorations (
          decoration_id,
          name,
          price,
          category,
          style,
          source,
          text
        )
      `
      )
      .eq('user_id', user.userId)
      .eq('status', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    const rows = (data ?? []).map((row: any, idx: number) => {
      const deco = Array.isArray(row.decorations)
        ? row.decorations[0]
        : row.decorations

      return {
        no: idx + 1,
        orderId: row.order_id,
        decorationId: deco?.decoration_id ?? null,
        name: deco?.name ?? null,
        category: deco?.category ?? null,
        price: deco?.price ?? null,
        style: deco?.style ?? null,
        source: deco?.source ?? null,
        text: deco?.text ?? null,
        purchasedAt: row.created_at,
      }
    })

    return NextResponse.json({ rows })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to load order history' },
      { status: 500 }
    )
  }
}
