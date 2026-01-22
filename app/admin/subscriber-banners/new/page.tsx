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

async function createBanner(formData: FormData) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const imageUrl = formData.get('thumbnailUrl') as string // O componente usa thumbnailUrl
  const description = formData.get('description') as string
  const link = formData.get('link') as string
  const linkText = formData.get('linkText') as string
  const order = formData.get('order') as string
  const isActive = formData.get('isActive') === 'on'

  if (!imageUrl) {
    throw new Error('Imagem do banner é obrigatória')
  }

  await prisma.subscriberBanner.create({
    data: {
      tenantId: user.tenantId,
      title: title || null,
      imageUrl,
      description: description || null,
      link: link || null,
      linkText: linkText || null,
      order: order ? parseInt(order, 10) : 0,
      isActive,
    },
  })

  revalidatePath('/admin/subscriber-banners')
  redirect('/admin/subscriber-banners')
}

export default async function NewSubscriberBannerPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    return <div>Acesso negado</div>
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Novo Banner</h1>
        <p className="text-slate-600 mt-2">
          Crie um novo banner promocional para a área do assinante
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBanner} className="space-y-6">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Benefícios Exclusivos"
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Título opcional que aparece abaixo da imagem
              </p>
            </div>

            <CourseImageUpload
              type="thumbnail"
              label="Imagem do Banner"
              description="Imagem vertical formato Stories (recomendado: 1080x1920px ou 720x1280px)"
            />

            <div>
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Descrição opcional do banner..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-slate-900">Link (opcional)</h3>
              <div>
                <Label htmlFor="link">URL do Link</Label>
                <Input
                  id="link"
                  name="link"
                  type="url"
                  placeholder="https://exemplo.com/curso"
                  className="mt-1"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Se preenchido, o banner será clicável
                </p>
              </div>

              <div>
                <Label htmlFor="linkText">Texto do Botão</Label>
                <Input
                  id="linkText"
                  name="linkText"
                  placeholder="Ex: Saiba Mais"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Ordem de Exibição</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue="0"
                  className="mt-1"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Banners são exibidos em ordem crescente
                </p>
              </div>

              <div className="flex items-end">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 w-full">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      defaultChecked
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Banner Ativo
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Criar Banner</Button>
              <Link href="/admin/subscriber-banners">
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
          <strong>Importante:</strong> Os banners aparecem apenas para usuários com assinatura ativa
          na seção &quot;Área do Assinante&quot; do dashboard.
        </CardContent>
      </Card>
    </div>
  )
}
