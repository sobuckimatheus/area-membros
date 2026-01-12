import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { signout } from '@/lib/actions/auth'
import { AppSidebarAdmin } from '@/components/app-sidebar-admin'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import prisma from '@/lib/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Buscar customização
  const customization = await prisma.tenantCustomization.findUnique({
    where: { tenantId: user.tenantId },
  })

  const sidebarColor = customization?.sidebarColor || '#FFFFFF'

  return (
    <SidebarProvider>
      <AppSidebarAdmin user={user} sidebarColor={sidebarColor} signoutAction={signout} />
      <SidebarInset className="flex-1 bg-slate-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
