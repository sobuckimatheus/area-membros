import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { CourseImageUpload } from '@/components/course-image-upload'

async function createCourse(formData: FormData) {
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
  const thumbnailUrl = formData.get('thumbnailUrl') as string
  const isFree = formData.get('isFree') === 'on'

  if (!title) {
    throw new Error('Título é obrigatório')
  }

  // Gerar slug a partir do título
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const course = await prisma.course.create({
    data: {
      tenantId: user.tenantId,
      title,
      slug,
      description,
      shortDesc,
      instructorName: instructorName || null,
      categoryId: categoryId || null,
      thumbnailUrl: thumbnailUrl || null,
      status: 'DRAFT',
      visibility: 'PRIVATE',
      isFree,
    },
  })

  // Se o curso for gratuito, matricular todos os alunos automaticamente
  if (isFree) {
    const students = await prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        role: 'STUDENT',
      },
    })

    const enrollments = students.map(student => ({
      userId: student.id,
      courseId: course.id,
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

  revalidatePath('/admin/courses')
  redirect('/admin/courses')
}

export default async function NewCoursePage() {
  const user = await getCurrentUser()

  if (!user) return null

  const categories = await prisma.category.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Novo Curso</h1>
        <p className="text-slate-600 mt-2">
          Crie um novo curso na plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourse} className="space-y-6">
            <div>
              <Label htmlFor="title">
                Título do Curso <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Ex: Oração Profética"
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                O slug será gerado automaticamente a partir do título
              </p>
            </div>

            <div>
              <Label htmlFor="shortDesc">Descrição Curta</Label>
              <Input
                id="shortDesc"
                name="shortDesc"
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
                placeholder="Descrição completa do curso..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <Label htmlFor="instructorName">Nome do Instrutor</Label>
              <Input
                id="instructorName"
                name="instructorName"
                placeholder="Nome do instrutor"
                className="mt-1"
              />
            </div>

            <CourseImageUpload type="thumbnail" />

            {categories.length > 0 && (
              <div>
                <Label htmlFor="categoryId">Categoria</Label>
                <select
                  id="categoryId"
                  name="categoryId"
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

            <div className="flex gap-4 pt-4">
              <Button type="submit">Criar Curso</Button>
              <Link href="/admin/courses">
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
          <strong>Dica:</strong> O curso será criado como rascunho. Você poderá
          adicionar módulos, aulas e configurações adicionais depois de criá-lo.
        </CardContent>
      </Card>
    </div>
  )
}
