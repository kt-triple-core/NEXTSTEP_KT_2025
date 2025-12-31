import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const { name, description, icon_url } = await req.json()

  const { error } = await supabaseAdmin
    .from('tech_requests')
    .update({
      name,
      description,
      icon_url,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
