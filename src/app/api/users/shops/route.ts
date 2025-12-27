import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const user = await requireUser()

    const url = new URL(req.url)
    const category = url.searchParams.get('category') // accessory | border | title | nickname

    let query = supabase
      .from('decorations')
      .select(
        `
        decoration_id,
        name,
        price,
        category,
        style,
        source,
        text,
        created_at
      `
      )
      .eq('status', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error

    const rows = (data ?? []).map((row, idx) => ({
      no: idx + 1,
      id: row.decoration_id,
      name: row.name,
      price: row.price,
      category: row.category,
      style: row.style,
      source: row.source,
      text: row.text,
    }))

    return NextResponse.json({ rows })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { message: 'Failed to load decorations' },
      { status: 500 }
    )
  }
}
