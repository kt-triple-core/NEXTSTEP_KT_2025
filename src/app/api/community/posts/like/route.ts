import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { requireUser } from '@/shared/libs/requireUser'

export const POST = async (req: NextRequest) => {
  try {
    const user = await requireUser()
    const { postId } = await req.json()

    // 이미 좋아요 했는지 확인
    const { data: existing } = await supabaseAdmin
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // 좋아요 취소
      await supabaseAdmin.from('post_likes').delete().eq('id', existing.id)

      await supabaseAdmin.rpc('decrement_like', {
        p_post_id: postId,
      })

      return NextResponse.json({ liked: false })
    }

    // 좋아요 추가
    await supabaseAdmin.from('post_likes').insert({
      post_id: postId,
      user_id: user.id,
    })

    await supabaseAdmin.rpc('increment_like', {
      p_post_id: postId,
    })

    return NextResponse.json({ liked: true })
  } catch (e) {
    console.error('like api error:', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
