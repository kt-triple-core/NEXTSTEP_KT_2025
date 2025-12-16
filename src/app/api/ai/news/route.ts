import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRole) {
      return NextResponse.json({ error: 'env missing' }, { status: 500 })
    }

    const res = await fetch(`${url}/functions/v1/sync-news-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRole}`,
      },
    })

    const text = await res.text()

    if (!res.ok) {
      console.error('EDGE ERROR:', text)
      return NextResponse.json({ error: text }, { status: 500 })
    }

    return NextResponse.json(JSON.parse(text))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
