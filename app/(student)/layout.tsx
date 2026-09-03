import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { signout } from '@/lib/actions/auth'
import { JardimStudentShell } from '@/components/jardim/student-shell'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <JardimStudentShell
      user={{ name: user.name, email: user.email }}
      signoutAction={signout}
    >
      {children}
    </JardimStudentShell>
  )
}
