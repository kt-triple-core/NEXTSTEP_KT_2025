import { useState } from 'react'

export function useCareerDraft() {
  const [field, setField] = useState('')
  const [year, setYear] = useState('') // input은 string으로 관리

  const reset = () => {
    setField('')
    setYear('')
  }

  // useCreateExperience에서 바로 쓰기 좋게 { field, year }로 반환
  const getPayload = () => {
    return {
      field: field.trim(),
      year: Number(year),
    }
  }

  return {
    field,
    setField,
    year,
    setYear,
    reset,
    getPayload,
  }
}
