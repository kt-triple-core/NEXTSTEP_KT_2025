import { ReactNode } from 'react'

interface NormalButtonProps {
  children: ReactNode
  onClick: () => void
  height?: number
  width?: number | string
}

const NormalButton = ({
  children,
  onClick,
  height = 50,
  width = 'auto',
}: NormalButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-secondary text-14 text-foreground flex shrink-0 items-center justify-center rounded-md px-20 py-8 hover:cursor-pointer"
      style={{ height: `${height}px`, width: `${width}` }}
    >
      {children}
    </button>
  )
}

export default NormalButton
