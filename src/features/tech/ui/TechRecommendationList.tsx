import { Button } from '@/shared/ui'
import React from 'react'
import { useState } from 'react'
import TechRequestModal from './TechRequestModal'

interface TechItem {
  tech_id?: string
  name?: string
  description?: string
  icon_url?: string
  usage_count?: number
  score?: number
  isNew?: boolean
}

interface Props {
  data: TechItem[]
  isLoading: boolean
  source?: 'db' | 'ai'
  onComplete?: (item: TechItem) => void
  handleUpdateNode?: (item: TechItem) => void
  onNew?: (item: TechItem) => void
  onAddNode?: (item: TechItem) => void
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

const TechRecommendationList: React.FC<Props> = ({
  data,
  isLoading,
  source,
  onComplete,
  handleUpdateNode,
  onNew,
  onAddNode,
}) => {
  const [requestItem, setRequestItem] = useState<TechItem | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="text-gray-500">검색 중...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="text-gray-400">검색 결과가 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="flex h-auto flex-col gap-16">
      {data.map((item, index) => {
        const key = item.tech_id || item.name || index
        const isNewTech = !!item.isNew
        const isPrimarySearch = source !== 'ai'

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

                {source === 'ai' && (
                  <span
                    className={`mt-2 inline-block w-fit rounded-full px-8 py-4 text-xs font-medium ${isNewTech ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {isNewTech ? '⭐️ AI 생성 (신규)' : '✨ AI 추천'}
                  </span>
                )}
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="flex justify-between gap-10">
              {isPrimarySearch ? (
                // 1차 DB 검색 결과
                <>
                  <Button
                    variant="secondary"
                    className="h-50 w-[calc(50%-5px)]"
                    onClick={() => onComplete && onComplete(item)}
                  >
                    Completed
                  </Button>
                  <Button
                    variant="gradient"
                    className="h-50 w-[calc(50%-5px)]"
                    onClick={() => handleUpdateNode && handleUpdateNode(item)}
                  >
                    Save
                  </Button>
                </>
              ) : (
                // 2차 AI 추천 결과
                <>
                  {!isNewTech && (
                    <>
                      <Button
                        variant="secondary"
                        className="h-50 w-[calc(50%-5px)]"
                        onClick={() => onComplete && onComplete(item)}
                      >
                        Completed
                      </Button>
                      <Button
                        variant="gradient"
                        className="h-50 w-[calc(50%-5px)]"
                        onClick={() => onAddNode && onAddNode(item)}
                      >
                        New
                      </Button>
                    </>
                  )}

                  {isNewTech && (
                    <div className="flex w-full gap-10">
                      <Button
                        variant="gradient"
                        className="h-50 w-full"
                        onClick={() => setRequestItem(item)}
                      >
                        Request to Admin
                      </Button>
                      {requestItem && (
                        <TechRequestModal
                          initialData={requestItem}
                          onClose={() => setRequestItem(null)}
                          onSubmit={async (data) => {
                            await fetch('/api/tech-requests', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: data.name,
                                description: data.description,
                                icon_url: data.icon_url,
                              }),
                            })

                            alert('관리자에게 요청이 전달되었습니다.')
                            setRequestItem(null)
                          }}
                        />
                      )}
                    </div>
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
