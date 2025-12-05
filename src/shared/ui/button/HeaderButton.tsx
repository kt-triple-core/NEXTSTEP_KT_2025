import { ReactNode } from 'react'

interface HeaderButtonProps {
  children: ReactNode
  onClick: () => void
}

const HeaderButton = ({ children, onClick }: HeaderButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-secondary flex h-50 w-50 items-center justify-center rounded-md hover:cursor-pointer"
    >
      {children}
    </button>
  )
}

export default HeaderButton
