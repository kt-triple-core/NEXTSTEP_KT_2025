import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const { name, description, icon_url } = await req.json()

    const { error } = await supabaseAdmin.from('tech_requests').insert({
      name,
      description,
      icon_url,
      status: 'pending',
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'failed to request tech' },
      { status: 500 }
    )
  }
}
