'use client'

import React, { useState } from 'react'

// ⭐ 사용자가 입력하는 검색창
// Enter 또는 버튼 클릭 시 onSearch 호출

interface Props {
  keyword: string
  setKeyword: (v: string) => void
  onSearch: (v: string) => void // 실제 검색 트리거
}

const TechSearchInput: React.FC<Props> = ({
  keyword,
  setKeyword,
  onSearch,
}) => {
  // 사용자가 검색어를 입력하고 Enter를 누르면 onSearch(keyword) 호출
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // console.log('🔍 Enter 키 입력, 검색 시작:', keyword)
      onSearch(keyword.trim())
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="기술 검색 후 Enter"
        className="w-full rounded-lg border px-12 py-8"
      />

      {/* 검색 버튼 추가 (테스트용) */}
      <button
        onClick={() => {
          // console.log('🔍 버튼 클릭, 검색 시작:', keyword)
          onSearch(keyword.trim())
        }}
        className="rounded-lg bg-blue-600 px-16 py-8 text-white hover:bg-blue-700"
      >
        검색
      </button>
    </div>
  )
}

export default TechSearchInput
