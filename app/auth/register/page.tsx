import Link from "next/link"
import { signup } from "@/lib/actions/auth"
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

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-white">
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Cadastro 100% gratuito. Tenha acesso aos cursos que você adquirir.
          </CardDescription>
        </CardHeader>
        <form action={signup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="João Silva"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600 focus:ring-red-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600 focus:ring-red-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-white">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="(00) 00000-0000"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600 focus:ring-red-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600 focus:ring-red-600"
              />
              <p className="text-xs text-zinc-500">
                Mínimo 6 caracteres
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
              Criar conta gratuitamente
            </Button>
            <p className="text-sm text-center text-zinc-400">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="text-red-500 hover:text-red-400 hover:underline font-medium">
                Fazer login
              </Link>
            </p>
            <p className="text-xs text-center text-zinc-500">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="/terms" className="text-red-500 hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="/privacy" className="text-red-500 hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
