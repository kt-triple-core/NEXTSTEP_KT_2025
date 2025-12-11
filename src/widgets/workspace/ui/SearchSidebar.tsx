'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/shared/ui/Sidebar'
import TechRecommendationList from '@/features/tech/ui/TechRecommendationList'
import useSearchSimilar from '@/features/ai/model/useSearchSimilar'
import useTechRecommendation from '@/features/ai/model/useTechRecommendation'
import { TechItem } from '@/features/ai/model/useTechRecommendation'

interface SearchSidebarProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  searchKeyword: string
  mode: 'search' | 'recommendation' // 모드 추가: 검색 결과 vs AI 추천
  recommendationTechName?: string // AI 추천 시 기준이 되는 기술 이름
}

const SearchSidebar = ({
  open,
  setOpen,
  searchKeyword,
  mode,
  recommendationTechName,
}: SearchSidebarProps) => {
  // 1차: DB/AI 검색 훅
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useSearchSimilar(mode === 'search' ? searchKeyword : '')

  // 2차: AI 추천 훅
  const {
    recommendationData,
    recommendationIsLoading,
    recommendationError,
    fetchRecommendations,
    clearRecommendations,
  } = useTechRecommendation()

  // 모드나 검색어가 바뀔 때마다 추천 상태 초기화
  useEffect(() => {
    clearRecommendations()
  }, [mode, searchKeyword, clearRecommendations])

  // AI 추천 모드일 때 자동으로 추천 API 호출
  useEffect(() => {
    if (mode === 'recommendation' && recommendationTechName && open) {
      fetchRecommendations(recommendationTechName)
    }
  }, [mode, recommendationTechName, open, fetchRecommendations])

  // 🎯 New 버튼 클릭 핸들러 (추천 API 호출)
  const handleNewTech = (item: TechItem) => {
    const techName = item.name
    if (!techName) return

    // 추천 API 호출
    fetchRecommendations(techName)
  }

  // 1차 검색 에러/결과 없음 처리
  const isSearchError =
    searchError || (searchData && searchData.data?.length === 0)
  const errorMessage = searchError
    ? `검색 에러: ${searchError}`
    : searchData?.message || '검색 결과가 없습니다'

  return (
    <Sidebar open={open} setOpen={setOpen}>
      {/* title */}
      <div className="point-gradient flex gap-10 p-10 text-white">
        <div className="h-30 w-30 rounded-full border-2 border-white"></div>
        <p className="text-xl">AI Assistant</p>
      </div>

      <div className="flex w-full flex-col gap-20 p-16">
        {/* ------------------------------------- */}
        {/* 🔍 검색 모드: 검색 결과 표시 */}
        {/* ------------------------------------- */}
        {mode === 'search' && (
          <>
            <h3 className="text-foreground font-semibold">
              🔎 기술 검색 결과: "{searchKeyword}"
            </h3>

            {/* 검색 에러/결과 없음 표시 */}
            {isSearchError && (
              <div
                className={`rounded-lg p-12 ${searchError ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-800'}`}
              >
                {errorMessage}
              </div>
            )}

            {/* 검색 결과 */}
            <TechRecommendationList
              data={searchData?.data ?? []}
              isLoading={isSearching}
              source={searchData?.source}
              onComplete={() => {}}
              onNew={handleNewTech}
            />
          </>
        )}

        {/* ------------------------------------- */}
        {/* 💡 추천 모드: AI 추천만 표시 */}
        {/* ------------------------------------- */}
        {mode === 'recommendation' && (
          <>
            <h3 className="text-foreground font-semibold">
              💡 '{recommendationTechName}'와 시너지가 좋은 기술
            </h3>

            {/* 추천 에러 표시 */}
            {recommendationError && (
              <div className="rounded-lg bg-red-50 p-12 text-red-600">
                추천 에러 발생: {recommendationError}
              </div>
            )}

            {/* 추천 결과 목록 */}
            <TechRecommendationList
              data={recommendationData?.data ?? []}
              isLoading={recommendationIsLoading}
              source={
                recommendationData?.source === 'ai_recommendation'
                  ? 'ai'
                  : undefined
              }
              onComplete={() => {}}
              onNew={handleNewTech}
            />
          </>
        )}
      </div>
    </Sidebar>
  )
}

export default SearchSidebar
