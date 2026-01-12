'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { useState } from 'react'

interface StudentNavbarProps {
  user: {
    name: string | null
    email: string
  }
  primaryColor: string
  signoutAction: () => void
}

export function StudentNavbar({ user, primaryColor, signoutAction }: StudentNavbarProps) {
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navigation = [
    { name: 'Início', href: '/dashboard' },
    { name: 'Meus Cursos', href: '/my-courses' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Menu de Navegação */}
          <div className="flex items-center gap-8">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative text-base font-semibold transition-all hover:scale-105"
                  style={{
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {item.name}
                  {active && (
                    <div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Menu do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {user.name}
                </p>
                <p className="text-xs text-white/80" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{user.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Meu Perfil
                  </Link>

                  <form action={signoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
