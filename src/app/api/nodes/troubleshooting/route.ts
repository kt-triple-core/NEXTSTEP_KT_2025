import { requireUser } from '@/shared/libs/requireUser'
import { supabase } from '@/shared/libs/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await requireUser()
    const body = await req.json()
    const { techId, troubleshooting } = body

    // 트러블슈팅이 있을 때 저장
    if (!troubleshooting || troubleshooting.trim() === '') {
      return NextResponse.json(
        { error: 'troubleshooting is required' },
        { status: 400 }
      )
    }

    // Supabase에 저장
    const { data, error } = await supabase
      .from('node_troubleshootings')
      .insert({
        user_id: userId,
        tech_id: techId,
        troubleshooting,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create troubleshooting',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        techId: data.tech_id,
        nodeTroubleshootingId: data.node_troubleshooting_id,
        troubleshooting: data.troubleshooting,
        createdAt: data.created_at,
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
    const nodeTroubleshootingId = searchParams.get('nodeTroubleshootingId')

    // 링크가 있을 때 저장
    if (!nodeTroubleshootingId) {
      return NextResponse.json(
        { error: 'node troubleshooting id is required' },
        { status: 400 }
      )
    }

    // Supabase에 저장
    const { data, error } = await supabase
      .from('node_troubleshootings')
      .delete()
      .eq('user_id', userId)
      .eq('node_troubleshooting_id', nodeTroubleshootingId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete troubleshooting',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: {
        nodeTroubleshootingId: data.node_troubleshooting_id,
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
