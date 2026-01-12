import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, GraduationCap, Webhook } from 'lucide-react'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) return null

  // Buscar estatísticas
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalWebhooks,
    recentUsers,
    recentEnrollments,
    recentWebhooks
  ] = await Promise.all([
    prisma.user.count({
      where: { tenantId: user.tenantId },
    }),
    prisma.course.count({
      where: { tenantId: user.tenantId },
    }),
    prisma.enrollment.count({
      where: { tenantId: user.tenantId, status: 'ACTIVE' },
    }),
    prisma.webhookLog.count({
      where: { tenantId: user.tenantId },
    }),
    prisma.user.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.enrollment.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.webhookLog.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const stats = [
    {
      title: 'Total de Usuários',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total de Cursos',
      value: totalCourses,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Matrículas Ativas',
      value: totalEnrollments,
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Webhooks Recebidos',
      value: totalWebhooks,
      icon: Webhook,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Visão geral da plataforma
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((u) => (
                <div key={u.email} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{u.name}</p>
                    <p className="text-sm text-slate-600">{u.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                    {u.role}
                  </span>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum usuário encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Matrículas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Matrículas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="border-l-2 border-green-500 pl-3">
                  <p className="font-medium text-slate-900">
                    {enrollment.course.title}
                  </p>
                  <p className="text-sm text-slate-600">
                    {enrollment.user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(enrollment.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
              {recentEnrollments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhuma matrícula encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Webhooks Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWebhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {webhook.platform}
                    </span>
                    <span className="text-sm text-slate-600">
                      {webhook.event}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(webhook.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    webhook.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-700'
                      : webhook.status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {webhook.status}
                </span>
              </div>
            ))}
            {recentWebhooks.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum webhook encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
