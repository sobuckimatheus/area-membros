import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { BookOpen, Users, Clock, ArrowLeft, Eye, EyeOff, Trash2 } from 'lucide-react'
import { CourseImageUpload } from '@/components/course-image-upload'
import { DeleteCourseButton } from '@/components/delete-course-button'

async function updateCourse(courseId: string, formData: FormData) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const shortDesc = formData.get('shortDesc') as string
  const instructorName = formData.get('instructorName') as string
  const categoryId = formData.get('categoryId') as string
  const estimatedDuration = formData.get('estimatedDuration') as string
  const thumbnailUrl = formData.get('thumbnailUrl') as string
  const bannerUrl = formData.get('bannerUrl') as string
  const introVideoUrl = formData.get('introVideoUrl') as string
  const checkoutUrl = formData.get('checkoutUrl') as string
  const price = formData.get('price') as string
  const subscriberPrice = formData.get('subscriberPrice') as string
  const subscriberCheckoutUrl = formData.get('subscriberCheckoutUrl') as string
  const isFree = formData.get('isFree') === 'on'
  const isFullyBooked = formData.get('isFullyBooked') === 'on'

  if (!title) {
    throw new Error('Título é obrigatório')
  }

  // Gerar novo slug se o título mudou
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Verificar se o curso está mudando para gratuito
  const currentCourse = await prisma.course.findUnique({
    where: { id: courseId },
    select: { isFree: true },
  })

  await prisma.course.update({
    where: {
      id: courseId,
      tenantId: user.tenantId,
    },
    data: {
      title,
      slug,
      description,
      shortDesc,
      instructorName: instructorName || null,
      category: categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true },
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
      thumbnailUrl: thumbnailUrl || null,
      bannerUrl: bannerUrl || null,
      introVideoUrl: introVideoUrl || null,
      checkoutUrl: checkoutUrl || null,
      price: price ? parseFloat(price) : null,
      subscriberPrice: subscriberPrice ? parseFloat(subscriberPrice) : null,
      subscriberCheckoutUrl: subscriberCheckoutUrl || null,
      isFree,
      isFullyBooked,
    },
  })

  // Se o curso está mudando para gratuito, matricular todos os alunos
  if (isFree && !currentCourse?.isFree) {
    const students = await prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        role: 'STUDENT',
      },
    })

    const enrollments = students.map(student => ({
      userId: student.id,
      courseId: courseId,
      tenantId: user.tenantId,
      status: 'ACTIVE' as const,
    }))

    if (enrollments.length > 0) {
      await prisma.enrollment.createMany({
        data: enrollments,
        skipDuplicates: true,
      })
    }
  }

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath('/admin/courses')
}

async function toggleCourseStatus(courseId: string, currentStatus: string) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'

  await prisma.course.update({
    where: {
      id: courseId,
      tenantId: user.tenantId,
    },
    data: {
      status: newStatus,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath('/admin/courses')
}

async function deleteCourse(courseId: string) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  // Deletar o curso (cascade vai deletar módulos, aulas, etc)
  await prisma.course.delete({
    where: {
      id: courseId,
      tenantId: user.tenantId,
    },
  })

  revalidatePath('/admin/courses')
  redirect('/admin/courses')
}

export default async function CourseDetailPage({
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
    include: {
      category: true,
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  })

  if (!course) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  })

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  )

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {course.title}
            </h1>
            <p className="text-slate-600 mt-2">Edite as informações do curso</p>
          </div>
          <div className="flex gap-2">
            <form
              action={toggleCourseStatus.bind(null, id, course.status)}
            >
              <Button
                type="submit"
                variant={course.status === 'PUBLISHED' ? 'outline' : 'default'}
              >
                {course.status === 'PUBLISHED' ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Despublicar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publicar
                  </>
                )}
              </Button>
            </form>
            <DeleteCourseButton
              courseId={id}
              courseName={course.title}
              deleteAction={deleteCourse}
            />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Módulos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {course.modules.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Aulas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalLessons}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Alunos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {course._count.enrollments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Duração</p>
                <p className="text-2xl font-bold text-slate-900">
                  {course.estimatedDuration || '-'}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Curso */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">
                Status do Curso
              </h3>
              <p className="text-sm text-slate-600">
                {course.status === 'PUBLISHED'
                  ? 'Este curso está visível para os alunos'
                  : 'Este curso está em modo rascunho e não é visível para os alunos'}
              </p>
            </div>
            <span
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                course.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Edição */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações do Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCourse.bind(null, id)} className="space-y-6">
            <div>
              <Label htmlFor="title">
                Título do Curso <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={course.title}
                placeholder="Ex: Oração Profética"
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                O slug será atualizado automaticamente: {course.slug}
              </p>
            </div>

            <div>
              <Label htmlFor="shortDesc">Descrição Curta</Label>
              <Input
                id="shortDesc"
                name="shortDesc"
                defaultValue={course.shortDesc || ''}
                placeholder="Descrição curta para cards e listagens"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição Completa</Label>
              <textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={course.description || ''}
                placeholder="Descrição completa do curso..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructorName">Nome do Instrutor</Label>
                <Input
                  id="instructorName"
                  name="instructorName"
                  defaultValue={course.instructorName || ''}
                  placeholder="Nome do instrutor"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="estimatedDuration">Duração (horas)</Label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  type="number"
                  min="0"
                  defaultValue={course.estimatedDuration || ''}
                  placeholder="Ex: 40"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CourseImageUpload
                type="thumbnail"
                currentImageUrl={course.thumbnailUrl}
              />
              <CourseImageUpload
                type="banner"
                currentImageUrl={course.bannerUrl}
              />
            </div>

            <div>
              <Label htmlFor="introVideoUrl">Vídeo Introdutório (YouTube)</Label>
              <Input
                id="introVideoUrl"
                name="introVideoUrl"
                type="url"
                defaultValue={course.introVideoUrl || ''}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Vídeo explicativo/informativo do curso. Será exibido para todos os visitantes da página do curso.
              </p>
            </div>

            <div>
              <Label htmlFor="checkoutUrl">Link de Compra (Checkout)</Label>
              <Input
                id="checkoutUrl"
                name="checkoutUrl"
                type="url"
                defaultValue={course.checkoutUrl || ''}
                placeholder="https://pay.kirvano.com/..."
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Cole aqui o link do checkout da Kirvano, Hotmart, etc. Este link será usado no botão &quot;Comprar agora&quot;.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço Normal (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={course.price?.toString() || ''}
                  placeholder="97.00"
                  className="mt-1"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Preço padrão do curso.
                </p>
              </div>

              <div>
                <Label htmlFor="subscriberPrice">Preço para Assinantes (R$)</Label>
                <Input
                  id="subscriberPrice"
                  name="subscriberPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={course.subscriberPrice?.toString() || ''}
                  placeholder="47.00"
                  className="mt-1"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Preço especial para assinantes.
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="subscriberCheckoutUrl">Link de Checkout para Assinantes</Label>
              <Input
                id="subscriberCheckoutUrl"
                name="subscriberCheckoutUrl"
                type="url"
                defaultValue={course.subscriberCheckoutUrl || ''}
                placeholder="https://pay.kirvano.com/..."
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Link específico para compra com desconto de assinante.
              </p>
            </div>

            {categories.length > 0 && (
              <div>
                <Label htmlFor="categoryId">Categoria</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={course.categoryId || ''}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  defaultChecked={course.isFree}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <Label htmlFor="isFree" className="cursor-pointer">
                    Curso Gratuito
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Ao marcar esta opção, todos os alunos serão matriculados automaticamente neste curso.
                    Novos alunos também serão matriculados automaticamente ao se cadastrarem.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isFullyBooked"
                  name="isFullyBooked"
                  defaultChecked={course.isFullyBooked}
                  className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <Label htmlFor="isFullyBooked" className="cursor-pointer text-red-900">
                    Vagas Encerradas
                  </Label>
                  <p className="text-sm text-red-700 mt-1">
                    Ao marcar esta opção, o curso será exibido com a faixa &quot;Vagas Esgotadas&quot; e os botões de compra serão desabilitados.
                    Os alunos não poderão se matricular nem comprar este curso.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Salvar Alterações</Button>
              <Link href="/admin/courses">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Módulos e Aulas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Módulos e Aulas</CardTitle>
            <Link href={`/admin/courses/${id}/modules/new`}>
              <Button size="sm">Adicionar Módulo</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {course.modules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Nenhum módulo cadastrado
              </h3>
              <p className="text-slate-600 mb-6">
                Adicione módulos e aulas para estruturar seu curso
              </p>
              <Link href={`/admin/courses/${id}/modules/new`}>
                <Button>Adicionar Primeiro Módulo</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, index) => (
                <div
                  key={module.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          MÓDULO {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mt-1">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-slate-600 mt-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                    <Link href={`/admin/courses/${id}/modules/${module.id}`}>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </Link>
                  </div>

                  {module.lessons.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-2 bg-slate-50 rounded"
                        >
                          <span className="text-xs font-medium text-slate-500 w-8">
                            {lessonIndex + 1}
                          </span>
                          <span className="text-sm text-slate-900 flex-1">
                            {lesson.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 mt-3">
                      Nenhuma aula neste módulo
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
