'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🔐</div>
          <CardTitle className="text-2xl text-white">Criar sua Senha</CardTitle>
          <CardDescription className="text-zinc-400">
            Defina uma senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && !isReady ? (
            <div className="text-center py-6">
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-zinc-400 text-sm">
                Entre em contato para receber um novo link de acesso.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-zinc-300">
                  Nova Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-zinc-300">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 mt-2"
              >
                {isLoading ? 'Salvando...' : 'Criar Senha e Acessar'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
