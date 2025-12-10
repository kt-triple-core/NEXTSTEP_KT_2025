import { AccentButton } from '@/shared/ui/button'
import { useState } from 'react'
import { SelectedNodeToolbar } from '../../selectNode/ui'

interface SearchFormProps {
  onSearch: (searchKeyword: string) => void // 이름만 변경
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  // 여기도 변경
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const handleSearch = () => {
    const keyword = searchKeyword.trim()
    if (keyword) {
      onSearch(keyword) // handleSearchTechStack → onSearch
    }
  }

  return (
    <div className="absolute bottom-30 left-1/2 w-full max-w-450 -translate-x-1/2 px-30">
      <SelectedNodeToolbar />
      <div className="bg-primary flex h-auto rounded-md p-5">
        <input
          type="text"
          className="w-full px-5 outline-none"
          placeholder="What do you want to learn?"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearch() // 여기 변경
            }
          }}
        />
        <AccentButton onClick={handleSearch}>
          {' '}
          {/* 여기 변경 */}
          Search
        </AccentButton>
      </div>
    </div>
  )
}

export default SearchForm
