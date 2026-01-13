import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Calendar } from 'lucide-react'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const user = await getCurrentUser()

  if (!user) return null

  const params = await searchParams
  const search = params.search || ''

  const users = await prisma.user.findMany({
    where: {
      tenantId: user.tenantId,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const stats = {
    total: await prisma.user.count({
      where: { tenantId: user.tenantId },
    }),
    students: await prisma.user.count({
      where: { tenantId: user.tenantId, role: 'STUDENT' },
    }),
    instructors: await prisma.user.count({
      where: { tenantId: user.tenantId, role: 'INSTRUCTOR' },
    }),
    admins: await prisma.user.count({
      where: { tenantId: user.tenantId, role: 'ADMIN' },
    }),
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Usuários</h1>
        <p className="text-slate-600 mt-2">
          Gerencie todos os usuários da plataforma
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Alunos', value: stats.students, color: 'green' },
          { label: 'Instrutores', value: stats.instructors, color: 'purple' },
          { label: 'Admins', value: stats.admins, color: 'orange' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-6">
          <form className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Buscar por nome ou email..."
                defaultValue={search}
                className="pl-10"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Buscar
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-slate-600">
              {search
                ? 'Tente ajustar os termos de busca'
                : 'Ainda não há usuários cadastrados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-medium text-slate-700">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {u.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            u.role === 'ADMIN'
                              ? 'bg-orange-100 text-orange-700'
                              : u.role === 'INSTRUCTOR'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {u.role}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            u.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Desde {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {u._count.enrollments > 0 && (
                          <span className="text-slate-500">
                            {u._count.enrollments} matrícula(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {users.length === 50 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center text-sm text-yellow-800">
            Mostrando apenas os primeiros 50 usuários. Use a busca para encontrar
            usuários específicos.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
