import { getCurrentUser } from '@/lib/actions/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function updateKirvanoApiKey(formData: FormData) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const apiKey = formData.get('apiKey') as string

  if (!apiKey) {
    throw new Error('API Key é obrigatória')
  }

  // Buscar ou criar integração Kirvano
  const integration = await prisma.integration.findFirst({
    where: {
      tenantId: user.tenantId,
      platform: 'KIRVANO',
    },
  })

  if (integration) {
    // Atualizar integração existente
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        config: { apiKey },
        isActive: true,
      },
    })
  } else {
    // Criar nova integração
    await prisma.integration.create({
      data: {
        tenantId: user.tenantId,
        platform: 'KIRVANO',
        config: { apiKey },
        isActive: true,
      },
    })
  }

  revalidatePath('/admin/integrations')
  redirect('/admin/integrations?success=true')
}

export default async function IntegrationsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const kirvanoIntegration = await prisma.integration.findFirst({
    where: {
      tenantId: user.tenantId,
      platform: 'KIRVANO',
    },
  })

  const config = kirvanoIntegration?.config as any

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Integrações</h1>
        <p className="text-slate-600 mt-2">
          Configure as integrações com plataformas externas
        </p>
      </div>

      {/* Kirvano Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kirvano</CardTitle>
              <CardDescription>
                Integração com a plataforma de pagamentos Kirvano
              </CardDescription>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded ${
              kirvanoIntegration?.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {kirvanoIntegration?.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form action={updateKirvanoApiKey} className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key da Kirvano</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder="Digite sua API Key da Kirvano"
                defaultValue={config?.apiKey || ''}
                className="mt-1"
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                Você pode encontrar sua API Key no painel da Kirvano em Configurações {'>'} API
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit">
                {kirvanoIntegration ? 'Atualizar API Key' : 'Salvar API Key'}
              </Button>
              {config?.apiKey && (
                <p className="text-sm text-green-600">
                  ✓ API Key configurada
                </p>
              )}
            </div>
          </form>

          {kirvanoIntegration && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Informações da Integração
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Status:</dt>
                  <dd className="font-medium text-slate-900">
                    {kirvanoIntegration.isActive ? 'Ativa' : 'Inativa'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Webhooks recebidos:</dt>
                  <dd className="font-medium text-slate-900">
                    {kirvanoIntegration.webhookCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Erros:</dt>
                  <dd className="font-medium text-slate-900">
                    {kirvanoIntegration.errorCount}
                  </dd>
                </div>
                {kirvanoIntegration.lastWebhookAt && (
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Último webhook:</dt>
                    <dd className="font-medium text-slate-900">
                      {new Date(kirvanoIntegration.lastWebhookAt).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre sincronização */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">
            Como funciona a sincronização?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Após configurar a API Key:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Os alunos terão suas compras sincronizadas automaticamente ao fazer login
            </li>
            <li>
              O sistema verifica transações aprovadas na Kirvano e libera os cursos correspondentes
            </li>
            <li>
              É necessário vincular os produtos da Kirvano aos cursos na página de Produtos
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
