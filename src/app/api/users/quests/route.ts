import { NextResponse } from 'next/server'
import { requireUser } from '@/shared/libs/requireUser'
import { getTodayDate } from '@/features/user/quest/api/getTodayDate'
import { supabaseAdmin } from '@/shared/libs/supabaseAdmin'
import { QUEST_META } from '@/features/user/quest/model/questMeta'

/**
 * 퀘스트 번호
 * - 1, 2, 3, 4 만 허용 (타입으로 실수 방지)
 */
type QuestNo = 1 | 2 | 3 | 4

/**
 * 퀘스트 상태
 * - locked    : 아직 조건 미달
 * - ready     : 달성 완료, 보상 수령 가능
 * - completed : 보상까지 수령 완료
 */
type QuestStatus = 'locked' | 'ready' | 'completed'

/**
 * PATCH 요청 body 타입
 * - ready     : locked → ready
 * - complete  : ready → completed (+ 포인트)
 */
type PatchBody =
  | { questNo: QuestNo; action: 'ready' }
  | { questNo: QuestNo; action: 'complete'; reward?: number }

/**
 * questNo(1,2,3,4)를 DB 컬럼명(quest1, quest2, quest3, quest4)으로 변환
 */
function getQuestColumn(questNo: QuestNo) {
  return questNo === 1
    ? 'quest1'
    : questNo === 2
      ? 'quest2'
      : questNo === 3
        ? 'quest3'
        : 'quest4'
}

/**
 * 오늘 날짜의 퀘스트 row가 없으면 생성
 * - 이미 존재하면 아무 것도 하지 않음
 * - UNIQUE(user_id, quest_date) 제약이 있어야 정상 동작
 */
async function ensureTodayRow(userId: string, questDate: string) {
  const { error } = await supabaseAdmin.from('quests').insert({
    user_id: userId,
    quest_date: questDate,
    quest1: 'locked',
    quest2: 'locked',
    quest3: 'locked',
    quest4: 'locked',
  })

  if (error) {
    // 23505 = unique constraint violation (이미 오늘 row 있음)
    if ((error as any).code === '23505') return
    throw error
  }
}

/**
 * 오늘 퀘스트 row를 보장하고 조회
 * - GET에서 사용
 */
async function loadTodayQuestRow(userId: string, questDate: string) {
  // 오늘 row가 없으면 먼저 생성
  await ensureTodayRow(userId, questDate)

  // 생성(또는 기존 row) 조회
  const { data, error } = await supabaseAdmin
    .from('quests')
    .select('quest_id, quest_date, quest1, quest2, quest3, quest4')
    .eq('user_id', userId)
    .eq('quest_date', questDate)
    .single()

  if (error || !data) throw error ?? new Error('QUEST_NOT_FOUND')
  return data
}

/**
 * GET /api/quests
 * - 오늘 퀘스트 상태 + 사용자 포인트 조회
 * - 오늘 row가 없으면 자동 생성
 */
export async function GET() {
  try {
    // 로그인된 사용자 확인
    const { userId } = await requireUser()

    // 한국 기준 오늘 날짜 (YYYY-MM-DD)
    const questDate = getTodayDate()

    // 오늘 퀘스트 row 조회
    const questRow = await loadTodayQuestRow(userId, questDate)

    // 사용자 포인트 조회
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('point')
      .eq('user_id', userId)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // 프론트에서 쓰기 쉬운 형태로 응답
    return NextResponse.json({
      questDate: questRow.quest_date,
      point: user.point ?? 0,
      quests: [
        { questNo: 1, status: questRow.quest1 as QuestStatus },
        { questNo: 2, status: questRow.quest2 as QuestStatus },
        { questNo: 3, status: questRow.quest3 as QuestStatus },
        { questNo: 4, status: questRow.quest4 as QuestStatus },
      ],
    })
  } catch (e: any) {
    console.error('GET error:', e)
    return NextResponse.json(
      { message: 'Server error', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/quests
 * - 퀘스트 상태 변경
 *   1) locked → ready
 *   2) ready → completed (+ 포인트 지급)
 */
export async function PATCH(req: Request) {
  try {
    // 로그인된 사용자 확인
    const { userId } = await requireUser()

    // 오늘 날짜
    const questDate = getTodayDate()

    // 요청 body 파싱
    const body = (await req.json()) as PatchBody

    // questNo → DB 컬럼명
    const questColumn = getQuestColumn(body.questNo)

    // 오늘 row 보장 (GET 안 거치고 PATCH 올 수도 있으므로)
    await ensureTodayRow(userId, questDate)

    /**
     * 1. locked → ready
     */
    if (body.action === 'ready') {
      const { data, error } = await supabaseAdmin
        .from('quests')
        .update({
          [questColumn]: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('quest_date', questDate)

        // 혹시모를 다중호출에 대한 상태변경 방지하고,
        // 퀘스트 완료 단계가 잠김,준비,완료 순서를 따라만 바뀌게
        .eq(questColumn, 'locked') // locked일 때만 변경
        .select('quest_date, quest1, quest2, quest3, quest4')
        .single()

      if (error || !data) {
        return NextResponse.json({ message: 'Update failed' }, { status: 500 })
      }

      return NextResponse.json({
        message: 'OK',
        questDate: data.quest_date,
        quests: [
          { questNo: 1, status: data.quest1 as QuestStatus },
          { questNo: 2, status: data.quest2 as QuestStatus },
          { questNo: 3, status: data.quest3 as QuestStatus },
          { questNo: 4, status: data.quest4 as QuestStatus },
        ],
      })
    }

    /**
     * 2️. ready → completed (+ 포인트 지급)
     */

    const meta = QUEST_META[body.questNo]
    const rewardPoint = Number.isFinite(body.reward)
      ? Number(body.reward)
      : meta.reward
    const content = meta.title

    const { data: updatedQuest, error: questError } = await supabaseAdmin
      .from('quests')
      .update({
        [questColumn]: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('quest_date', questDate)
      .eq(questColumn, 'ready') // ready일 때만 변경
      .select('quest_date, quest1, quest2, quest3, quest4')
      .single()

    if (questError || !updatedQuest) {
      return NextResponse.json(
        { message: 'Quest is not ready or already completed' },
        { status: 409 }
      )
    }

    // 현재 포인트 조회
    const { data: currentUser, error: userErr } = await supabaseAdmin
      .from('users')
      .select('point')
      .eq('user_id', userId)
      .single()

    if (userErr || !currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // 포인트 계산
    const nextPoint = (currentUser.point ?? 0) + rewardPoint

    // 포인트 업데이트
    const { data: updatedUser, error: updateUserErr } = await supabaseAdmin
      .from('users')
      .update({ point: nextPoint })
      .eq('user_id', userId)
      .select('point')
      .single()

    if (updateUserErr || !updatedUser) {
      return NextResponse.json(
        { message: 'Point update failed' },
        { status: 500 }
      )
    }

    const { error: historyErr } = await supabaseAdmin
      .from('point_history')
      .insert({
        user_id: userId,
        content,
        amount: rewardPoint,
        running_total: updatedUser.point ?? nextPoint,
      })

    if (historyErr) {
      return NextResponse.json(
        { message: 'Point history insert failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'OK',
      point: updatedUser.point ?? nextPoint,
      questDate: updatedQuest.quest_date,
      quests: [
        { questNo: 1, status: updatedQuest.quest1 as QuestStatus },
        { questNo: 2, status: updatedQuest.quest2 as QuestStatus },
        { questNo: 3, status: updatedQuest.quest3 as QuestStatus },
        { questNo: 4, status: updatedQuest.quest4 as QuestStatus },
      ],
    })
  } catch (e: any) {
    console.error('PATCH error:', e)
    return NextResponse.json(
      { message: 'Server error', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
