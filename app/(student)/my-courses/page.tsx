import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/actions/auth"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function MyCoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar customização de cores
  const customization = await prisma.tenantCustomization.findUnique({
    where: { tenantId: user.tenantId },
  })

  const colors = {
    primary: customization?.primaryColor || '#A78BFA',
    secondary: customization?.secondaryColor || '#FBBF24',
    accent: customization?.accentColor || '#34D399',
    background: customization?.backgroundColor || '#FEF3C7',
    text: customization?.textColor || '#1F2937',
  }

  // Buscar apenas cursos matriculados
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
    include: {
      course: {
        include: {
          category: true,
          _count: {
            select: {
              modules: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen pt-20" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>Meus Cursos</h1>
          <p className="mt-1" style={{ color: colors.text, opacity: 0.7 }}>
            {enrollments.length > 0
              ? `Você está matriculado em ${enrollments.length} ${enrollments.length === 1 ? 'curso' : 'cursos'}`
              : 'Você ainda não está matriculado em nenhum curso'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        {enrollments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.text }}>Nenhum curso encontrado</CardTitle>
              <CardDescription style={{ color: colors.text, opacity: 0.7 }}>
                Você ainda não adquiriu nenhum curso. Explore os cursos disponíveis e comece a aprender!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/courses">
                <Button
                  style={{
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                >
                  Explorar Cursos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {enrollment.course.thumbnailUrl && (
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={enrollment.course.thumbnailUrl}
                        alt={enrollment.course.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: `${colors.accent}20`,
                          color: colors.accent
                        }}
                      >
                        ✓ Matriculado
                      </span>
                      {enrollment.course.category && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${colors.primary}20`,
                            color: colors.primary
                          }}
                        >
                          {enrollment.course.category.name}
                        </span>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{enrollment.course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {enrollment.course.shortDesc || enrollment.course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Barra de progresso */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: colors.text, opacity: 0.6 }}>Progresso</span>
                          <span className="font-medium" style={{ color: colors.text }}>{enrollment.progress.toString()}%</span>
                        </div>
                        <div className="w-full rounded-full h-2" style={{ backgroundColor: '#e2e8f0' }}>
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${enrollment.progress}%`,
                              backgroundColor: colors.primary
                            }}
                          />
                        </div>
                      </div>

                      <Link href={`/course/${enrollment.course.slug}`}>
                        <Button
                          className="w-full"
                          style={{
                            backgroundColor: colors.primary,
                            color: 'white'
                          }}
                        >
                          {Number(enrollment.progress) === 0 ? 'Começar' : 'Continuar'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold" style={{ color: colors.primary }}>
                    {enrollments.length}
                  </CardTitle>
                  <CardDescription style={{ color: colors.text, opacity: 0.7 }}>
                    Cursos Ativos
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold" style={{ color: colors.accent }}>
                    {enrollments.filter(e => Number(e.progress) === 100).length}
                  </CardTitle>
                  <CardDescription style={{ color: colors.text, opacity: 0.7 }}>
                    Cursos Concluídos
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold" style={{ color: colors.secondary }}>
                    {Math.round(
                      enrollments.reduce((acc, e) => acc + Number(e.progress), 0) / enrollments.length
                    )}
                    %
                  </CardTitle>
                  <CardDescription style={{ color: colors.text, opacity: 0.7 }}>
                    Progresso Médio
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
