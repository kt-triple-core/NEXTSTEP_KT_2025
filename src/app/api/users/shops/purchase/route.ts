import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { requireUser } from '@/shared/libs/requireUser'

type Body = {
  decorationId: string
}

export async function POST(req: Request) {
  try {
    const user = await requireUser() // 여기서 user.userId 사용

    const body = (await req.json()) as Body
    const decorationId = body.decorationId?.trim()

    if (!decorationId) {
      return NextResponse.json(
        { message: 'decorationId is required' },
        { status: 400 }
      )
    }

    // 1) 상품 조회
    const { data: deco, error: decoErr } = await supabaseAdmin
      .from('decorations')
      .select('decoration_id, name, price, status, category')
      .eq('decoration_id', decorationId)
      .single()

    if (decoErr || !deco || deco.status !== true) {
      return NextResponse.json(
        { message: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 상품 카테고리 별 이름 재할당
    let cate = ''

    switch (deco.category) {
      case 'accessory':
        cate = '악세서리'
        break
      case 'border':
        cate = '테두리'
        break
      case 'title':
        cate = '칭호'
        break
      case 'nickname':
        cate = '닉네임'
        break
      default:
        cate = ''
    }

    // 2) 중복 구매 체크(orders)
    const { data: exists, error: existsErr } = await supabaseAdmin
      .from('orders')
      .select('order_id')
      .eq('user_id', user.userId)
      .eq('decoration_id', decorationId)
      .eq('status', true)
      .maybeSingle()

    if (existsErr) throw existsErr
    if (exists) {
      return NextResponse.json(
        { message: '이미 구매한 아이템입니다.' },
        { status: 409 }
      )
    }

    // 3) 유저 포인트 조회
    const { data: me, error: meErr } = await supabaseAdmin
      .from('users')
      .select('user_id, point, status')
      .eq('user_id', user.userId)
      .single()

    if (meErr || !me || me.status !== true) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const currentPoint = me.point ?? 0
    const price = deco.price ?? 0

    if (currentPoint < price) {
      return NextResponse.json(
        { message: '포인트가 부족합니다.' },
        { status: 409 }
      )
    }

    const newPoint = currentPoint - price

    // ---- 여기부터 3테이블 업데이트 ----
    // 완전 트랜잭션은 아니지만, 실패 시 최대한 복구 시도

    // A) orders insert
    const { data: orderRow, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.userId,
        decoration_id: decorationId,
        status: true,
      })
      .select('order_id')
      .single()

    if (orderErr || !orderRow) throw orderErr

    // B) users.point update
    const { error: updErr } = await supabaseAdmin
      .from('users')
      .update({ point: newPoint })
      .eq('user_id', user.userId)

    if (updErr) {
      // 롤백 시도: 주문 취소
      await supabaseAdmin
        .from('orders')
        .update({ status: false })
        .eq('order_id', orderRow.order_id)

      throw updErr
    }

    // C) point_history insert
    const { error: histErr } = await supabaseAdmin
      .from('point_history')
      .insert({
        user_id: user.userId,
        amount: -price,
        content: `상점 구매: ${cate} (${deco.name})`,
        running_total: newPoint,
      })

    if (histErr) {
      // 롤백 시도: 포인트 복구 + 주문 취소
      await supabaseAdmin
        .from('users')
        .update({ point: currentPoint })
        .eq('user_id', user.userId)

      await supabaseAdmin
        .from('orders')
        .update({ status: false })
        .eq('order_id', orderRow.order_id)

      throw histErr
    }

    return NextResponse.json({
      message: '구매 완료',
      result: {
        orderId: orderRow.order_id,
        decorationId,
        itemName: deco.name,
        spent: price,
        newPoint,
      },
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
