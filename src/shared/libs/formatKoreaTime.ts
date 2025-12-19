type FormatOption = 'date' | 'full'

export function formatKoreaTime(
  dateString: string,
  option: FormatOption = 'full'
) {
  const date = new Date(dateString)
  if (option === 'date') {
    return date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
  }
  return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}
