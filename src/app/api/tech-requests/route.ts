import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { createServerSupabase } from '@/shared/libs/supabaseServer'

export async function POST(req: Request) {
  try {
    // 1️⃣ 현재 로그인한 사용자 가져오기
    const supabase = createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // 2️⃣ 요청 데이터 파싱
    const { name, description, icon_url } = await req.json()

    if (!name || !description) {
      return NextResponse.json(
        { error: 'name and description required' },
        { status: 400 }
      )
    }

    // 3️⃣ tech_requests에 저장 (⭐ user_id 추가)
    const { error } = await supabaseAdmin.from('tech_requests').insert({
      name,
      description,
      icon_url: icon_url || null,
      user_id: user.id, // ✅ 핵심
      status: 'pending',
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('tech request error:', e)
    return NextResponse.json(
      { error: 'failed to create tech request' },
      { status: 500 }
    )
  }
}
