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
import { CourseImageUpload } from '@/components/course-image-upload'

async function createModule(courseId: string, formData: FormData) {
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

  // Verificar se o curso existe e pertence ao tenant
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      tenantId: user.tenantId,
    },
    include: {
      modules: {
        orderBy: { order: 'desc' },
        take: 1,
      },
    },
  })

  if (!course) {
    throw new Error('Curso não encontrado')
  }

  // Calcular a ordem do novo módulo
  const nextOrder = course.modules.length > 0 ? course.modules[0].order + 1 : 1

  await prisma.module.create({
    data: {
      courseId,
      title,
      description,
      thumbnailUrl: thumbnailUrl || null,
      order: nextOrder,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  redirect(`/admin/courses/${courseId}`)
}

export default async function NewModulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const course = await prisma.course.findUnique({
    where: {
      id,
      tenantId: user.tenantId,
    },
    select: {
      id: true,
      title: true,
    },
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href={`/admin/courses/${id}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para {course.title}
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Novo Módulo</h1>
        <p className="text-slate-600 mt-2">
          Adicione um novo módulo ao curso {course.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createModule.bind(null, id)} className="space-y-6">
            <div>
              <Label htmlFor="title">
                Título do Módulo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
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
                placeholder="Descrição do módulo..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <CourseImageUpload
              type="thumbnail"
              label="Imagem do Módulo"
              description="Imagem horizontal exibida no card do módulo - formato YouTube (recomendado: 1280x720px)"
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit">Criar Módulo</Button>
              <Link href={`/admin/courses/${id}`}>
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
          <strong>Dica:</strong> Após criar o módulo, você poderá adicionar
          aulas a ele.
        </CardContent>
      </Card>
    </div>
  )
}
