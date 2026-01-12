'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  GraduationCap,
  User,
  Shield,
  LogOut
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

interface AppSidebarStudentProps {
  user: {
    name: string | null
    email: string
    role: string
    tenant: {
      name: string
    }
  }
  primaryColor: string
  sidebarColor: string
  signoutAction: () => void
}

export function AppSidebarStudent({ user, primaryColor, sidebarColor, signoutAction }: AppSidebarStudentProps) {
  const pathname = usePathname()

  const navigation = [
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
    <Sidebar className="[&_[data-sidebar=sidebar]]:bg-transparent">
      <div className="flex h-full w-full flex-col" style={{ backgroundColor: sidebarColor }}>
        <SidebarHeader className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
            {user.tenant.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Área de Membros</p>
        </SidebarHeader>

        <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="transition-colors"
                      style={active ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : undefined}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user.role === 'ADMIN' && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin" style={{ color: primaryColor }}>
                        <Shield className="h-5 w-5" />
                        <span>Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <form action={signoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
