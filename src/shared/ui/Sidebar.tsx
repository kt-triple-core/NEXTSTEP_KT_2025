import { ChevronLeft, ChevronRight } from './icon'

interface SidebarProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}
const Sidebar = ({ open, setOpen, children }: SidebarProps) => {
  return (
    <aside
      className={`relative h-full shrink-0 ${open ? 'w-300' : 'w-0'} bg-primary max-w-full transition-[width]`}
    >
      {children}
      <button
        className="bg-primary absolute top-10 -left-25 flex h-50 w-25 items-center justify-center rounded-s-xl hover:cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </aside>
  )
}

export default Sidebar
