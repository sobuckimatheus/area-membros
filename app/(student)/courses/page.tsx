import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Clock, Award } from 'lucide-react'

export default async function CoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Faça login para ver os cursos disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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

  // Buscar todos os cursos publicados
  const courses = await prisma.course.findMany({
    where: {
      tenantId: user.tenantId,
      status: 'PUBLISHED',
    },
    include: {
      category: true,
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Buscar matrículas do usuário
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    select: {
      courseId: true,
    },
  })

  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId))

  return (
    <div className="min-h-screen pt-20" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>Explorar Cursos</h1>
          <p className="mt-1" style={{ color: colors.text, opacity: 0.7 }}>Explore e aprenda com nossos cursos</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        {courses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.text }}>Nenhum curso disponível</CardTitle>
              <CardDescription style={{ color: colors.text, opacity: 0.7 }}>
                Ainda não há cursos publicados. Volte mais tarde!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.id)

              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Thumbnail */}
                  {course.thumbnailUrl && (
                    <div className="aspect-video bg-slate-200 relative">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                      {isEnrolled && (
                        <div
                          className="absolute top-2 right-2 px-2 py-1 text-white text-xs font-medium rounded"
                          style={{ backgroundColor: colors.accent }}
                        >
                          Matriculado
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader>
                    {/* Categoria */}
                    {course.category && (
                      <div className="mb-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {course.category.name}
                        </span>
                      </div>
                    )}

                    {/* Título */}
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>

                    {/* Descrição */}
                    {course.shortDesc && (
                      <CardDescription className="line-clamp-3">
                        {course.shortDesc}
                      </CardDescription>
                    )}

                    {/* Instrutor */}
                    {course.instructorName && (
                      <p className="text-sm text-slate-600 mt-2">
                        Por {course.instructorName}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent>
                    {/* Info Cards */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-slate-50 rounded">
                        <BookOpen className="h-4 w-4 mx-auto mb-1 text-slate-600" />
                        <p className="text-xs text-slate-600">{course._count.modules} módulos</p>
                      </div>
                      {course.estimatedDuration && (
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <Clock className="h-4 w-4 mx-auto mb-1 text-slate-600" />
                          <p className="text-xs text-slate-600">{course.estimatedDuration}h</p>
                        </div>
                      )}
                      <div className="text-center p-2 bg-slate-50 rounded">
                        <Award className="h-4 w-4 mx-auto mb-1 text-slate-600" />
                        <p className="text-xs text-slate-600">{course._count.enrollments} alunos</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={`/course/${course.slug}`}>
                      <Button className="w-full">
                        {isEnrolled ? 'Acessar Curso' : 'Ver Detalhes'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
