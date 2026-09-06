'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { JardimLogo } from "@/components/jardim/logo"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await login(formData)

      if (result?.success && result?.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      } else if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        setError('Erro ao fazer login. Tente novamente.')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('Erro no login:', err)
      setError('Erro ao fazer login. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#2e3b28] p-4">
      {/* Imagem de fundo do Jardim */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/jardim-login.jpg')" }}
      />
      {/* Leve overlay para legibilidade */}
      <div className="absolute inset-0 bg-black/25" />

      <Card className="relative w-full max-w-md border-white/40 bg-[#faf6ef]/8 shadow-2xl backdrop-blur-md">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <JardimLogo className="h-14 w-14" />
          </div>
          <CardTitle className="text-center font-serif text-3xl text-[#2e3b28]">
            Bem-vinda ao Jardim
          </CardTitle>
          <CardDescription className="text-center text-[#7c7663]">
            Entre para continuar a sua jornada
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[#e0c3b8] bg-[#f7e6df] p-3 text-sm text-[#b5563f]">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2e3b28]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                className="border-[#e5ddcd] bg-white text-[#2d2d2d] placeholder:text-[#a8a291] focus:border-[#c6a04e] focus:ring-[#c6a04e]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#2e3b28]">Senha</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#b58a3c] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="border-[#e5ddcd] bg-white text-[#2d2d2d] placeholder:text-[#a8a291] focus:border-[#c6a04e] focus:ring-[#c6a04e]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#2e3b28] font-semibold text-[#f4efe6] hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-center text-sm text-[#7c7663]">
              Não tem uma conta?{" "}
              <Link href="/auth/register" className="font-medium text-[#b58a3c] hover:underline">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
