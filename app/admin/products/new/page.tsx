import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

async function createProductMapping(formData: FormData) {
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

  // Buscar ou criar integração Kirvano
  let integration = await prisma.integration.findFirst({
    where: {
      tenantId: user.tenantId,
      platform: 'KIRVANO',
    },
  })

  if (!integration) {
    integration = await prisma.integration.create({
      data: {
        tenantId: user.tenantId,
        platform: 'KIRVANO',
        isActive: true,
      },
    })
  }

  // Criar o mapeamento de produto
  await prisma.productMapping.create({
    data: {
      tenantId: user.tenantId,
      integrationId: integration.id,
      externalProductId,
      externalProductName: externalProductName || null,
      isActive: true,
      courses: {
        connect: courseIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export default async function NewProductMappingPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const courses = await prisma.course.findMany({
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
        <h1 className="text-3xl font-bold text-slate-900">
          Novo Mapeamento de Produto
        </h1>
        <p className="text-slate-600 mt-2">
          Conecte um produto da Kirvano aos cursos da plataforma
        </p>
      </div>

      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-medium text-blue-900 mb-2">
            Como obter o ID do produto na Kirvano?
          </h3>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>Acesse a Kirvano e vá em Produtos</li>
            <li>Clique no produto desejado</li>
            <li>
              O ID aparece na URL ou nas configurações do produto (formato UUID)
            </li>
            <li>
              Você também pode ver o ID nos webhooks recebidos em{' '}
              <a href="/admin/webhooks" className="underline">
                Logs de Webhooks
              </a>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Mapeamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProductMapping} className="space-y-6">
            <div>
              <Label htmlFor="externalProductId">
                ID do Produto na Kirvano <span className="text-red-500">*</span>
              </Label>
              <Input
                id="externalProductId"
                name="externalProductId"
                required
                placeholder="ex: caf14aec-2b24-43e5-b9e5-8a833776ae20"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-sm text-slate-500 mt-1">
                O UUID do produto na plataforma Kirvano
              </p>
            </div>

            <div>
              <Label htmlFor="externalProductName">
                Nome do Produto (opcional)
              </Label>
              <Input
                id="externalProductName"
                name="externalProductName"
                placeholder="Ex: Oração Profética"
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Nome do produto na Kirvano para facilitar identificação
              </p>
            </div>

            <div>
              <Label>
                Cursos Vinculados <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-slate-500 mb-3">
                Selecione um ou mais cursos que serão liberados quando este
                produto for comprado
              </p>

              {courses.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Você precisa criar pelo menos um curso antes de mapear
                    produtos.{' '}
                    <a href="/admin/courses/new" className="underline">
                      Criar curso agora
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-2 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="courseIds"
                        value={course.id}
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-slate-900">
                          {course.title}
                        </span>
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            course.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {course.status === 'PUBLISHED'
                            ? 'Publicado'
                            : 'Rascunho'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {courses.length > 0 && (
              <div className="flex gap-4 pt-4">
                <Button type="submit">Criar Mapeamento</Button>
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

      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 text-sm text-yellow-800">
          <strong>Importante:</strong> Após criar o mapeamento, quando alguém
          comprar este produto na Kirvano, o webhook irá automaticamente criar
          matrículas nos cursos vinculados.
        </CardContent>
      </Card>
    </div>
  )
}
