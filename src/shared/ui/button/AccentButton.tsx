import { ReactNode } from 'react'

interface AccentButtonProps {
  children: ReactNode
  onClick: () => void
}

const AccentButton = ({ children, onClick }: AccentButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-accent text-14 flex shrink-0 items-center justify-center rounded-md px-20 py-8 text-white hover:cursor-pointer"
    >
      {children}
    </button>
  )
}

export default AccentButton
