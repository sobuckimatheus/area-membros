export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/actions/auth'
import { hasActiveSubscription } from '@/lib/services/subscription'
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

  // Verificar se usuário é assinante
  const isSubscriber = await hasActiveSubscription(user.id)

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
    <div className="min-h-screen bg-black pt-20">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/courses"
            className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Cursos
          </Link>
        </div>
      </header>

      {/* Hero Banner Image */}
      {course.bannerUrl && (
        <div className="w-full border-b border-zinc-800">
          <img
            src={course.bannerUrl}
            alt={course.title}
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>
      )}

      {/* Course Header */}
      <div className="bg-gradient-to-br from-zinc-900 to-black text-white border-b border-zinc-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            {course.category && (
              <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                {course.category.name}
              </span>
            )}
            <h1 className="text-4xl font-bold mt-4 mb-4">{course.title}</h1>
            {course.shortDesc && (
              <p className="text-xl text-zinc-300 mb-6">{course.shortDesc}</p>
            )}

            {/* Info */}
            <div className="flex flex-wrap gap-6 text-zinc-300">
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
          </div>
        </div>
      </div>

      {/* Course Content */}
      <main className="container mx-auto px-4 py-8">
        <div className={`grid grid-cols-1 gap-8 ${isEnrolled ? 'lg:grid-cols-3' : ''}`}>
          {/* Main Content */}
          <div className={isEnrolled ? 'lg:col-span-2' : ''}>
            {/* Intro Video */}
            {course.introVideoUrl && (
              <div className="mb-6 max-w-xl mx-auto">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white">Vídeo Introdutório</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black">
                      {course.introVideoUrl.includes('youtube.com') ||
                      course.introVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={(() => {
                            let videoId = ''
                            if (course.introVideoUrl.includes('youtube.com/watch')) {
                              const url = new URL(course.introVideoUrl)
                              videoId = url.searchParams.get('v') || ''
                            } else if (course.introVideoUrl.includes('youtu.be/')) {
                              videoId = course.introVideoUrl.split('youtu.be/')[1].split('?')[0]
                            }
                            return `https://www.youtube.com/embed/${videoId}`
                          })()}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <video src={course.introVideoUrl} controls className="w-full h-full" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CTA */}
            {!isEnrolled && course.checkoutUrl && !course.isFullyBooked && (
              <div className="mb-6 p-6 bg-zinc-800/50 backdrop-blur rounded-lg border border-zinc-700">
                <p className="text-white text-lg font-semibold mb-4">
                  {freeLessons > 0
                    ? `${freeLessons} aula${freeLessons > 1 ? 's' : ''} gratuita${freeLessons > 1 ? 's' : ''} disponível${freeLessons > 1 ? 'eis' : ''} para preview!`
                    : 'Adquira este curso para ter acesso a todo o conteúdo'}
                </p>

                <div className="space-y-3">
                  {/* Botão Preço Normal */}
                  {course.price && (
                    <a href={course.checkoutUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full bg-white text-gray-800 hover:bg-gray-100 font-semibold">
                        Comprar Agora - R$ {Number(course.price).toFixed(2)}
                      </Button>
                    </a>
                  )}

                  {/* Botão Preço Para Assinantes */}
                  {course.subscriberPrice && (
                    <>
                      {isSubscriber ? (
                        <a
                          href={course.subscriberCheckoutUrl || course.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold">
                            Para assinantes - R$ {Number(course.subscriberPrice).toFixed(2)}
                          </Button>
                        </a>
                      ) : (
                        <Button
                          disabled
                          className="w-full bg-green-600 border-2 border-green-600 text-white font-semibold opacity-60 cursor-not-allowed"
                        >
                          Para assinantes - R$ {Number(course.subscriberPrice).toFixed(2)}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Vagas Esgotadas */}
            {!isEnrolled && course.isFullyBooked && (
              <div className="mb-6 p-6 bg-red-900/20 backdrop-blur rounded-lg border border-red-800">
                <p className="text-red-400 text-lg font-semibold text-center">
                  🔒 Vagas Esgotadas
                </p>
                <p className="text-red-300 text-sm text-center mt-2">
                  Este curso não está mais disponível para compra no momento.
                </p>
              </div>
            )}

            {/* About */}
            {course.description && (
              <Card className="mb-6 bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Sobre o Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 whitespace-pre-line">{course.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Modules */}
            <div>
              {/* Lessons List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Todas as Aulas</h3>
                {course.modules.map((module, moduleIndex) => (
                  <Card key={module.id} className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-zinc-500 mb-1">
                            Módulo {moduleIndex + 1}
                          </div>
                          <CardTitle className="text-white">{module.title}</CardTitle>
                          {module.description && (
                            <p className="text-sm text-zinc-400 mt-2">{module.description}</p>
                          )}
                        </div>
                        <span className="text-sm text-zinc-500 ml-4">
                          {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const canAccess = isEnrolled || lesson.isFree

                          const lessonContent = (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                canAccess
                                  ? 'hover:bg-zinc-800 border-zinc-700 cursor-pointer'
                                  : 'bg-zinc-800/50 border-zinc-700'
                              }`}
                            >
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-medium">
                                {lessonIndex + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">
                                  {lesson.title}
                                </h4>
                                {lesson.description && (
                                  <p className="text-sm text-zinc-400 truncate">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {lesson.videoDuration && (
                                  <span className="text-sm text-zinc-400">
                                    {lesson.videoDuration} min
                                  </span>
                                )}

                                {canAccess ? (
                                  <Button size="sm" variant="ghost" className="text-white hover:bg-zinc-700">
                                    <Play className="h-4 w-4 mr-1" />
                                    {lesson.isFree && !isEnrolled ? 'Preview' : 'Assistir'}
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2 text-zinc-500">
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

                          return canAccess ? (
                            <Link key={lesson.id} href={`/course/${course.slug}/lesson/${lesson.id}`} prefetch={false}>
                              {lessonContent}
                            </Link>
                          ) : (
                            <div key={lesson.id}>{lessonContent}</div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - só aparece se estiver matriculado */}
          {isEnrolled && (
            <div className="lg:col-span-1">
              {/* Course Card */}
              <Card className="sticky top-4 bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Você está matriculado!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Acesso Total</span>
                    </div>
                    <p className="text-sm text-green-300">
                      Você tem acesso completo a todas as aulas deste curso.
                    </p>
                  </div>
                  <Link href="/dashboard" prefetch={false}>
                    <Button className="w-full bg-red-600 hover:bg-red-700">Ir para Meus Cursos</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
