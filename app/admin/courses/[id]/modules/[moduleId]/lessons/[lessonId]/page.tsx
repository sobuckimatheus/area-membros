import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  formData: FormData
) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const videoUrl = formData.get('videoUrl') as string
  const videoDuration = formData.get('videoDuration') as string
  const isFree = formData.get('isFree') === 'on'

  if (!title) {
    throw new Error('Título é obrigatório')
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      description,
      content,
      videoUrl: videoUrl || null,
      videoDuration: videoDuration ? parseInt(videoDuration) : null,
      isFree,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`)
  revalidatePath(
    `/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
  )
}

async function deleteLesson(
  courseId: string,
  moduleId: string,
  lessonId: string
) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`)
  redirect(`/admin/courses/${courseId}/modules/${moduleId}`)
}

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>
}) {
  const { id, moduleId, lessonId } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      moduleId,
      module: {
        courseId: id,
        course: {
          tenantId: user.tenantId,
        },
      },
    },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  })

  if (!lesson) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href={`/admin/courses/${id}/modules/${moduleId}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para {lesson.module.title}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Editar Aula</h1>
            <p className="text-slate-600 mt-2">{lesson.title}</p>
          </div>
          <form action={deleteLesson.bind(null, id, moduleId, lessonId)}>
            <Button type="submit" variant="destructive" size="sm">
              Excluir Aula
            </Button>
          </form>
        </div>
      </div>

      {/* Formulário de Edição */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={updateLesson.bind(null, id, moduleId, lessonId)}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="title">
                Título da Aula <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={lesson.title}
                placeholder="Ex: Fundamentos da Oração"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição Curta</Label>
              <Input
                id="description"
                name="description"
                defaultValue={lesson.description || ''}
                placeholder="Breve descrição da aula"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">URL do Vídeo</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                type="url"
                defaultValue={lesson.videoUrl || ''}
                placeholder="https://www.youtube.com/watch?v=... ou URL de vídeo"
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Cole o link do YouTube, Vimeo ou URL direta do vídeo
              </p>
            </div>

            <div>
              <Label htmlFor="videoDuration">Duração do Vídeo (minutos)</Label>
              <Input
                id="videoDuration"
                name="videoDuration"
                type="number"
                min="0"
                defaultValue={lesson.videoDuration || ''}
                placeholder="Ex: 45"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Conteúdo da Aula</Label>
              <textarea
                id="content"
                name="content"
                rows={10}
                defaultValue={lesson.content || ''}
                placeholder="Conteúdo textual da aula, materiais de apoio, transcrição, etc..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
              />
              <p className="text-sm text-slate-500 mt-1">
                Você pode usar Markdown para formatar o conteúdo
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                defaultChecked={lesson.isFree}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              <Label htmlFor="isFree" className="cursor-pointer">
                Aula gratuita (preview)
              </Label>
              <p className="text-sm text-slate-500">
                Permite visualização sem estar matriculado
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Salvar Alterações</Button>
              <Link href={`/admin/courses/${id}/modules/${moduleId}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview do Vídeo */}
      {lesson.videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Preview do Vídeo</CardTitle>
          </CardHeader>
          <CardContent>
            {lesson.videoUrl.includes('youtube.com') ||
            lesson.videoUrl.includes('youtu.be') ? (
              <div className="aspect-video">
                <iframe
                  src={(() => {
                    // Extrair ID do YouTube
                    let videoId = ''
                    if (lesson.videoUrl.includes('youtube.com/watch')) {
                      const url = new URL(lesson.videoUrl)
                      videoId = url.searchParams.get('v') || ''
                    } else if (lesson.videoUrl.includes('youtu.be/')) {
                      videoId = lesson.videoUrl.split('youtu.be/')[1].split('?')[0]
                    }
                    return `https://www.youtube.com/embed/${videoId}`
                  })()}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : lesson.videoUrl.includes('vimeo.com') ? (
              <div className="aspect-video">
                <iframe
                  src={(() => {
                    const videoId = lesson.videoUrl.split('vimeo.com/')[1].split('?')[0]
                    return `https://player.vimeo.com/video/${videoId}`
                  })()}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                />
              </div>
            ) : (
              <video
                src={lesson.videoUrl}
                controls
                className="w-full rounded-lg"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
