import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { techId, title, url } = body

    // 링크가 있을 때 저장
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'link title is required' },
        { status: 400 }
      )
    }
    if (!url || url.trim() === '') {
      return NextResponse.json(
        { error: 'link url is required' },
        { status: 400 }
      )
    }
    // https로 시작하지 않을 때
    if (!url.startsWith('https://')) {
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
        title,
        url,
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
        nodeLinkId: data.node_link_id,
        title: data.title,
        url: data.url,
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

export const DELETE = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const { searchParams } = new URL(req.url)
    const nodeLinkId = searchParams.get('nodeLinkId')

    // 링크가 있을 때 저장
    if (!nodeLinkId) {
      return NextResponse.json(
        { error: 'node link id is required' },
        { status: 400 }
      )
    }

    // Supabase에 저장
    const { data, error } = await supabase
      .from('node_links')
      .delete()
      .eq('user_id', userId)
      .eq('node_link_id', nodeLinkId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete link',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        nodeLinkId: data.node_link_id,
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
