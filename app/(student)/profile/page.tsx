import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="text-slate-600 mt-1">Gerencie suas informações pessoais</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nome</label>
                <p className="mt-1 text-slate-900">{user.name || 'Não informado'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="mt-1 text-slate-900">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Telefone</label>
                <p className="mt-1 text-slate-900">{user.phone || 'Não informado'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Membro desde</label>
                <p className="mt-1 text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {user.lastLoginAt && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Último acesso</label>
                  <p className="mt-1 text-slate-900">
                    {new Date(user.lastLoginAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Idioma</label>
                <p className="mt-1 text-slate-900">{user.language === 'pt-BR' ? 'Português (Brasil)' : user.language}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Fuso horário</label>
                <p className="mt-1 text-slate-900">{user.timezone}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
