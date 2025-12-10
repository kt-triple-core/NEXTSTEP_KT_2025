import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleAuthProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
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
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일 후 재로그인 필요
  },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login', // 커스텀 페이지 사용 -> app/login/page.tsx에 별도로 구현해야 함
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
