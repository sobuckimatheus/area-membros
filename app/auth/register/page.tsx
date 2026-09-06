'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signup } from '@/lib/actions/auth'
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

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams?.get('error') || null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      await signup(formData)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-[#e5ddcd] bg-[#faf6ef] shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="flex justify-center"><JardimLogo className="h-12 w-12" /></div>
          <CardTitle className="text-center font-serif text-3xl font-bold text-[#2e3b28]">
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-center text-[#7c7663]">
            Cadastro 100% gratuito. Tenha acesso aos cursos que voce adquirir.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-[#f7e6df] text-[#b5563f] border border-[#e0c3b8] rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#2e3b28]">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Joao Silva"
                required
                disabled={isLoading}
                className="border-[#e5ddcd] bg-white text-[#2e3b28] placeholder:text-[#a8a291] focus:border-[#c6a04e] focus:ring-[#c6a04e]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2e3b28]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                className="border-[#e5ddcd] bg-white text-[#2e3b28] placeholder:text-[#a8a291] focus:border-[#c6a04e] focus:ring-[#c6a04e]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-[#2e3b28]">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="(00) 00000-0000"
                disabled={isLoading}
                className="border-[#e5ddcd] bg-white text-[#2e3b28] placeholder:text-[#a8a291] focus:border-[#c6a04e] focus:ring-[#c6a04e]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2e3b28]">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
                disabled={isLoading}
                className="border-[#e5ddcd] bg-white text-[#2e3b28] placeholder:text-[#a8a291] focus:border-[#c6a04e] focus:ring-[#c6a04e]"
              />
              <p className="text-xs text-[#a8a291]">Minimo 6 caracteres</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2e3b28] hover:opacity-90 text-[#f4efe6] font-semibold"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta gratuitamente'}
            </Button>
            <p className="text-sm text-center text-[#7c7663]">
              Ja tem uma conta?{' '}
              <Link href="/auth/login" className="text-[#b58a3c] hover:underline font-medium">
                Fazer login
              </Link>
            </p>
            <p className="text-xs text-center text-[#a8a291]">
              Ao criar uma conta, voce concorda com nossos{' '}
              <Link href="/terms" className="text-[#b58a3c] hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="text-[#b58a3c] hover:underline">
                Politica de Privacidade
              </Link>
              .
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
