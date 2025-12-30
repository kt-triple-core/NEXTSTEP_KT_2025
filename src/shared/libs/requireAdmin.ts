import { supabaseAdmin } from './supabaseAdmin'
import { requireUser } from './requireUser'

export async function requireAdmin() {
  const { userId } = await requireUser()

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error || data?.role !== 'admin') {
    throw new Error('FORBIDDEN')
  }

  return { userId }
}
