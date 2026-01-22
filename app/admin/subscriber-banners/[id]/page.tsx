import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Trash2 } from 'lucide-react'
import { CourseImageUpload } from '@/components/course-image-upload'

async function updateBanner(bannerId: string, formData: FormData) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const imageUrl = formData.get('thumbnailUrl') as string
  const description = formData.get('description') as string
  const link = formData.get('link') as string
  const linkText = formData.get('linkText') as string
  const order = formData.get('order') as string
  const isActive = formData.get('isActive') === 'on'

  if (!imageUrl) {
    throw new Error('Imagem do banner é obrigatória')
  }

  await prisma.subscriberBanner.update({
    where: {
      id: bannerId,
      tenantId: user.tenantId,
    },
    data: {
      title: title || null,
      imageUrl,
      description: description || null,
      link: link || null,
      linkText: linkText || null,
      order: order ? parseInt(order, 10) : 0,
      isActive,
    },
  })

  revalidatePath(`/admin/subscriber-banners/${bannerId}`)
  revalidatePath('/admin/subscriber-banners')
}

async function toggleBannerStatus(bannerId: string, currentStatus: boolean) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  await prisma.subscriberBanner.update({
    where: {
      id: bannerId,
      tenantId: user.tenantId,
    },
    data: {
      isActive: !currentStatus,
    },
  })

  revalidatePath(`/admin/subscriber-banners/${bannerId}`)
  revalidatePath('/admin/subscriber-banners')
}

async function deleteBanner(bannerId: string) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  await prisma.subscriberBanner.delete({
    where: {
      id: bannerId,
      tenantId: user.tenantId,
    },
  })

  revalidatePath('/admin/subscriber-banners')
  redirect('/admin/subscriber-banners')
}

export default async function EditSubscriberBannerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const banner = await prisma.subscriberBanner.findUnique({
    where: {
      id,
      tenantId: user.tenantId,
    },
  })

  if (!banner) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin/subscriber-banners"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Banners
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {banner.title || 'Editar Banner'}
            </h1>
            <p className="text-slate-600 mt-2">Edite as informações do banner</p>
          </div>
          <div className="flex gap-2">
            <form action={toggleBannerStatus.bind(null, id, banner.isActive)}>
              <Button
                type="submit"
                variant={banner.isActive ? 'outline' : 'default'}
              >
                {banner.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
            </form>
            <form action={deleteBanner.bind(null, id)}>
              <Button type="submit" variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Status do Banner */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">Status do Banner</h3>
              <p className="text-sm text-slate-600">
                {banner.isActive
                  ? 'Este banner está visível para os assinantes'
                  : 'Este banner está desativado e não é visível'}
              </p>
            </div>
            <span
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                banner.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {banner.isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Edição */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateBanner.bind(null, id)} className="space-y-6">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                defaultValue={banner.title || ''}
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
              currentImageUrl={banner.imageUrl}
            />

            <div>
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={banner.description || ''}
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
                  defaultValue={banner.link || ''}
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
                  defaultValue={banner.linkText || ''}
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
                  defaultValue={banner.order}
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
                      defaultChecked={banner.isActive}
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
              <Button type="submit">Salvar Alterações</Button>
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
