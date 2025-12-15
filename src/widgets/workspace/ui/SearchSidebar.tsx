import { useEffect, useState } from 'react'
import Sidebar from '@/shared/ui/Sidebar'
import TechRecommendationList from '@/features/tech/ui/TechRecommendationList'
import useSearchSimilar from '@/features/ai/model/useSearchSimilar'
import useTechRecommendation from '@/features/ai/model/useTechRecommendation'
import { TechItem } from '@/features/ai/model/useTechRecommendation'
import { Pencil } from '@/shared/ui/icon'
import { Button } from '@/shared/ui'
import { CustomNode } from '../model/types'
import { useWorkspaceStore } from '../model'

interface SearchSidebarProps {
  isOpen: boolean
  toggleOpen: () => void
  selectedNode: CustomNode | null
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
  const [mode, setMode] = useState<'search' | 'recommendation'>('search')
  const [editingName, setEditingName] = useState<string | null>(null)
  const [isSearch, setIsSearch] = useState<boolean>(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [recommendationTechName, setRecommendationTechName] =
    useState<string>('')

  // 기술 편집 기능 시작
  const handleStartEdit = () => {
    if (selectedNode === null) return
    setEditingName(selectedNode.data.label)
  }

  // 검색
  const handleStartSearch = () => {
    if (!editingName) return
    setIsSearch(true)
    setMode('search')
    setSearchKeyword(editingName)
  }
  // 기술 편집 기능 취소
  const handleCancelSearch = () => {
    setEditingName(null)
    setSearchKeyword('')
  }

  // 검색 모드 선택
  const handleSearch = () => {
    setMode('search')
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
    : searchData?.message || '검색 결과가 없습니다'

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
              label: techItem.name,
            },
          }
        }
        return node
      })
    )
    setSelectedNode({ ...selectedNode, data: { label: techItem.name } })
  }

  if (selectedNode?.id === '1') return

  return (
    <Sidebar isOpen={isOpen} toggleOpen={toggleOpen}>
      <div className="flex h-full flex-col">
        {/* title */}
        <div className="point-gradient flex shrink-0 gap-10 p-10 text-white">
          <div className="h-30 w-30 rounded-full border-2 border-white"></div>
          <p className="text-xl">AI Assistant</p>
        </div>

        {selectedNode === null ? (
          <div className="flex h-full items-center justify-center p-10">
            <p className="text-14 whitespace-break-spaces">
              노드를 선택해주세요
            </p>
          </div>
        ) : (
          <div className="p-10">
            {/* 노드 정보 영역 */}
            <div className="mb-10">
              {/* 편집 중이 아닐 때 - 현재 노드 정보 표시 */}
              {editingName === null ? (
                <>
                  <p className="text-foreground text-12 mb-5">현재 노드</p>
                  <div className="bg-secondary mb-3 h-50 rounded-lg p-10">
                    <div className="flex items-center justify-between">
                      <div className="w-full font-bold">
                        {selectedNode?.data.label || ''}
                      </div>
                      <button
                        onClick={handleStartEdit}
                        className="hover:bg-primary ml-2 rounded-md p-5 transition hover:cursor-pointer"
                      >
                        <Pencil />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* 편집 중일 때 - 검색 입력 */
                <>
                  <p className="text-foreground text-12 mb-5">기술 스택 검색</p>
                  <div>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="예: React, TypeScript, Docker..."
                      className="bg-secondary mb-5 h-50 w-full rounded-lg p-10 outline-none"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleStartSearch()
                      }
                      autoFocus
                    />
                    <div className="flex justify-end gap-5">
                      <Button
                        onClick={handleCancelSearch}
                        className="px-12 py-8"
                      >
                        취소
                      </Button>
                      <Button
                        variant="accent"
                        onClick={handleStartSearch}
                        className="px-12"
                      >
                        검색
                      </Button>
                    </div>
                  </div>
                </>
              )}
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
            {editingName === null || !isSearch ? (
              // 편집 중이 아닐 때
              <div className="py-20 text-center">
                <p className="font-semibold">
                  {mode === 'search' ? '검색' : '추천'}을 시작하세요
                </p>
                <p className="text-14 mt-10 whitespace-break-spaces">
                  위의 편집 버튼을 눌러{'\n'}기술명을 입력하고 검색해주세요
                </p>
              </div>
            ) : (
              // 편집 중일 때
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
                      💡 &apos;{recommendationTechName}&apos;와 시너지가 좋은
                      기술
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
        )}
      </div>
    </Sidebar>
  )
}

export default SearchSidebar
