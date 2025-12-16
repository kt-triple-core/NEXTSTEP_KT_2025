import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/shared/libs/supabaseClient'
// import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { getServerSession } from 'next-auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? null
  const name = session?.user?.name ?? null
  const avatar = session?.user?.image ?? null

  if (!email) throw new Error('UNAUTHORIZED')

  // 1) 먼저 조회 (status=true만)
  const { data: existing } = await supabase
    .from('users')
    .select('user_id, email, name, avatar, status')
    .eq('email', email)
    .single()

  // ✅ 이미 있고 활성 상태면 그대로 반환
  if (existing?.status === true) {
    return {
      user_id: existing.user_id,
      email: existing.email,
      name: existing.name,
      avatar: existing.avatar,
    }
  }

  // ✅ 없거나 비활성이면: 생성/활성화(upsert)
  const { data: created, error: upsertErr } = await supabase
    .from('users')
    .upsert(
      { email, name, avatar, status: true },
      { onConflict: 'email' } // users.email unique 여야 함
    )
    .select('user_id, email, name, avatar')
    .single()

  if (upsertErr || !created) throw new Error('USER_NOT_FOUND')
  return created
}
