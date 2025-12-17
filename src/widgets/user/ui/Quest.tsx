import QuestCard from '@/features/user/quest/ui/QuestCard'

const questList = [
  {
    id: 1,
    title: '나의 로드맵 공유하기',
    description: '로드맵을 커뮤니티에 공유해보세요.',
    progressText: '0회 / 1회',
    rewardText: '200P 획득',
    leftIcon: '▶',
  },
  {
    id: 2,
    title: '인상적인 로드맵 하트 누르기',
    description: '다른 사람의 로드맵에 하트를 눌러보세요.',
    progressText: '0회 / 1회',
    rewardText: '200P 획득',
    leftIcon: '❤️',
  },
  {
    id: 3,
    title: '커뮤니티에 댓글 작성하기',
    description: '커뮤니티 게시글에 댓글을 작성해보세요.',
    progressText: '0회 / 1회',
    rewardText: '200P 획득',
    leftIcon: '💬',
  },
  {
    id: 4,
    title: '나의 로드맵 공유하기',
    description: '로드맵을 커뮤니티에 공유해보세요.',
    progressText: '0회 / 1회',
    rewardText: '200P 획득',
    leftIcon: '▶',
  },
  {
    id: 5,
    title: '나의 로드맵 공유하기',
    description: '로드맵을 커뮤니티에 공유해보세요.',
    progressText: '0회 / 1회',
    rewardText: '200P 획득',
    leftIcon: '▶',
    variant: 'locked',
  },
]

const Quest = () => {
  return (
    <main className="flex gap-80 px-50 py-30">
      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white">
          <div className="flex items-center justify-between rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec] px-50 py-40">
            <div className="flex flex-col gap-15 text-white">
              <h2 className="text-3xl font-bold">🔥 오늘의 퀘스트!</h2>
              <span className="text-18 ml-10 font-medium">
                데일리 퀘스트를 달성하고 포인트를 얻어봐요.
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              내 포인트 : 1,000P
            </div>
          </div>
          {/* 안쪽 컨텐츠  */}
          <div className="grid grid-cols-3 gap-30 p-40">
            {questList.map((quest) => (
              <QuestCard
                key={quest.id}
                title={quest.title}
                description={quest.description}
                progressText={quest.progressText}
                rewardText={quest.rewardText}
                leftIcon={quest.leftIcon}
                variant={quest.variant}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Quest
