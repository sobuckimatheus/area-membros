import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CustomizationForm } from '@/components/customization-form'

async function updateCustomization(formData: FormData) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const primaryColor = formData.get('primaryColor') as string
  const secondaryColor = formData.get('secondaryColor') as string
  const accentColor = formData.get('accentColor') as string
  const backgroundColor = formData.get('backgroundColor') as string
  const textColor = formData.get('textColor') as string
  const sidebarColor = formData.get('sidebarColor') as string
  const heroImageUrl = formData.get('heroImageUrl') as string
  const heroImageUrlMobile = formData.get('heroImageUrlMobile') as string
  const darkMode = formData.get('darkMode') === 'on'

  await prisma.tenantCustomization.upsert({
    where: { tenantId: user.tenantId },
    create: {
      tenantId: user.tenantId,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      sidebarColor,
      heroImageUrl: heroImageUrl || null,
      heroImageUrlMobile: heroImageUrlMobile || null,
      darkMode,
    },
    update: {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      sidebarColor,
      heroImageUrl: heroImageUrl || null,
      heroImageUrlMobile: heroImageUrlMobile || null,
      darkMode,
    },
  })

  revalidatePath('/admin/customization')
  revalidatePath('/dashboard')
}

export default async function CustomizationPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const customization = await prisma.tenantCustomization.findUnique({
    where: { tenantId: user.tenantId },
  })

  // Temas pré-definidos
  const themes = [
    {
      name: 'Terapia & Cura',
      primaryColor: '#A78BFA',     // Roxo suave
      secondaryColor: '#FBBF24',   // Amarelo dourado
      accentColor: '#34D399',      // Verde menta
      backgroundColor: '#FEF3C7',  // Bege claro
      textColor: '#1F2937',
    },
    {
      name: 'Serenidade',
      primaryColor: '#60A5FA',     // Azul céu
      secondaryColor: '#93C5FD',   // Azul claro
      accentColor: '#A78BFA',      // Roxo claro
      backgroundColor: '#EFF6FF',  // Azul muito claro
      textColor: '#1E3A8A',
    },
    {
      name: 'Natureza',
      primaryColor: '#34D399',     // Verde
      secondaryColor: '#6EE7B7',   // Verde claro
      accentColor: '#FCD34D',      // Amarelo
      backgroundColor: '#ECFDF5',  // Verde muito claro
      textColor: '#065F46',
    },
    {
      name: 'Rosa Suave',
      primaryColor: '#F472B6',     // Rosa
      secondaryColor: '#FBCFE8',   // Rosa claro
      accentColor: '#A78BFA',      // Roxo
      backgroundColor: '#FDF2F8',  // Rosa muito claro
      textColor: '#831843',
    },
    {
      name: 'Netflix (Escuro)',
      primaryColor: '#E50914',     // Vermelho Netflix
      secondaryColor: '#B20710',   // Vermelho escuro
      accentColor: '#F40612',      // Vermelho claro
      backgroundColor: '#141414',  // Preto
      textColor: '#FFFFFF',
    },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Personalização</h1>
        <p className="text-slate-600 mt-2">
          Configure as cores e aparência da sua plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cores e Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomizationForm
            currentCustomization={customization ?? undefined}
            themes={themes}
            updateAction={updateCustomization}
          />
        </CardContent>
      </Card>
    </div>
  )
}
