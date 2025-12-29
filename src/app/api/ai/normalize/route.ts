// app/api/ai/normalize/route.ts
// Gemini 2.5-flash 사용 (추천 API와 동일)

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'
const AXIOS_TIMEOUT = 5000 // 5초 (검색은 빠르게)

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { normalizedKeyword: '', error: 'API key missing' },
      { status: 500 }
    )
  }

  try {
    const { keyword } = await request.json()

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { normalizedKeyword: '', error: '검색어 없음' },
        { status: 400 }
      )
    }

    const trimmed = keyword.trim()

    // 이미 영문이면 그대로 반환
    if (/^[a-zA-Z0-9\-\.]+$/.test(trimmed)) {
      return NextResponse.json({
        normalizedKeyword: trimmed.toLowerCase(),
        original: keyword,
        method: 'passthrough',
      })
    }

    // Gemini AI로 한글/초성 → 영문 변환
    const aiPrompt = `"${trimmed}"는 프로그래밍 기술 스택의 한글 이름 또는 초성입니다.
이것을 영문 기술명으로 변환해서 **영문 이름만** 반환하세요.

예시:
- "리액트" → "React"
- "ㄹㅇㅌ" → "React"
- "넥스트" → "Next.js"
- "타입스크립트" → "TypeScript"

규칙:
- 영문 기술명만 반환 (설명 없음)
- 대소문자 정확하게
- 기술명이 아니면 빈 문자열 반환

입력: "${trimmed}"
출력:`

    const aiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: aiPrompt }] }],
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: AXIOS_TIMEOUT,
      }
    )

    const responseText =
      aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const normalized = responseText
      .trim()
      .toLowerCase()
      .replace(/```/g, '')
      .replace(/\n/g, '')
      .replace(/"/g, '')

    if (!normalized) {
      return NextResponse.json({
        normalizedKeyword: trimmed.toLowerCase(),
        original: keyword,
        method: 'fallback',
      })
    }

    return NextResponse.json({
      normalizedKeyword: normalized,
      original: keyword,
      method: 'ai',
    })
  } catch (error: any) {
    // 에러 시 원본 반환 (검색은 계속 진행)
    try {
      const { keyword } = await request.json()
      return NextResponse.json(
        {
          normalizedKeyword: keyword.trim().toLowerCase(),
          original: keyword,
          method: 'error_fallback',
          error: error.message,
        },
        { status: 200 } // 200으로 반환해서 검색은 계속
      )
    } catch {
      return NextResponse.json(
        { normalizedKeyword: '', error: 'Parse error' },
        { status: 500 }
      )
    }
  }
}
