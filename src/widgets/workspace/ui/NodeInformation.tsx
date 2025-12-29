import { Button } from '@/shared/ui'
import { CustomNodeType } from '../model/types'
import { useState } from 'react'
import { formatKoreaTime } from '@/shared/libs/formatKoreaTime'
import { MemoForm } from '@/features/roadmap/postNodeMemo/ui'
import { LinkForm } from '@/features/roadmap/postNodeLink/ui'
import { TroubleshootingForm } from '@/features/roadmap/postNodeTroubleshooting/ui'
import { useWorkspaceStore } from '../model'
import { DeleteNodeLinkButton } from '@/features/roadmap/deleteNodeLink/ui'
import DeleteNodeTroubleshootingButton from '@/features/roadmap/deleteNodeTroubleshooting/ui/DeleteNodeLinkButton'
import { useSession } from 'next-auth/react'
import useTechRecommendation from '@/features/ai/model/useTechRecommendation'
import TechRecommendationList from '@/features/tech/ui/TechRecommendationList'

interface NodeInformationProps {
  selectedNode: CustomNodeType
  handleEditTech: () => void
}

const NodeInformationMenu = [
  { key: 'memo', label: '메모' },
  { key: 'link', label: '자료' },
  { key: 'troubleshooting', label: '트러블슈팅' },
]

const NodeInformation = ({
  selectedNode,
  handleEditTech,
}: NodeInformationProps) => {
  const { status } = useSession()
  const isLogin = status === 'authenticated'
  const [mode, setMode] = useState<string>(NodeInformationMenu[0].key)
  const getNodeLinks = useWorkspaceStore((s) => s.getNodeLinks)
  const getNodeTroubleshootings = useWorkspaceStore(
    (s) => s.getNodeTroubleshootings
  )
  const { setNodes, setSelectedNode } = useWorkspaceStore()

  const [isLinkFormOpen, setIsLinkFormOpen] = useState<boolean>(false)
  const links = getNodeLinks(selectedNode.data.techId)

  const [isTroubleshootingFormOpen, setIsTroubleshootingFormOpen] =
    useState<boolean>(false)
  const troubleshootings = getNodeTroubleshootings(selectedNode.data.techId)

  // 추천 모드 상태 추가
  const [isRecommendMode, setIsRecommendMode] = useState<boolean>(false)

  // AI 추천 훅
  const {
    recommendationData,
    recommendationIsLoading,
    recommendationError,
    fetchRecommendations,
  } = useTechRecommendation()

  // 추천 버튼 클릭 핸들러
  const handleRecommendClick = () => {
    const techName = selectedNode.data.label
    if (!techName) return

    setIsRecommendMode(true) // 추천 모드 활성화
    fetchRecommendations(techName) // AI 추천 요청
  }

  //  추천 모드에서 뒤로가기
  const handleBackToMenu = () => {
    setIsRecommendMode(false)
  }

  // 노드 업데이트 (추천 결과에서 선택 시)
  const handleUpdateNode = (techItem: any) => {
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

  // New 버튼 클릭 핸들러
  const handleNewTech = (item: any) => {
    const techName = item.name
    if (!techName) return
    fetchRecommendations(techName)
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* 기술 이름 및 편집 버튼 */}
      <div className="flex items-center justify-between px-10 py-20">
        <div className="flex items-center gap-10">
          <img
            src={selectedNode.data.iconUrl}
            alt={selectedNode.data.label || ''}
            className="h-30 w-30 object-cover"
          />
          <p className="text-20">{selectedNode.data.label}</p>
        </div>
        <Button className="shrink-0 px-10 py-2" onClick={handleEditTech}>
          변경
        </Button>
      </div>

      {/* 하위 노드 추천 버튼 */}
      <div className="flex justify-center">
        <Button
          className="point-gradient px-20 py-10"
          onClick={handleRecommendClick}
        >
          {selectedNode.data.label} 와(과) 연관된 하위 노드 추천받기
        </Button>
      </div>

      {/* 추천 모드일 때 */}
      {isRecommendMode ? (
        <div className="h-full overflow-y-auto p-10">
          {/* 뒤로가기 버튼 */}
          <Button
            variant="secondary"
            className="mb-10 w-full py-10"
            onClick={handleBackToMenu}
          >
            ← 돌아가기
          </Button>

          {/* 제목 */}
          <h3 className="text-foreground mb-10 font-semibold">
            💡 &apos;{selectedNode.data.label}&apos;와 시너지가 좋은 기술
          </h3>

          {/* 에러 표시 */}
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
        </div>
      ) : (
        <>
          {/* 기존 메뉴 (추천 모드 아닐 때만 표시) */}
          {/* navigation */}
          <div className="border-b-secondary border-b">
            <ul className="flex">
              {NodeInformationMenu.map((item) => (
                <li
                  key={item.key}
                  className={`text-14 box-content flex h-50 w-full items-center justify-center text-center ${item.key === mode && 'border-b-accent text-accent border-b-2 font-bold'} hover:cursor-pointer`}
                  onClick={() => setMode(item.key)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {isLogin ? (
            <div className="h-full overflow-y-auto p-10">
              {/* 메모 탭 */}
              {mode === 'memo' && (
                <MemoForm techId={selectedNode.data.techId} />
              )}

              {/* 자료 탭 */}
              {mode === 'link' && (
                <>
                  {!isLinkFormOpen ? (
                    <Button
                      variant="accent"
                      className="w-full py-10"
                      onClick={() => setIsLinkFormOpen(true)}
                    >
                      추가하기
                    </Button>
                  ) : (
                    <LinkForm
                      techId={selectedNode.data.techId}
                      handleCloseForm={() => setIsLinkFormOpen(false)}
                      links={links}
                    />
                  )}
                  {links.length > 0 && (
                    <ul className="mt-10 flex flex-col gap-10">
                      {links.map((link) => (
                        <li
                          key={link.nodeLinkId}
                          className="bg-secondary group flex justify-between gap-10 rounded-md p-10"
                        >
                          <div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent break-all underline hover:cursor-pointer"
                            >
                              {link.title}
                            </a>
                            <p className="text-12 text-foreground-light">
                              {link.url}
                            </p>
                          </div>
                          <DeleteNodeLinkButton
                            techId={selectedNode.data.techId}
                            nodeLinkId={link.nodeLinkId}
                            links={links}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {/* 트러블슈팅 탭 */}
              {mode === 'troubleshooting' && (
                <>
                  {!isTroubleshootingFormOpen ? (
                    <>
                      <Button
                        variant="accent"
                        className="w-full py-10"
                        onClick={() => setIsTroubleshootingFormOpen(true)}
                      >
                        추가하기
                      </Button>
                      <ul className="mt-10 flex flex-col gap-10">
                        {troubleshootings.map((item) => (
                          <li
                            key={item.nodeTroubleshootingId}
                            className="bg-secondary group flex justify-between gap-10 rounded-md p-10"
                          >
                            <div>
                              <p className="text-12 mb-5">
                                {formatKoreaTime(item.createdAt, 'date')}
                              </p>
                              <div>{item.troubleshooting}</div>
                            </div>
                            <DeleteNodeTroubleshootingButton
                              techId={selectedNode.data.techId}
                              nodeTroubleshootingId={item.nodeTroubleshootingId}
                              troubleshootings={troubleshootings}
                            />
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <TroubleshootingForm
                      techId={selectedNode.data.techId}
                      handleCloseForm={() =>
                        setIsTroubleshootingFormOpen(false)
                      }
                      troubleshootings={troubleshootings}
                    />
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p>로그인이 필요합니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NodeInformation
