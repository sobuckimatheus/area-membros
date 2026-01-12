import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { signout } from '@/lib/actions/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { StudentNavbar } from '@/components/student-navbar'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar customização
  const customization = await prisma.tenantCustomization.findUnique({
    where: { tenantId: user.tenantId },
  })

  // Cores padrão
  const colors = {
    primary: customization?.primaryColor || '#A78BFA',
    background: customization?.backgroundColor || '#FEF3C7',
    text: customization?.textColor || '#1F2937',
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Navbar no topo */}
      <StudentNavbar
        user={user}
        primaryColor={colors.primary}
        signoutAction={signout}
      />
      <main>
        {children}
      </main>
    </div>
  )
}
