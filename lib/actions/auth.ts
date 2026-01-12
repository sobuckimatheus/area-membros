'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  // Buscar o usuário no Prisma para verificar o role
  if (authData.user) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUid: authData.user.id },
    })

    revalidatePath('/', 'layout')

    // Redirecionar baseado no role do usuário
    if (dbUser?.role === 'ADMIN') {
      redirect('/admin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: undefined,
    },
  })

  if (error) {
    redirect(`/auth/register?error=${encodeURIComponent(error.message)}`)
  }

  // Criar usuário no Prisma
  if (authData.user) {
    try {
      // Buscar o tenant demo (ou criar lógica para multi-tenant)
      const tenant = await prisma.tenant.findFirst({
        where: { slug: 'demo' },
      })

      if (!tenant) {
        redirect('/auth/register?error=Tenant+não+encontrado')
      }

      // Verificar se usuário já existe no Prisma (pode ter sido criado em tentativa anterior)
      const existingUser = await prisma.user.findUnique({
        where: { supabaseUid: authData.user.id },
      })

      if (!existingUser) {
        // Criar usuário no Prisma
        await prisma.user.create({
          data: {
            tenantId: tenant.id,
            email,
            name: name || email.split('@')[0],
            supabaseUid: authData.user.id,
            role: 'STUDENT',
            status: 'ACTIVE',
            emailVerified: authData.user.confirmed_at ? new Date(authData.user.confirmed_at) : null,
          },
        })
      }
    } catch (err) {
      console.error('Erro ao criar usuário no Prisma:', err)
      // Não retornamos erro aqui pois o usuário foi criado no Supabase
    }
  }

  // Fazer login explícito após signup para garantir que a sessão seja criada
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error('Erro ao fazer login após signup:', signInError)
    redirect(`/auth/login?message=${encodeURIComponent('Conta criada com sucesso! Por favor, faça login.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Buscar dados completos do usuário no Prisma
  const dbUser = await prisma.user.findUnique({
    where: { supabaseUid: user.id },
    include: {
      tenant: true,
    },
  })

  return dbUser
}
