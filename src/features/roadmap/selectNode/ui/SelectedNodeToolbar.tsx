import { useWorkspaceStore } from '@/widgets/workspace/model'
import { useEffect } from 'react'
import { AddingPositionType } from '../model/types'
import AddingPositionButton from './AddingPositionButton'
import { Button } from '@/shared/ui'

interface SelectedNodeToolbarProps {
  onRecommendation?: (techName: string) => void
}

const SelectedNodeToolbar = ({
  onRecommendation,
}: SelectedNodeToolbarProps) => {
  const { nodes, selectedNode, addingPosition, setAddingPosition } =
    useWorkspaceStore()

  // 선택된 노드가 바뀔 때마다 자식에 추가하는 방향으로 초기화
  useEffect(() => {
    setAddingPosition('following')
  }, [selectedNode, setAddingPosition])

  // 현재 노드를 기준으로 추가할 방향 토글
  const handleTogglePosition = (position: AddingPositionType) => {
    // 루트 노드일 때는 무조건 자식에 추가
    if (selectedNode === '1') return

    setAddingPosition(position)
  }

  //  AI 추천 버튼 핸들러
  const handleAIRecommend = () => {
    console.log('🤖 AI 추천 버튼 클릭됨')
    const selectedNodeLabel = nodes.find((node) => node.id === selectedNode)
      ?.data.label
    if (selectedNodeLabel && onRecommendation) {
      onRecommendation(selectedNodeLabel)
    }
  }

  if (selectedNode === null) return null

  return (
    <div className="bg-primary mb-10 w-full rounded-md p-10 text-center opacity-90">
      <p className="text-foreground-light text-12">Selected Node</p>
      <p className="text-20">
        {nodes.find((node) => node.id === selectedNode)?.data.label || ''}
      </p>

      {/*  AI 추천 버튼 추가 */}
      <div className="mt-8 mb-8 flex justify-center">
        <Button
          variant="gradient"
          onClick={handleAIRecommend}
          className="text-16 h-50 w-full"
        >
          AI Recommend
        </Button>
      </div>

      <div className="text-14 flex items-center justify-center gap-5">
        <p>Add to</p>
        <div className="bg-secondary rounded-md p-4">
          <AddingPositionButton
            addingPosition={addingPosition}
            position="preceding"
            handleClick={handleTogglePosition}
          />
          <AddingPositionButton
            addingPosition={addingPosition}
            position="following"
            handleClick={handleTogglePosition}
          />
        </div>
      </div>
    </div>
  )
}

export default SelectedNodeToolbar
