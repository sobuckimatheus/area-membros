import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'

async function updateProductMapping(mappingId: string, formData: FormData) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const externalProductId = formData.get('externalProductId') as string
  const externalProductName = formData.get('externalProductName') as string
  const courseIds = formData.getAll('courseIds') as string[]

  if (!externalProductId) {
    throw new Error('ID do produto é obrigatório')
  }

  if (courseIds.length === 0) {
    throw new Error('Selecione pelo menos um curso')
  }

  // Atualizar o mapeamento de produto
  await prisma.productMapping.update({
    where: {
      id: mappingId,
      tenantId: user.tenantId,
    },
    data: {
      externalProductId,
      externalProductName: externalProductName || null,
      courses: {
        set: courseIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

async function deleteProductMapping(mappingId: string) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  await prisma.productMapping.delete({
    where: {
      id: mappingId,
      tenantId: user.tenantId,
    },
  })

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export default async function EditProductMappingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) return null

  const mapping = await prisma.productMapping.findFirst({
    where: {
      id,
      tenantId: user.tenantId,
    },
    include: {
      integration: {
        select: {
          platform: true,
        },
      },
      courses: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  })

  if (!mapping) {
    notFound()
  }

  const allCourses = await prisma.course.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      status: true,
    },
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Produtos
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">
          Editar Mapeamento de Produto
        </h1>
        <p className="text-slate-600 mt-2">
          Plataforma: <span className="font-semibold">{mapping.integration.platform}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Mapeamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProductMapping.bind(null, id)} className="space-y-6">
            <div>
              <Label htmlFor="externalProductId">
                ID do Produto na {mapping.integration.platform}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="externalProductId"
                name="externalProductId"
                required
                defaultValue={mapping.externalProductId}
                placeholder="ex: caf14aec-2b24-43e5-b9e5-8a833776ae20"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-sm text-slate-500 mt-1">
                O ID/SKU do produto na plataforma externa
              </p>
            </div>

            <div>
              <Label htmlFor="externalProductName">Nome do Produto (opcional)</Label>
              <Input
                id="externalProductName"
                name="externalProductName"
                defaultValue={mapping.externalProductName || ''}
                placeholder="Ex: Oração Profética"
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Nome do produto para facilitar identificação
              </p>
            </div>

            <div>
              <Label>
                Cursos Vinculados <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-slate-500 mb-3">
                Selecione um ou mais cursos que serão liberados quando este produto for
                comprado
              </p>

              {allCourses.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Você precisa criar pelo menos um curso antes de mapear produtos.{' '}
                    <Link href="/admin/courses/new" className="underline">
                      Criar curso agora
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-2 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {allCourses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="courseIds"
                        value={course.id}
                        defaultChecked={mapping.courses.some((c) => c.id === course.id)}
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-slate-900">{course.title}</span>
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            course.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {allCourses.length > 0 && (
              <div className="flex gap-4 pt-4">
                <Button type="submit">Salvar Alterações</Button>
                <Link href="/admin/products">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Excluir Mapeamento */}
      <Card className="mt-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-800 mb-4">
            Excluir este mapeamento irá desconectar o produto da plataforma externa dos
            cursos vinculados. Compras futuras deste produto não serão mais processadas
            automaticamente.
          </p>
          <form action={deleteProductMapping.bind(null, id)}>
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Mapeamento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
