import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import { requireUser } from '@/shared/libs/requireUser'

type Body = {
  decorationId: string
}

export async function POST(req: Request) {
  try {
    // 1️ 로그인 체크
    await requireUser()

    // 2️ body 파싱
    const body = (await req.json()) as Body
    const decorationId = body.decorationId?.trim()

    if (!decorationId) {
      return NextResponse.json(
        { message: 'decorationId is required' },
        { status: 400 }
      )
    }

    // 3️ Supabase RPC 호출 (트랜잭션)
    const { data, error } = await supabase.rpc('purchase_decoration', {
      p_decoration_id: decorationId,
    })

    if (error) {
      const msg = error.message ?? ''

      // 의미 있는 에러 매핑
      if (msg.includes('INSUFFICIENT_POINT')) {
        return NextResponse.json(
          { message: '포인트가 부족합니다.' },
          { status: 409 }
        )
      }

      if (msg.includes('ITEM_NOT_FOUND')) {
        return NextResponse.json(
          { message: '상품을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      if (msg.includes('UNAUTHORIZED')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      return NextResponse.json(
        { message: '구매 처리 중 오류가 발생했습니다.', detail: msg },
        { status: 500 }
      )
    }

    // 4️ 성공 응답
    return NextResponse.json({
      message: '구매 완료',
      result: data, // { orderId, decorationId, itemName, spent, newPoint }
    })
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { message: 'Failed to purchase', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
