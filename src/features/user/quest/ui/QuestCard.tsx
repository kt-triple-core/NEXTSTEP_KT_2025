import { Button } from '@/shared/ui'
import { Pencil } from '@/shared/ui/icon'

export type QuestCardVariant = 'default' | 'completed'

type QuestCardProps = {
  title: string
  description?: string
  progressText?: string
  rewardText?: string
  leftIcon?: React.ReactNode
  variant?: QuestCardVariant
}

const QuestCard = () => {
  return (
    <div className="py30 rounded-md border border-[#7751EE] bg-[#F9F8FD] px-30 py-20">
      <div>
        <h3 className="flex">
          <Pencil />
          <p>퀘스트 제목</p>
        </h3>
        <p>퀘스트 설명</p>
      </div>
      <div className="text-center">
        <span>0회</span>/<span>1회</span>
      </div>
      <Button variant="accent" className="rounded-8 text-16 mt-20 w-full py-15">
        200획득
      </Button>
    </div>
  )
}

export default QuestCard
