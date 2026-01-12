import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Webhook, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export default async function AdminWebhooksPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const webhooks = await prisma.webhookLog.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const stats = {
    total: webhooks.length,
    success: webhooks.filter((w) => w.status === 'SUCCESS').length,
    failed: webhooks.filter((w) => w.status === 'FAILED').length,
    pending: webhooks.filter((w) => w.status === 'PENDING').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-700'
      case 'FAILED':
        return 'bg-red-100 text-red-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Logs de Webhooks</h1>
        <p className="text-slate-600 mt-2">
          Histórico de todos os webhooks recebidos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Webhook, color: 'slate' },
          {
            label: 'Sucesso',
            value: stats.success,
            icon: CheckCircle,
            color: 'green',
          },
          { label: 'Falhas', value: stats.failed, icon: XCircle, color: 'red' },
          {
            label: 'Pendente',
            value: stats.pending,
            icon: Clock,
            color: 'yellow',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <stat.icon
                  className={`h-8 w-8 text-${stat.color}-600`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Webhooks */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Webhook className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum webhook recebido
            </h3>
            <p className="text-slate-600">
              Os webhooks da Kirvano aparecerão aqui quando forem recebidos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(webhook.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {webhook.platform}
                          </h3>
                          <span className="text-sm text-slate-600">
                            {webhook.event}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(webhook.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(
                        webhook.status
                      )}`}
                    >
                      {webhook.status}
                    </span>
                  </div>

                  {/* Error Message */}
                  {webhook.errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-1">
                        Erro:
                      </p>
                      <p className="text-sm text-red-700">{webhook.errorMessage}</p>
                    </div>
                  )}

                  {/* Payload */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
                      Ver payload completo
                    </summary>
                    <div className="mt-3 p-4 bg-slate-50 rounded-lg overflow-x-auto">
                      <pre className="text-xs text-slate-700">
                        {JSON.stringify(webhook.payload, null, 2)}
                      </pre>
                    </div>
                  </details>

                  {/* Request Payload */}
                  {webhook.requestPayload && (
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
                        Ver request payload
                      </summary>
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg overflow-x-auto">
                        <pre className="text-xs text-slate-700">
                          {JSON.stringify(webhook.requestPayload, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-6 text-xs text-slate-500 pt-3 border-t border-slate-200">
                    <span>ID: {webhook.id}</span>
                    {webhook.processedAt && (
                      <span>
                        Processado em:{' '}
                        {new Date(webhook.processedAt).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {webhooks.length === 100 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center text-sm text-blue-800">
            Mostrando apenas os 100 webhooks mais recentes.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
