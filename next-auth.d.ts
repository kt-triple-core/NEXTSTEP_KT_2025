import { DefaultSession, DefaultUser } from 'next-auth'

// 1. NextAuth의 Session 타입을 확장합니다.
declare module 'next-auth' {
  interface Session {
    user: {
      /** 데이터베이스에서 가져온 사용자의 고유 ID */
      userId: string // user 객체에 id 속성 추가
    } & DefaultSession['user']
  }
}
