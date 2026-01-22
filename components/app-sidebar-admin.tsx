'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Package,
  Webhook,
  Palette,
  LogOut,
  Plug,
  Crown
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
} from '@/components/ui/sidebar'

interface AppSidebarAdminProps {
  user: {
    name: string | null
    email: string
    tenant: {
      name: string
    }
  }
  sidebarColor: string
  signoutAction: () => void
}

export function AppSidebarAdmin({ user, sidebarColor, signoutAction }: AppSidebarAdminProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Cursos', href: '/admin/courses', icon: BookOpen },
    { name: 'Produtos', href: '/admin/products', icon: Package },
    { name: 'Usuários', href: '/admin/users', icon: Users },
    { name: 'Assinantes', href: '/admin/subscriber-banners', icon: Crown },
    { name: 'Integrações', href: '/admin/integrations', icon: Plug },
    { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
    { name: 'Personalização', href: '/admin/customization', icon: Palette },
  ]

  return (
    <Sidebar className="[&_[data-sidebar=sidebar]]:bg-transparent">
      <div className="flex h-full w-full flex-col" style={{ backgroundColor: sidebarColor }}>
        <SidebarHeader className="border-b border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-600 mt-1">{user.tenant.name}</p>
        </SidebarHeader>

        <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
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
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-sm font-medium text-slate-700">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-600 truncate">{user.email}</p>
          </div>
        </div>

        <form action={signoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
