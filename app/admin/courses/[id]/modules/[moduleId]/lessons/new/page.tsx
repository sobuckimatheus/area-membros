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

async function createLesson(
  courseId: string,
  moduleId: string,
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

  // Verificar se o módulo existe e pertence ao tenant
  const module = await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId,
      course: {
        tenantId: user.tenantId,
      },
    },
    include: {
      lessons: {
        orderBy: { order: 'desc' },
        take: 1,
      },
    },
  })

  if (!module) {
    throw new Error('Módulo não encontrado')
  }

  // Calcular a ordem da nova aula
  const nextOrder = module.lessons.length > 0 ? module.lessons[0].order + 1 : 1

  await prisma.lesson.create({
    data: {
      moduleId,
      title,
      description,
      content,
      type: 'VIDEO',
      videoUrl: videoUrl || null,
      videoDuration: videoDuration ? parseInt(videoDuration) : null,
      order: nextOrder,
      isFree,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`)
  redirect(`/admin/courses/${courseId}/modules/${moduleId}`)
}

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { id, moduleId } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const module = await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId: id,
      course: {
        tenantId: user.tenantId,
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!module) {
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
          Voltar para {module.title}
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Nova Aula</h1>
        <p className="text-slate-600 mt-2">
          Adicione uma nova aula ao módulo {module.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createLesson.bind(null, id, moduleId)}
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
                placeholder="Ex: Fundamentos da Oração"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição Curta</Label>
              <Input
                id="description"
                name="description"
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
              <Button type="submit">Criar Aula</Button>
              <Link href={`/admin/courses/${id}/modules/${moduleId}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-sm text-blue-800">
          <strong>Dica:</strong> As aulas ficam visíveis quando o curso está
          publicado. Marque "Aula gratuita" para permitir preview sem matrícula.
        </CardContent>
      </Card>
    </div>
  )
}
