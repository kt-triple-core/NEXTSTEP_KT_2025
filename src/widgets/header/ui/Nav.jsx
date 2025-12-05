'use client'
import { usePathname } from 'next/navigation'
import { HeaderNavItems } from '../config/navigation'

const Nav = () => {
  const pathname = usePathname()
  return (
    <nav className="pl-30">
      {HeaderNavItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`mr-10 inline-flex h-50 items-center rounded-xl px-20 ${
            pathname === item.href ? 'bg-secondary' : 'hover:bg-secondary/50'
          }`}
        >
          {item.title}
        </a>
      ))}
    </nav>
  )
}

export default Nav
