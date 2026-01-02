'use client'
import { usePathname } from 'next/navigation'
import { HeaderNavItems } from '../config/navigation'
import Link from 'next/link'
import { usePreventNavigation } from '@/shared/model/usePreventNavigation'
import { useWorkspaceStore } from '@/widgets/workspace/model'

const Nav = () => {
  const pathname = usePathname()
  const isEdited = useWorkspaceStore((s) => s.isEdited)
  const { handleLinkClick } = usePreventNavigation({ when: isEdited })

  return (
    <nav className="pl-30">
      {HeaderNavItems.map((item) => {
        const isActive = item.href.startsWith('/community')
          ? pathname.startsWith('/community')
          : pathname === item.href

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`mr-10 inline-flex h-50 items-center rounded-xl px-20 ${
              isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
            }`}
            onClick={handleLinkClick}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export default Nav
