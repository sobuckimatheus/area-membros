import { getCurrentUser } from '@/lib/actions/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default async function IntegrationsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const kirvanoIntegration = await prisma.integration.findFirst({
    where: {
      tenantId: user.tenantId,
      platform: 'KIRVANO',
    },
  })

  // Buscar estatísticas de compras
  const totalPurchases = await prisma.purchase.count({
    where: { tenantId: user.tenantId },
  })

  const approvedPurchases = await prisma.purchase.count({
    where: {
      tenantId: user.tenantId,
      status: 'APPROVED',
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Integrações</h1>
        <p className="text-slate-600 mt-2">
          Gerencie as integrações com plataformas externas
        </p>
      </div>

      {/* Kirvano Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kirvano</CardTitle>
              <CardDescription>
                Integração via Webhook com a plataforma de pagamentos Kirvano
              </CardDescription>
            </div>
            <span className="px-3 py-1 text-sm font-medium rounded bg-green-100 text-green-700">
              Ativa
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook URL */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              URL do Webhook
            </h4>
            <code className="text-sm bg-white px-3 py-2 rounded border border-slate-300 block overflow-x-auto">
              https://areamembros.dianamascarello.com.br/api/webhooks/kirvano
            </code>
            <p className="text-xs text-slate-600 mt-2">
              Configure esta URL na Kirvano em: Integrações → Webhook
            </p>
          </div>

          {/* Estatísticas */}
          {kirvanoIntegration && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Webhooks Recebidos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {kirvanoIntegration.webhookCount}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Compras Processadas</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalPurchases}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Compras Aprovadas</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {approvedPurchases}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">Erros</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {kirvanoIntegration.errorCount}
                </p>
              </div>
            </div>
          )}

          {kirvanoIntegration?.lastWebhookAt && (
            <p className="text-sm text-slate-600">
              Último webhook recebido:{' '}
              <span className="font-medium text-slate-900">
                {new Date(kirvanoIntegration.lastWebhookAt).toLocaleString('pt-BR')}
              </span>
            </p>
          )}

          {/* Link para logs */}
          <Link
            href="/admin/webhooks"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Ver logs de webhooks
            <ExternalLink className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      {/* Como funciona */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">
            Como funciona a sincronização automática?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-3">
          <div>
            <p className="font-semibold mb-2">🔄 Sincronização via Webhook:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Quando uma compra é aprovada na Kirvano, o webhook é enviado automaticamente</li>
              <li>O sistema registra a compra e libera o acesso ao curso imediatamente</li>
              <li>Não é necessário nenhuma configuração adicional</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2">🔐 Sincronização no Login:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Toda vez que um aluno faz login, o sistema verifica compras pendentes</li>
              <li>Se houver compras aprovadas sem acesso liberado, o sistema libera automaticamente</li>
              <li>Funciona como backup caso o webhook falhe</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2">⚙️ Configuração Necessária:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Vincular produtos da Kirvano aos cursos na página de Produtos</li>
              <li>Configurar a URL do webhook na Kirvano (mostrada acima)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
