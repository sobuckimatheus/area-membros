'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthShell, JardimLogo } from '@/components/jardim/auth-shell'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // O Supabase envia o token como hash fragment na URL
    // Ex: #access_token=...&type=recovery
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      setIsReady(true)
    } else {
      setError('Link inválido ou expirado. Solicite um novo link de acesso.')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError('Erro ao criar senha. Tente novamente ou solicite um novo link.')
        setIsLoading(false)
        return
      }

      // Redirecionar para o dashboard
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-white/40 bg-[#faf6ef]/40 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mb-1 flex justify-center"><JardimLogo className="h-12 w-12" /></div>
          <CardTitle className="font-serif text-2xl text-[#2e3b28]">Criar sua Senha</CardTitle>
          <CardDescription className="text-[#7c7663]">
            Defina uma senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && !isReady ? (
            <div className="text-center py-6">
              <p className="text-[#b5563f] mb-4">{error}</p>
              <p className="text-[#7c7663] text-sm">
                Entre em contato para receber um novo link de acesso.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-[#2e3b28]">
                  Nova Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="mt-1 border-[#e5ddcd] bg-white text-[#2e3b28] placeholder:text-[#a8a291] focus:border-[#c6a04e]"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-[#2e3b28]">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="mt-1 border-[#e5ddcd] bg-white text-[#2e3b28] placeholder:text-[#a8a291] focus:border-[#c6a04e]"
                />
              </div>

              {error && (
                <p className="text-[#b5563f] text-sm">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2e3b28] hover:opacity-90 text-[#f4efe6] font-semibold py-3 mt-2"
              >
                {isLoading ? 'Salvando...' : 'Criar Senha e Acessar'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
