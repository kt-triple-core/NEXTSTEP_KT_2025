import { ReactNode } from 'react'

interface GradientButtonProps {
  children: ReactNode
  onClick: () => void
  height?: number
  width?: number | string
}

const GradientButton = ({
  children,
  onClick,
  height = 50,
  width = 'auto',
}: GradientButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="point-gradient text-14 flex shrink-0 items-center justify-center rounded-md px-20 py-8 text-white hover:cursor-pointer"
      style={{ height: `${height}px`, width: `${width}` }}
    >
      {children}
    </button>
  )
}

export default GradientButton
