import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { techId, linkTitle, linkUrl } = body

    // 링크가 있을 때 저장
    if (!linkTitle || linkTitle.trim() === '') {
      return NextResponse.json(
        { error: 'link title is required' },
        { status: 400 }
      )
    }
    if (!linkUrl || linkUrl.trim() === '') {
      return NextResponse.json(
        { error: 'link url is required' },
        { status: 400 }
      )
    }
    // https로 시작하지 않을 때
    if (!linkUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'link url must start with https://' },
        { status: 400 }
      )
    }

    // Supabase에 저장
    const { data, error } = await supabase
      .from('node_links')
      .insert({
        user_id: userId,
        tech_id: techId,
        title: linkTitle,
        url: linkUrl,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create link',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        techId: data.tech_id,
        linkId: data.node_link_id,
        linkTitle: data.title,
        linkUrl: data.url,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
