import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleAuthProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'

export const authOptions: NextAuthOptions = {
  // JWT 기반 세션 사용
  session: {
    strategy: 'jwt',
  },
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
    //1. 로그인 시도할 때마다 실행
    async signIn({ user }) {
      console.log('OAuth User:', user)

      // 이메일 없으면 로그인 거부
      if (!user.email) {
        return false
      }

      // 1) Supabase에 해당 이메일의 유저가 있는지 확인
      const { data: existingUser, error: selectError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

      // "no rows" 에러(PGRST116)는 그냥 '유저 없음'으로 간주
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Supabase 유저 조회 실패:', selectError.message)
        // 여기서 false를 리턴하면 로그인 자체를 막음
        return false
      }

      //2) 없으면 첫 로그인 -> 회원가입 처리
      if (!existingUser) {
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            email: user.email,
            name: user.name ?? '새 유저',
            avatar: user.image ?? null,
          })

        if (insertError) {
          console.error('Supabase 신규 유저 생성 실패:', insertError.message)
          return false
        }
      }

      return true
    },

    /**
     * 2. JWT 콜백
     *    - 여기서 "이 토큰을 유지할 것인지 / 버릴 것인지" 결정
     *    - return null 하면 NextAuth가 세션을 끊음(로그아웃 처리)
     */
    async jwt({ token, trigger, session }) {
      // email 정보가 없으면 그냥 토큰 그대로 돌려보냄
      if (!token?.email) return token

      // Supabase에서 해당 이메일 유저가 아직 존재하는지 확인
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('user_id, avatar')
        .eq('email', token.email)
        .single()

      // 유저가 없으면 토큰 버림(로그아웃 처리)
      if (error || !data?.user_id) {
        console.warn(
          'JWT 콜백: Supabase에 유저 없음 → 토큰 삭제(로그아웃)',
          error?.message
        )
        // 여기서 null 리턴 → NextAuth가 세션을 완전히 없앰
        return null
      }

      // 유저 존재하면 userId를 토큰에 실어둠
      token.userId = data.user_id
      // DB에 있는 avatar를 토큰에 싣기 (헤더가 session.user.image로 쓰도록)
      ;(token as any).picture = data.avatar ?? (token as any).picture

      // 클라에서 update() 호출 시 즉시 반영
      if (trigger === 'update' && session?.user) {
        if ((session.user as any).image) {
          ;(token as any).picture = (session.user as any).image
        }
      }
      return token
    },

    /**
     * 3. session 콜백
     *    - 클라이언트로 내려갈 session 객체를 조작
     *    - 여기서는 "항상 객체를 리턴"만 하고, 세션 끊는 건 jwt에서 처리
     */
    async session({ session, token }) {
      if (session.user) {
        if (token?.userId)
          session.user.userId = token.userId as string

          // 헤더에서 바로 쓰는 값
        ;(session.user as any).image =
          (token as any).picture ?? session.user.image
      }
      return session
    },
  },
}
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
