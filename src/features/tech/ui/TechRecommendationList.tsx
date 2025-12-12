import { Button } from '@/shared/ui'
import React from 'react'

// TechItem 인터페이스에 isNew 필드 추가
interface TechItem {
  tech_id?: string
  name?: string
  description?: string
  icon_url?: string
  usage_count?: number
  score?: number
  isNew?: boolean // AI가 생성한 새로운 기술인지 여부
}

interface Props {
  data: TechItem[]
  isLoading: boolean
  source?: 'db' | 'ai'
  onComplete?: (item: TechItem) => void
  onNew?: (item: TechItem) => void // 기존 New 버튼 콜백 (이제 '관리자에게 요청' 버튼 역할)
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
 * - 버튼 로직: DB 데이터는 Completed만, AI 신규 데이터는 '관리자에게 요청'만 표시
 */
const TechRecommendationList: React.FC<Props> = ({
  data,
  isLoading,
  source,
  onComplete,
  onNew,
}) => {
  // ... (로딩/결과 없음 처리 생략)

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

        // AI가 새로 생성한 기술인지 확인
        const isNewTech = !!item.isNew

        // 1차 DB 검색 결과인지, 2차 AI 추천 결과인지 구분
        const isPrimarySearch = source !== 'ai'

        // 아이템 이미지 처리 (생략)
        const imageElement = item.icon_url ? (
          <img
            src={item.icon_url}
            alt={item.name}
            className="h-24 w-24 object-contain"
            onError={(e) => {
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
                  <h2 className="flex-1 text-3xl font-semibold">
                    {item.name || '이름 없음'}
                  </h2>
                  {imageElement}
                </div>

                <p className="text-xs whitespace-pre-line text-gray-600">
                  {item.description || '설명이 없습니다.'}
                </p>

                {typeof item.usage_count === 'number' && (
                  <p className="mt-4 text-xs text-gray-400">
                    Usage | {formatNumber(item.usage_count)}
                  </p>
                )}

                {/* AI 추천 배지: 신규 기술일 때 더 강조 */}
                {source === 'ai' && (
                  <span
                    className={`mt-2 inline-block w-fit rounded-full px-8 py-4 text-xs font-medium ${isNewTech ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {isNewTech ? '⭐️ AI 생성 (신규)' : '✨ AI 추천'}
                  </span>
                )}
              </div>
            </div>

            {/* 하단 액션 버튼: 로직 변경  */}
            <div className="flex justify-between gap-10">
              {/* ------------------------------------------- */}
              {/* 1. 1차 DB/검색 결과인 경우 (isPrimarySearch) */}
              {/* ------------------------------------------- */}
              {isPrimarySearch ? (
                <>
                  {/* Completed 버튼 (1차 검색 결과에는 항상 표시) */}
                  <Button
                    variant="secondary"
                    className="h-50 w-[calc(50%-5px)]"
                    onClick={() => onComplete && onComplete(item)}
                  >
                    Completed
                  </Button>

                  {/* New 버튼 (1차 검색 결과에는 항상 표시) */}
                  <Button
                    variant="gradient"
                    className="h-50 w-[calc(50%-5px)]"
                    onClick={() => onNew && onNew(item)} // ⬅️ AI 추천을 트리거하는 버튼
                  >
                    New
                  </Button>
                </>
              ) : (
                /* ------------------------------------------- */
                /* 2. 2차 AI 추천 결과인 경우 (source === 'ai') */
                /* ------------------------------------------- */
                <>
                  {/* AI 추천 결과: DB에 있는 기술 (isNew: false)은 Completed만 */}
                  {!isNewTech && onComplete && (
                    <>
                      <Button
                        variant="secondary"
                        className="h-50 w-[calc(50%-5px)]"
                        onClick={() => onComplete(item)}
                      >
                        Completed
                      </Button>
                      <Button
                        variant="gradient"
                        className="h-50 w-[calc(50%-5px)]"
                        onClick={() => onNew && onNew(item)}
                      >
                        New
                      </Button>
                    </>
                  )}

                  {/* AI 추천 결과: AI가 생성한 신규 기술 (isNew: true)은 관리자 요청만 */}
                  {isNewTech && onNew && (
                    <Button
                      variant="gradient"
                      className="h-50 w-full"
                      onClick={() => onNew(item)}
                    >
                      Request to Admin
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TechRecommendationList
