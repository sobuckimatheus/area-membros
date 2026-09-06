'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthShell, JardimLogo } from '@/components/jardim/auth-shell'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('Erro ao enviar email. Verifique o endereco e tente novamente.')
      setIsLoading(false)
      return
    }

    setSent(true)
    setIsLoading(false)
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-white/40 bg-[#faf6ef]/40 shadow-2xl backdrop-blur-md">
        <CardHeader className="space-y-2">
          <div className="flex justify-center"><JardimLogo className="h-12 w-12" /></div>
          <CardTitle className="text-center font-serif text-2xl font-bold text-[#2e3b28]">
            Recuperar senha
          </CardTitle>
          <CardDescription className="text-center text-[#7c7663]">
            Informe seu email para receber o link de recuperacao
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-green-700 font-medium">Email enviado!</p>
              <p className="text-[#7c7663] text-sm">
                Verifique sua caixa de entrada (e a pasta de spam) para o link de recuperacao de senha.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2e3b28]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-[#e5ddcd] bg-white text-[#2e3b28] placeholder:text-[#a8a291] focus:border-[#c6a04e]"
                />
              </div>

              {error && (
                <div className="bg-[#f7e6df] text-[#b5563f] border border-[#e0c3b8] rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2e3b28] hover:opacity-90 text-[#f4efe6] font-semibold"
              >
                {isLoading ? 'Enviando...' : 'Enviar link de recuperacao'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Link href="/auth/login" className="text-sm text-[#7c7663] hover:text-[#2e3b28]">
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    </AuthShell>
  )
}
