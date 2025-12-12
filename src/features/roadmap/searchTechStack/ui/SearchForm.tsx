import { Button } from '@/shared/ui'
import { useState } from 'react'
import { SelectedNodeToolbar } from '../../selectNode/ui'

interface SearchFormProps {
  onSearch: (searchKeyword: string) => void
  onRecommendation?: (techName: string) => void // AI 추천 핸들러 추가
}

const SearchForm = ({ onSearch, onRecommendation }: SearchFormProps) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const handleSearch = () => {
    const keyword = searchKeyword.trim()
    if (keyword) {
      onSearch(keyword)
    }
  }

  return (
    <div className="absolute bottom-30 left-1/2 w-full max-w-450 -translate-x-1/2 px-30">
      <SelectedNodeToolbar onRecommendation={onRecommendation} />
      <div className="bg-primary flex h-auto rounded-md p-5">
        <input
          type="text"
          className="w-full px-5 outline-none"
          placeholder="What do you want to learn?"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
        />
        <Button variant="accent" onClick={handleSearch} className="px-20 py-8">
          Search
        </Button>
      </div>
    </div>
  )
}

export default SearchForm
