'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  GraduationCap,
  User,
  Shield
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: typeof Home
}

interface StudentNavProps {
  isAdmin: boolean
  primaryColor: string
}

export function StudentNav({ isAdmin, primaryColor }: StudentNavProps) {
  const pathname = usePathname()

  const navigation: NavItem[] = [
    { name: 'Início', href: '/dashboard', icon: Home },
    { name: 'Meus Cursos', href: '/my-courses', icon: GraduationCap },
    { name: 'Explorar', href: '/courses', icon: BookOpen },
    { name: 'Perfil', href: '/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navigation.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              active
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={active ? { backgroundColor: `${primaryColor}15` } : undefined}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        )
      })}

      {/* Admin link se for admin */}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border border-gray-200"
          style={{ color: primaryColor }}
        >
          <Shield className="h-5 w-5" />
          <span className="font-medium">Admin</span>
        </Link>
      )}
    </nav>
  )
}
