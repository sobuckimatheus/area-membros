import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Play, CheckCircle, Clock } from 'lucide-react'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar curso
  const course = await prisma.course.findFirst({
    where: {
      slug,
      tenantId: user.tenantId,
      status: 'PUBLISHED',
    },
    include: {
      category: true,
      modules: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!course) {
    notFound()
  }

  // Verificar se o usuário está matriculado
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
      status: 'ACTIVE',
    },
  })

  const isEnrolled = !!enrollment

  // Calcular estatísticas
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const freeLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.isFree).length,
    0
  )

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/courses"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Cursos
          </Link>
        </div>
      </header>

      {/* Course Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            {course.category && (
              <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                {course.category.name}
              </span>
            )}
            <h1 className="text-4xl font-bold mt-4 mb-4">{course.title}</h1>
            {course.shortDesc && (
              <p className="text-xl text-blue-100 mb-6">{course.shortDesc}</p>
            )}

            {/* Info */}
            <div className="flex flex-wrap gap-6 text-blue-100">
              {course.instructorName && (
                <div className="flex items-center gap-2">
                  <span>Por {course.instructorName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{totalLessons} aulas</span>
              </div>
              {course.estimatedDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.estimatedDuration} horas</span>
                </div>
              )}
            </div>

            {/* CTA */}
            {!isEnrolled && (
              <div className="mt-8 p-6 bg-white/10 backdrop-blur rounded-lg border border-white/20">
                <p className="text-white mb-4">
                  {freeLessons > 0
                    ? `${freeLessons} aula${freeLessons > 1 ? 's' : ''} gratuita${freeLessons > 1 ? 's' : ''} disponível${freeLessons > 1 ? 'eis' : ''} para preview!`
                    : 'Adquira este curso para ter acesso a todo o conteúdo'}
                </p>
                {course.checkoutUrl && (
                  <a href={course.checkoutUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      Comprar Agora
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About */}
            {course.description && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Sobre o Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-line">{course.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Modules */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Conteúdo do Curso</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {course.modules.map((module, moduleIndex) => (
                  <Card key={module.id} className="group overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Module Thumbnail */}
                    {module.thumbnailUrl ? (
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={module.thumbnailUrl}
                          alt={module.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="text-xs text-white/80 mb-1">
                            Módulo {moduleIndex + 1}
                          </div>
                          <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                            {module.title}
                          </h3>
                          <p className="text-xs text-white/70">
                            {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-blue-700">
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <div className="text-xs text-white/80 mb-2">
                            Módulo {moduleIndex + 1}
                          </div>
                          <h3 className="text-white font-bold text-sm line-clamp-3 mb-2">
                            {module.title}
                          </h3>
                          <p className="text-xs text-white/70">
                            {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Lessons List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Todas as Aulas</h3>
                {course.modules.map((module, moduleIndex) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-slate-500 mb-1">
                            Módulo {moduleIndex + 1}
                          </div>
                          <CardTitle>{module.title}</CardTitle>
                          {module.description && (
                            <p className="text-sm text-slate-600 mt-2">{module.description}</p>
                          )}
                        </div>
                        <span className="text-sm text-slate-500 ml-4">
                          {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const canAccess = isEnrolled || lesson.isFree

                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                canAccess
                                  ? 'hover:bg-blue-50 border-slate-200 cursor-pointer'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-sm font-medium">
                                {lessonIndex + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 truncate">
                                  {lesson.title}
                                </h4>
                                {lesson.description && (
                                  <p className="text-sm text-slate-600 truncate">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {lesson.videoDuration && (
                                  <span className="text-sm text-slate-500">
                                    {lesson.videoDuration} min
                                  </span>
                                )}

                                {canAccess ? (
                                  <Link href={`/course/${course.slug}/lesson/${lesson.id}`}>
                                    <Button size="sm" variant="ghost">
                                      <Play className="h-4 w-4 mr-1" />
                                      {lesson.isFree && !isEnrolled ? 'Preview' : 'Assistir'}
                                    </Button>
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Lock className="h-4 w-4" />
                                    <span className="text-sm">Bloqueado</span>
                                  </div>
                                )}

                                {lesson.isFree && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                    Grátis
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Card */}
            <Card className="sticky top-4">
              <CardHeader>
                {course.thumbnailUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle>
                  {isEnrolled ? 'Você está matriculado!' : 'Adquira este curso'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Acesso Total</span>
                      </div>
                      <p className="text-sm text-green-600">
                        Você tem acesso completo a todas as aulas deste curso.
                      </p>
                    </div>
                    <Link href="/dashboard">
                      <Button className="w-full">Ir para Meus Cursos</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Total de aulas:</span>
                        <span className="font-medium">{totalLessons}</span>
                      </div>
                      {freeLessons > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Aulas gratuitas:</span>
                          <span className="font-medium">{freeLessons}</span>
                        </div>
                      )}
                      {course.estimatedDuration && (
                        <div className="flex justify-between">
                          <span>Duração total:</span>
                          <span className="font-medium">{course.estimatedDuration}h</span>
                        </div>
                      )}
                    </div>
                    {course.checkoutUrl ? (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-slate-600 mb-4">
                          Clique no botão abaixo para adquirir acesso completo ao curso.
                        </p>
                        <a href={course.checkoutUrl} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full" size="lg">
                            Comprar Agora
                          </Button>
                        </a>
                      </div>
                    ) : (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-slate-600 mb-4">
                          Entre em contato para adquirir acesso completo ao curso.
                        </p>
                        <Button className="w-full" disabled>
                          Entrar em Contato
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
