import { useState } from 'react'

const useOpen = () => {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggleOpen = () => setIsOpen((prev) => !prev)
  return { isOpen, setIsOpen, open, close, toggleOpen }
}

export default useOpen
