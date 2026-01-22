import { getCurrentUser } from '@/lib/actions/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function SubscriberBannersPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    return <div>Acesso negado</div>
  }

  const banners = await prisma.subscriberBanner.findMany({
    where: {
      tenantId: user.tenantId,
    },
    orderBy: {
      order: 'asc',
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Banners da Área do Assinante</h1>
          <p className="text-slate-600 mt-2">
            Gerencie os banners promocionais que aparecem na área exclusiva para assinantes
          </p>
        </div>
        <Link href="/admin/subscriber-banners/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Banner
          </Button>
        </Link>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum banner cadastrado</CardTitle>
            <CardDescription>
              Comece criando seu primeiro banner promocional para a área de assinantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/subscriber-banners/new">
              <Button>Criar primeiro banner</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              {banner.imageUrl && (
                <div className="aspect-video bg-slate-100">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {banner.title || 'Sem título'}
                    </CardTitle>
                    {banner.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {banner.description}
                      </CardDescription>
                    )}
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                      banner.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {banner.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                  <span>Ordem: {banner.order}</span>
                  {banner.link && <span className="text-blue-600">Com link</span>}
                </div>
                <Link href={`/admin/subscriber-banners/${banner.id}`}>
                  <Button variant="outline" className="w-full">
                    Editar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
