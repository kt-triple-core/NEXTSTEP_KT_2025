import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } //  Promise 타입 명시
) {
  // await로 params unwrap
  const { id: articleId } = await params

  // console.log('🔥 Article ID:', articleId)

  if (!articleId) {
    return NextResponse.json(
      { error: 'article_id is required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('article_id', articleId)
    .single()

  if (error) {
    // console.log('❌ Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // console.log('✅ Data found:', data)
  return NextResponse.json(data)
}
