'use client'

import type { ReactFlowInstance } from '@xyflow/react'

type ExportWorkspaceAsImageArgs = {
  container: HTMLElement
  rf: ReactFlowInstance
  fileName?: string
  backgroundColor?: string
}

export const exportWorkspaceAsImage = async ({
  container,
  rf,
  fileName = 'community-workspace',
  backgroundColor,
}: ExportWorkspaceAsImageArgs) => {
  if (!container || !rf) return

  // 🔹 ReactFlow에게만 현재 화면 정렬 맡김
  // (레이아웃/transform 직접 조작 ❌)
  rf.fitView({ padding: 0.4 })

  // fitView 렌더 반영 대기
  await new Promise((r) => setTimeout(r, 50))

  const domtoimage = await import('dom-to-image-more')

  const dataUrl = await domtoimage.toPng(container, {
    cacheBust: true,
    pixelRatio: 2,

    // 배경색은 container에 이미 있으므로
    // 여기서는 덮어쓰지 않음 (옵션으로만 가능)
    ...(backgroundColor ? { bgcolor: backgroundColor } : {}),

    // ❗ SVG(격자/엣지)는 건드리지 않고
    // UI 버튼만 캡처에서 제외
    filter: (node) => {
      const el = node as HTMLElement
      if (el.classList?.contains('workspace-action')) return false
      return true
    },
  })

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${fileName}-${Date.now()}.png`
  link.click()
}
