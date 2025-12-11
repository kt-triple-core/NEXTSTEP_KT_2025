import { createClient } from '@supabase/supabase-js'

// 슈퍼베이스 클라이언트 세팅
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
