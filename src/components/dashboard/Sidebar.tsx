'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/history', label: 'History' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Dashboard navigation" className="w-48 shrink-0 border-r border-zinc-800 bg-zinc-950 py-6 px-3 hidden md:block">
      <ul className="space-y-1">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? 'bg-violet-600/20 text-violet-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
