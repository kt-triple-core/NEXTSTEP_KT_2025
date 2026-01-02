import { ChevronLeft, ChevronRight } from './icon'

interface SidebarProps {
  isOpen: boolean
  toggleOpen: () => void
  children: React.ReactNode
}
const Sidebar = ({ isOpen, toggleOpen, children }: SidebarProps) => {
  return (
    <aside className="relative">
      <div
        className={`shrink-0 ${isOpen ? 'w-300' : 'w-0'} bg-primary scrollbar-hide max-w-full overflow-y-auto transition-[width]`}
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {children}
      </div>
      <button
        className="bg-primary absolute top-10 -left-25 flex h-40 w-25 items-center justify-center rounded-s-md hover:cursor-pointer"
        onClick={toggleOpen}
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </aside>
  )
}

export default Sidebar
