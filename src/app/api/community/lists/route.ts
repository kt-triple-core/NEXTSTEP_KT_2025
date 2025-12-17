import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'

export async function GET() {
  const { data, error } = await supabase
    .from('lists')
    .select(
      `
      list_id,
      name,
      status
    `
    )
    .eq('status', true)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
