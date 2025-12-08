import { AccentButton } from '@/shared/ui/button'
import { useState } from 'react'

interface SearchFormProps {
  handleSearchTechStack: (searchKeyword: string) => void
}

const SearchForm = ({ handleSearchTechStack }: SearchFormProps) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  return (
    <div className="absolute bottom-30 left-1/2 w-full max-w-450 -translate-x-1/2 px-30">
      <div className="bg-primary flex h-50 rounded-md p-5">
        <input
          type="text"
          className="w-full px-5 outline-none"
          placeholder="What do you want to learn?"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearchTechStack(searchKeyword)
            }
          }}
        />
        <AccentButton onClick={() => handleSearchTechStack(searchKeyword)}>
          Search
        </AccentButton>
      </div>
    </div>
  )
}

export default SearchForm
