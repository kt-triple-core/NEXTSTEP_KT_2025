import Sidebar from '@/shared/ui/Sidebar'

interface SearchSidebarProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const SearchSidebar = ({ open, setOpen }: SearchSidebarProps) => {
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <></>
    </Sidebar>
  )
}

export default SearchSidebar
