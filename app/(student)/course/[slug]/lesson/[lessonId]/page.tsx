import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>
}) {
  const { slug, lessonId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar aula com curso e módulo
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      module: {
        course: {
          slug,
          tenantId: user.tenantId,
          status: 'PUBLISHED',
        },
      },
    },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    select: {
                      id: true,
                      title: true,
                      order: true,
                      isFree: true,
                    },
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
  })

  if (!lesson) {
    notFound()
  }

  const course = lesson.module.course

  // Verificar se o usuário está matriculado
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
      status: 'ACTIVE',
    },
  })

  const isEnrolled = !!enrollment
  const canAccess = isEnrolled || lesson.isFree

  // Se não pode acessar, redirecionar para página do curso
  if (!canAccess) {
    redirect(`/course/${slug}`)
  }

  // Todas as aulas do curso (para navegação)
  const allLessons = course.modules.flatMap((m, moduleIndex) =>
    m.lessons.map((l, lessonIndex) => ({
      ...l,
      moduleIndex,
      lessonIndex,
      moduleTitle: m.title,
      canAccess: isEnrolled || l.isFree,
    }))
  )

  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId)
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
  const nextLesson =
    currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-20 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/course/${slug}`}
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Curso
            </Link>
            <h1 className="text-lg font-semibold truncate max-w-md">{course.title}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video */}
            <Card>
              <CardContent className="p-0">
                {lesson.videoUrl ? (
                  <div className="aspect-video bg-black">
                    {lesson.videoUrl.includes('youtube.com') ||
                    lesson.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={(() => {
                          let videoId = ''
                          if (lesson.videoUrl.includes('youtube.com/watch')) {
                            const url = new URL(lesson.videoUrl)
                            videoId = url.searchParams.get('v') || ''
                          } else if (lesson.videoUrl.includes('youtu.be/')) {
                            videoId = lesson.videoUrl.split('youtu.be/')[1].split('?')[0]
                          }
                          return `https://www.youtube.com/embed/${videoId}`
                        })()}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : lesson.videoUrl.includes('vimeo.com') ? (
                      <iframe
                        src={(() => {
                          const videoId = lesson.videoUrl.split('vimeo.com/')[1].split('?')[0]
                          return `https://player.vimeo.com/video/${videoId}`
                        })()}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                      />
                    ) : (
                      <video src={lesson.videoUrl} controls className="w-full h-full" />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-200 flex items-center justify-center">
                    <p className="text-slate-500">Vídeo não disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Info */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-sm text-slate-500">
                    {lesson.module.title} • Aula {currentLessonIndex + 1}
                  </span>
                  <h1 className="text-2xl font-bold mt-1">{lesson.title}</h1>
                  {lesson.description && (
                    <p className="text-slate-600 mt-2">{lesson.description}</p>
                  )}
                </div>

                {!isEnrolled && lesson.isFree && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Esta é uma aula gratuita. Adquira o curso completo para ter acesso a todas as aulas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Content */}
            {lesson.content && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Conteúdo da Aula</h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="whitespace-pre-line text-slate-700">{lesson.content}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              {previousLesson && previousLesson.canAccess ? (
                <Link href={`/course/${slug}/lesson/${previousLesson.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Aula Anterior
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="flex-1" disabled>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Aula Anterior
                </Button>
              )}

              {nextLesson && nextLesson.canAccess ? (
                <Link href={`/course/${slug}/lesson/${nextLesson.id}`} className="flex-1">
                  <Button className="w-full">
                    Próxima Aula
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </Link>
              ) : (
                <Button className="flex-1" disabled>
                  Próxima Aula
                  {nextLesson && !nextLesson.canAccess && (
                    <Lock className="h-4 w-4 ml-2" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Conteúdo do Curso</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={module.id}>
                      <h4 className="font-medium text-sm text-slate-900 mb-2">
                        Módulo {moduleIndex + 1}: {module.title}
                      </h4>
                      <div className="space-y-1">
                        {module.lessons.map((l, lessonIdx) => {
                          const canAccessThis = isEnrolled || l.isFree
                          const isCurrent = l.id === lessonId

                          return (
                            <div key={l.id}>
                              {canAccessThis ? (
                                <Link href={`/course/${slug}/lesson/${l.id}`}>
                                  <div
                                    className={`p-2 rounded text-sm transition-colors ${
                                      isCurrent
                                        ? 'bg-blue-100 text-blue-900 font-medium'
                                        : 'hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500">
                                        {lessonIdx + 1}.
                                      </span>
                                      <span className="flex-1 truncate">{l.title}</span>
                                      {isCurrent && (
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                      )}
                                      {l.isFree && !isEnrolled && (
                                        <span className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded">
                                          Grátis
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                <div className="p-2 rounded text-sm bg-slate-50 text-slate-400">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">{lessonIdx + 1}.</span>
                                    <span className="flex-1 truncate">{l.title}</span>
                                    <Lock className="h-3 w-3" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
