'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/shared/ui/Sidebar'
import TechRecommendationList from '@/features/tech/ui/TechRecommendationList'
import useSearchSimilar from '@/features/ai/model/useSearchSimilar'
import useTechRecommendation from '@/features/ai/model/useTechRecommendation' // ⭐️ 새로 추가된 훅
import { TechItem } from '@/features/ai/model/useTechRecommendation' // TechItem 타입 재사용을 위해 필요 (경로에 맞게 수정)

interface SearchSidebarProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  searchKeyword: string // 부모에서 전달받은 검색어
}

const SearchSidebar = ({
  open,
  setOpen,
  searchKeyword,
}: SearchSidebarProps) => {
  // 1차: DB/AI 검색 훅
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useSearchSimilar(searchKeyword)

  // 2차: AI 추천 훅
  const {
    recommendationData,
    recommendationIsLoading,
    recommendationError,
    fetchRecommendations,
    clearRecommendations,
  } = useTechRecommendation()

  // 현재 추천의 기준이 된 기술 이름 상태
  const [currentBaseTech, setCurrentBaseTech] = useState<string | null>(null)

  // 검색어가 바뀔 때마다 추천 상태 초기화
  useEffect(() => {
    clearRecommendations()
    setCurrentBaseTech(null)
  }, [searchKeyword, clearRecommendations])

  // 🎯 New 버튼 클릭 핸들러 (추천 API 호출)
  const handleNewTech = (item: TechItem) => {
    const techName = item.name
    if (!techName) return

    // 1. 추천 상태 업데이트 (로딩 시작)
    setCurrentBaseTech(techName)

    // 2. 추천 API 호출
    fetchRecommendations(techName)

    // 3. (선택적) 만약 사이드바가 닫혀있다면 열기
    if (!open) setOpen(true)
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
        {/* 1차 검색 타이틀 */}
        <h3 className="text-lg font-semibold text-gray-700">
          🔎 기술 검색 결과: "{searchKeyword}"
        </h3>

        {/* 1차 검색 에러/결과 없음 표시 */}
        {isSearchError && (
          <div
            className={`rounded-lg p-12 ${searchError ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-800'}`}
          >
            {errorMessage}
          </div>
        )}

        {/* 1차 검색 결과 */}
        <TechRecommendationList
          data={searchData?.data ?? []}
          isLoading={isSearching}
          source={searchData?.source}
          onComplete={() => {}} // 필요한 로직 추가
          onNew={handleNewTech} // ⬅️ 추천 핸들러 연결
        />

        {/* ------------------------------------- */}
        {/* 🎯 2차: 추천 기술 섹션 */}
        {/* ------------------------------------- */}
        {(recommendationData ||
          recommendationIsLoading ||
          recommendationError) && (
          <div className="mt-20 border-t pt-20">
            <h3 className="text-foreground text-lg font-semibold text-gray-700">
              💡 '{currentBaseTech}'와 시너지가 좋은 기술
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
              onComplete={() => {}} // 필요한 로직 추가
              onNew={handleNewTech} // ⬅️ 추천된 기술을 기반으로 또다시 추천받을 수 있도록 연결
            />
          </div>
        )}
      </div>
    </Sidebar>
  )
}

export default SearchSidebar
