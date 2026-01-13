import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft, Plus, Video } from 'lucide-react'
import { CourseImageUpload } from '@/components/course-image-upload'

async function updateModule(
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
  const thumbnailUrl = formData.get('thumbnailUrl') as string

  if (!title) {
    throw new Error('Título é obrigatório')
  }

  await prisma.module.update({
    where: {
      id: moduleId,
    },
    data: {
      title,
      description,
      thumbnailUrl: thumbnailUrl || null,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`)
}

async function deleteModule(courseId: string, moduleId: string) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  // Deletar todas as aulas do módulo primeiro
  await prisma.lesson.deleteMany({
    where: { moduleId },
  })

  // Deletar o módulo
  await prisma.module.delete({
    where: { id: moduleId },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  redirect(`/admin/courses/${courseId}`)
}

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { id, moduleId } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const courseModule = await prisma.module.findFirst({
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
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!courseModule) {
    notFound()
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <Link
          href={`/admin/courses/${id}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para {courseModule.course.title}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Editar Módulo
            </h1>
            <p className="text-slate-600 mt-2">{courseModule.title}</p>
          </div>
          <form action={deleteModule.bind(null, id, moduleId)}>
            <Button type="submit" variant="destructive" size="sm">
              Excluir Módulo
            </Button>
          </form>
        </div>
      </div>

      {/* Formulário de Edição */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações do Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={updateModule.bind(null, id, moduleId)}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="title">
                Título do Módulo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={courseModule.title}
                placeholder="Ex: Introdução à Oração"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={courseModule.description || ''}
                placeholder="Descrição do módulo..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <CourseImageUpload
              type="thumbnail"
              currentImageUrl={courseModule.thumbnailUrl}
              label="Imagem do Módulo"
              description="Imagem horizontal exibida no card do módulo - formato YouTube (recomendado: 1280x720px)"
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit">Salvar Alterações</Button>
              <Link href={`/admin/courses/${id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Aulas do Módulo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Aulas do Módulo</CardTitle>
            <Link href={`/admin/courses/${id}/modules/${moduleId}/lessons/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Aula
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {courseModule.lessons.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Nenhuma aula cadastrada
              </h3>
              <p className="text-slate-600 mb-6">
                Adicione aulas para estruturar o conteúdo deste módulo
              </p>
              <Link
                href={`/admin/courses/${id}/modules/${moduleId}/lessons/new`}
              >
                <Button>Adicionar Primeira Aula</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {courseModule.lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/admin/courses/${id}/modules/${moduleId}/lessons/${lesson.id}`}
                >
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-slate-500 w-8">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-slate-600 mt-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    {lesson.videoUrl && (
                      <Video className="h-5 w-5 text-slate-400" />
                    )}
                    {lesson.isFree && (
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                        Gratuita
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
