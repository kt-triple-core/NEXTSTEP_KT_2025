import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const listId = searchParams.get('list')

  if (!listId) {
    return NextResponse.json(
      { error: 'list parameter is required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('articles')
    .select(
      `
      article_id,
      title,
      link,
      summary,
      source,
      published_at,
      image_url
    `
    )
    .eq('list', listId)
    .order('published_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
