'use client'

import { NormalButton, GradientButton } from '@/shared/ui/button'
import React from 'react'

interface TechItem {
  // DB에서 온 경우 tech_id 등이 있고, AI에서 왔다면 name/description/img 같은 필드만 있을 수 있음
  tech_id?: string
  name?: string
  description?: string
  icon_url?: string
  usage_count?: number
  score?: number
  // fromDB 같은 플래그는 서버에서 설정하거나 클라이언트에서 source prop으로 따로 구분
}

interface Props {
  data: TechItem[] // API에서 받은 항목 배열 (빈 배열일 수 있음)
  isLoading: boolean // 로딩 상태
  source?: 'db' | 'ai' // 전체 소스 (선택적) - 개별 아이템에도 포함될 수 있음
  onComplete?: (item: TechItem) => void // Completed 클릭 시 콜백
  onNew?: (item: TechItem) => void // New 클릭 시 콜백
}

/**
 * formatNumber
 * - 사용량(usage_count)를 사람이 읽기 쉬운 단위로 포맷 (K, M 등)
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

/**
 * TechRecommendationList
 *
 * - data가 비어있으면 '검색 결과 없음' UI를 띄움.
 * - isLoading이면 로딩 상태 UI를 띄움.
 * - 각 아이템은 이름, 설명, 이미지(또는 fallback), usage_count를 보여줌.
 * - source prop이나 개별 항목으로 AI 추천을 표시할 수 있음.
 * - 버튼 클릭은 onComplete/onNew 콜백을 통해 상위 컴포넌트에 전달.
 */
const TechRecommendationList: React.FC<Props> = ({
  data,
  isLoading,
  source,
  onComplete,
  onNew,
}) => {
  // 1) 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="text-gray-500">검색 중...</div>
      </div>
    )
  }

  // 2) 결과 없음 처리
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="text-gray-400">검색 결과가 없습니다.</div>
      </div>
    )
  }

  // 3) 결과 리스트 렌더링
  return (
    <div className="flex h-auto flex-col gap-16">
      {data.map((item, index) => {
        const key = item.tech_id || item.name || index

        // 아이템 이미지 처리: icon_url이 있으면 보여주고, 없거나 로드 실패 시 fallback 이미지 사용
        const imageElement = item.icon_url ? (
          <img
            src={item.icon_url}
            alt={item.name}
            className="h-24 w-24 object-contain"
            onError={(e) => {
              // 이미지 로드 실패 시 플레이스홀더로 대체
              e.currentTarget.src = 'https://via.placeholder.com/96?text=Tech'
            }}
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded bg-gray-100">
            <span className="text-2xl">🔧</span>
          </div>
        )

        return (
          <div key={key} className="mb-10 w-full">
            <div className="bg-secondary mb-10 flex gap-16 rounded-xl p-16 shadow-xl">
              <div className="flex flex-1 flex-col gap-4">
                <div className="mb-20 flex flex-1 flex-row items-center gap-12">
                  {/* 기술명 */}
                  <h2 className="flex-1 text-3xl font-semibold">
                    {item.name || '이름 없음'}
                  </h2>

                  {/* 이미지 (또는 fallback) */}
                  {imageElement}
                </div>

                {/* 설명 (줄바꿈 유지) */}
                <p className="text-xs whitespace-pre-line text-gray-600">
                  {item.description || '설명이 없습니다.'}
                </p>

                {/* 사용량(usage_count)이 존재하면 표기 */}
                {typeof item.usage_count === 'number' && (
                  <p className="mt-4 text-xs text-gray-400">
                    Usage | {formatNumber(item.usage_count)}
                  </p>
                )}

                {/* AI 추천 배지: source prop 또는 항목 내의 메타데이터로 결정 */}
                {source === 'ai' && (
                  <span className="mt-2 inline-block w-fit rounded-full bg-yellow-100 px-8 py-4 text-xs text-yellow-800">
                    AI 추천
                  </span>
                )}
              </div>
            </div>

            {/* 하단 액션 버튼: 상위 컴포넌트로 콜백 전달 */}
            <div className="flex justify-between gap-10">
              <NormalButton
                width="calc(50% - 5px)"
                onClick={() => onComplete && onComplete(item)}
              >
                Completed
              </NormalButton>
              <GradientButton
                width="calc(50% - 5px)"
                onClick={() => onNew && onNew(item)}
              >
                New
              </GradientButton>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TechRecommendationList
