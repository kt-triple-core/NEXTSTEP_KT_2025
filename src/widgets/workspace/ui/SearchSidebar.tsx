import { useEffect, useState } from 'react'
import Sidebar from '@/shared/ui/Sidebar'
import TechRecommendationList from '@/features/tech/ui/TechRecommendationList'
import useSearchSimilar from '@/features/ai/model/useSearchSimilar'
import useTechRecommendation from '@/features/ai/model/useTechRecommendation'
import { TechItem } from '@/features/ai/model/useTechRecommendation'
import { Button } from '@/shared/ui'
import { CustomNodeType } from '../model/types'
import { useWorkspaceStore } from '../model'
import NodeInformation from './NodeInformation'

interface SearchSidebarProps {
  isOpen: boolean
  toggleOpen: () => void
  selectedNode: CustomNodeType | null
  // mode: 'search' | 'recommendation' // 모드 추가: 검색 결과 vs AI 추천
  // recommendationTechName?: string // AI 추천 시 기준이 되는 기술 이름
}

const SearchSidebar = ({
  isOpen,
  toggleOpen,
  selectedNode,
  // mode,
  // recommendationTechName,
}: SearchSidebarProps) => {
  const { setNodes, setSelectedNode } = useWorkspaceStore()
  const [isEditingMode, setIsEditingMode] = useState<boolean>(false)
  const [mode, setMode] = useState<'search' | 'recommendation'>('search')
  const [searchInput, setSearchInput] = useState<string>('')
  const [isSearch, setIsSearch] = useState<boolean>(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [recommendationTechName, setRecommendationTechName] =
    useState<string>('')

  // // 기술 편집 기능 시작
  // const handleStartEdit = () => {
  //   if (selectedNode === null) return
  //   setSearchInput(selectedNode.data.label)
  // }

  // 기술 편집 기능 취소
  const handleCancelSearch = () => {
    setSearchInput('')
    setSearchKeyword('')
    setIsEditingMode(false)
  }

  // 검색 모드 선택
  const handleSearch = () => {
    setMode('search')
  }
  // 검색
  const handleStartSearch = () => {
    if (!searchInput) return
    setIsSearch(true)
    setMode('search')
    setSearchKeyword(searchInput)
  }

  // AI 추천 핸들러 (추천 모드)
  const handleRecommendation = () => {
    setMode('recommendation')
    // 검색 값이 있을 때만 실행
    if (!searchKeyword) return
    console.log('AI 추천 실행:', searchKeyword)
    setRecommendationTechName(searchKeyword)
  }

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
    if (mode === 'recommendation' && recommendationTechName && isOpen) {
      fetchRecommendations(recommendationTechName)
    }
  }, [mode, recommendationTechName, isOpen, fetchRecommendations])

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
    : searchData?.message || '검색 결과가 없습니다. 관리자에게 요청해주세요.'

  // 노드 업데이트
  const handleUpdateNode = (techItem: TechItem) => {
    if (selectedNode === null) return
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              techId: techItem.tech_id,
              label: techItem.name,
              iconUrl: techItem.icon_url,
            },
          }
        }
        return node
      })
    )
    setSelectedNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        techId: techItem.tech_id,
        label: techItem.name,
        iconUrl: techItem.icon_url,
      },
    })
  }

  // Start 노드가 클릭된 경우
  if (selectedNode?.id === '1') return
  return (
    <Sidebar isOpen={isOpen} toggleOpen={toggleOpen}>
      <div className="flex h-full flex-col">
        {/* title */}
        <div className="point-gradient flex shrink-0 items-center gap-10 p-10 text-white">
          <div className="h-20 w-20 rounded-full border-2 border-white"></div>
          <p className="text-xl">Information</p>
        </div>

        {selectedNode === null ? (
          <div className="flex h-full items-center justify-center p-10">
            <p className="text-14 whitespace-break-spaces">
              노드를 선택해주세요
            </p>
          </div>
        ) : (
          <>
            {/* 새 노드이거나 / 새 노드가 아닌데, 편집 모드인 경우 */}
            {selectedNode.data.label === null || isEditingMode ? (
              <div className="p-10">
                {/* 검색폼 영역 */}
                <div className="mb-10">
                  <p className="text-foreground text-12 mb-5">기술 스택 검색</p>
                  <div>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="예: React, TypeScript, Docker..."
                      className="bg-secondary mb-5 h-50 w-full rounded-lg p-10 outline-none"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleStartSearch()
                      }
                      autoFocus
                    />
                    <div className="flex justify-end gap-5">
                      {selectedNode.data.label !== null && (
                        <Button
                          onClick={handleCancelSearch}
                          className="px-12 py-8"
                        >
                          취소
                        </Button>
                      )}
                      <Button
                        variant="accent"
                        onClick={handleStartSearch}
                        className="px-12 py-8"
                      >
                        검색
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 모드 선택 영역 */}
                <div className="bg-secondary my-10 flex w-full gap-5 rounded-lg p-5">
                  <div
                    onClick={handleSearch}
                    className={`text-14 h-30 w-full rounded-md ${mode === 'search' && 'bg-accent text-white'} flex items-center justify-center hover:cursor-pointer`}
                  >
                    검색
                  </div>
                  <div
                    onClick={handleRecommendation}
                    className={`text-14 h-30 w-full rounded-md ${mode === 'recommendation' && 'bg-accent text-white'} flex items-center justify-center hover:cursor-pointer`}
                  >
                    추천
                  </div>
                </div>

                {/* 검색 결과 영역 */}
                {!searchInput || !isSearch ? (
                  // 검색 전
                  <div className="py-20 text-center">
                    <p className="font-semibold">
                      {mode === 'search' ? '검색' : '추천'}을 시작하세요
                    </p>
                    <p className="text-14 mt-10 whitespace-break-spaces">
                      위의 편집 버튼을 눌러{'\n'}기술명을 입력하고 검색해주세요
                    </p>
                  </div>
                ) : (
                  // 검색
                  <div className="flex w-full flex-col gap-20">
                    {/* ------------------------------------- */}
                    {/* 🔍 검색 모드: 검색 결과 표시 */}
                    {/* ------------------------------------- */}
                    {mode === 'search' && (
                      <>
                        <h3 className="text-foreground font-semibold">
                          🔎 기술 검색 결과: &quot;{searchKeyword}&quot;
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
                          handleUpdateNode={handleUpdateNode}
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
                          💡 &apos;{recommendationTechName}&apos;와 시너지가
                          좋은 기술
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
                          handleUpdateNode={handleUpdateNode}
                          onNew={handleNewTech}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // 노드 정보
              <NodeInformation
                selectedNode={selectedNode}
                handleEditTech={() => setIsEditingMode(true)}
              />
            )}
          </>
        )}
      </div>
    </Sidebar>
  )
}

export default SearchSidebar
