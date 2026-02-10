import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Package, Link2 } from 'lucide-react'

export default async function AdminProductsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const productMappings = await prisma.productMapping.findMany({
    where: { tenantId: user.tenantId },
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
    orderBy: { createdAt: 'desc' },
  })

  const courses = await prisma.course.findMany({
    where: { tenantId: user.tenantId },
    select: {
      id: true,
      title: true,
      status: true,
    },
    orderBy: { title: 'asc' },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Mapeamento de Produtos
          </h1>
          <p className="text-slate-600 mt-2">
            Conecte produtos da Kirvano e Yampi aos cursos da plataforma
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Mapeamento
          </Button>
        </Link>
      </div>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Link2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Como funciona o mapeamento?
              </h3>
              <p className="text-sm text-blue-700">
                Quando um cliente comprar um produto na Kirvano ou Yampi, o webhook irá
                procurar o mapeamento correspondente e criar automaticamente
                uma matrícula no curso vinculado.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Importante:</strong> Você precisa do ID/SKU do produto da
                plataforma externa para criar o mapeamento. Este ID aparece nos webhooks
                recebidos ou nas configurações do produto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {productMappings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum produto mapeado
            </h3>
            <p className="text-slate-600 mb-6">
              Crie seu primeiro mapeamento para começar a automatizar as matrículas
            </p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Mapeamento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {productMappings.map((mapping) => (
            <Card key={mapping.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded">
                          {mapping.integration.platform}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-sm text-slate-600">
                          {mapping.courses.length} curso(s) vinculado(s)
                        </span>
                      </div>
                      {mapping.courses.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {mapping.courses.map((course) => (
                            <div key={course.id} className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {course.title}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
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
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">ID do Produto:</span>
                        <p className="font-mono text-slate-900">
                          {mapping.externalProductId}
                        </p>
                      </div>
                      {mapping.externalProductName && (
                        <div>
                          <span className="text-slate-500">Nome na Kirvano:</span>
                          <p className="text-slate-900">
                            {mapping.externalProductName}
                          </p>
                        </div>
                      )}
                    </div>


                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        Criado em {new Date(mapping.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {mapping.updatedAt && (
                        <span>
                          Atualizado em {new Date(mapping.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/products/${mapping.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {courses.length === 0 && productMappings.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <p className="text-yellow-800">
              <strong>Atenção:</strong> Você precisa criar pelo menos um curso
              antes de mapear produtos.{' '}
              <Link href="/admin/courses/new" className="underline">
                Criar curso agora
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
