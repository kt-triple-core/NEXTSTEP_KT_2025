import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleAuthProvider from 'next-auth/providers/google'

// nextauth에서는 서버 환경이라 createClient 직접 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleAuthProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    //로그인 시도할 때마다 실행
    async signIn({ user }) {
      console.log('OAuth User:', user)
      if (!user.email) return false

      //1. Supabase에 해당 이메일의 유저가 있는지 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

      //2. 없으면 첫 로그인, 회원가입 처리
      if (!existingUser) {
        const newUserId = uuidv4()

        const { error } = await supabase.from('users').insert({
          user_id: newUserId,
          email: user.email,
          name: user.name ?? '새 유저',
          avatar: user.image ?? null,
        })
        if (error) {
          console.error('Supabase 신규 유저 생성 실패:', error.message)
          return false
        }
      }
      return true
    },

    // NextAuth session에 supabase user_id 올려두기
    async session({ session }) {
      if (!session?.user?.email) return session

      // supabase DB에서 user_id 가져옴
      const { data } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', session.user.email)
        .single()

      if (data?.user_id) {
        session.user.id = data.user_id
      }

      return session
    },
  },
})

export { handler as GET, handler as POST }
