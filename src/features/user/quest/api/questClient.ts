import axios from 'axios'

export type QuestNo = 1 | 2 | 3 | 4

export async function markQuestReady(questNo: QuestNo) {
  try {
    await axios.patch('/api/users/quests', {
      questNo,
      action: 'ready',
    })
  } catch {
    // 퀘스트는 "부가기능"이라 실패해도 본 기능을 깨지 않게 조용히 무시
  }
}
