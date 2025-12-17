import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function requireUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.userId) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return session.user
}
