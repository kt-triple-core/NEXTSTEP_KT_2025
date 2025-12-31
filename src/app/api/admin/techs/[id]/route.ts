import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await context.params
  const { status } = await req.json()

  // 1️⃣ 요청 데이터 조회
  const { data: request, error: fetchError } = await supabaseAdmin
    .from('tech_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return NextResponse.json(
      { error: '요청 데이터를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  // 2️⃣ 요청 상태 업데이트
  const { error: updateError } = await supabaseAdmin
    .from('tech_requests')
    .update({ status })
    .eq('id', requestId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 3️⃣ 승인일 때만 techs 테이블 처리
  if (status === 'approved') {
    // ✅ 3-1. 중복 기술 체크
    const { data: existingTech } = await supabaseAdmin
      .from('techs')
      .select('id')
      .eq('name', request.name)
      .maybeSingle()

    // 이미 존재하면 insert 생략
    if (!existingTech) {
      const { error: insertError } = await supabaseAdmin.from('techs').insert({
        name: request.name,
        description: request.description,
        icon_url: request.icon_url,
      })

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ success: true })
}
