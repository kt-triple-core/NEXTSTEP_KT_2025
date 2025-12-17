'use client'

export default function NewsPage() {
  const sync = async () => {
    try {
      const res = await fetch('/api/ai/news', { method: 'POST' })
      const text = await res.text()

      // console.log('API RESPONSE:', text)

      if (!res.ok) {
        throw new Error(text)
      }

      alert('뉴스 수집 완료')
    } catch (e) {
      console.error(e)
      alert('뉴스 수집 실패 (콘솔 확인)')
    }
  }

  return (
    <div className="p-4">
      <button onClick={sync} className="rounded bg-amber-300 px-4 py-2">
        뉴스 수집하기
      </button>
    </div>
  )
}
