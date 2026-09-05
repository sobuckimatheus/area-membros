export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/actions/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function updateLiveClass(formData: FormData) {
  'use server'
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized')

  const data = {
    liveClassSchedule: (formData.get('liveClassSchedule') as string) || null,
    liveClassUrl: (formData.get('liveClassUrl') as string) || null,
    nextClassTitle: (formData.get('nextClassTitle') as string) || null,
    nextClassUrl: (formData.get('nextClassUrl') as string) || null,
  }

  await prisma.tenantCustomization.upsert({
    where: { tenantId: user.tenantId },
    create: { tenantId: user.tenantId, ...data },
    update: data,
  })

  revalidatePath('/admin/live-class')
  revalidatePath('/dashboard')
}

export default async function LiveClassPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const c = await prisma.tenantCustomization.findUnique({ where: { tenantId: user.tenantId } })

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Aula ao Vivo</h1>
        <p className="mt-2 text-slate-600">
          Configure o card “Ao vivo” que aparece na home da área de membros.
        </p>
      </div>

      <form action={updateLiveClass}>
        <Card className="mb-6">
          <CardHeader><CardTitle>Ao vivo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="liveClassSchedule">Horário / recorrência</Label>
              <Input id="liveClassSchedule" name="liveClassSchedule" defaultValue={c?.liveClassSchedule || ''} placeholder="Ex: Toda terça às 14:40" className="mt-1" />
            </div>
            <p className="text-xs text-slate-500">
              O botão “Entrar na sala” leva ao curso <strong>O Jardim de Rute</strong>. Quem tem
              acesso ativo a esse curso assiste às aulas ao vivo; quem não tem vê o convite de compra.
            </p>
          </CardContent>
        </Card>

        <p className="mb-6 text-sm text-slate-500">
          A seção “Continue de onde parou” na home é preenchida automaticamente com a última aula
          que cada aluna assistiu — não precisa configurar.
        </p>

        <Button type="submit">Salvar</Button>
      </form>
    </div>
  )
}
