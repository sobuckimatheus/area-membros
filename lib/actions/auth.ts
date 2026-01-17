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

  console.log('Tentando fazer login com email:', data.email)

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Erro ao fazer login no Supabase:', error)
    throw new Error(error.message)
  }

  // Buscar o usuário no Prisma para verificar o role
  if (!authData.user) {
    throw new Error('Erro ao obter dados do usuário')
  }

  console.log('Login no Supabase bem-sucedido, buscando usuário no banco:', authData.user.id)

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUid: authData.user.id },
  })

  if (!dbUser) {
    console.error('Usuário autenticado no Supabase mas não encontrado no banco de dados:', authData.user.id)
    throw new Error('Erro de sincronização de conta. Entre em contato com o suporte.')
  }

  console.log('Usuário encontrado no banco:', dbUser.email, 'Role:', dbUser.role)

  revalidatePath('/', 'layout')

  // Retornar o destino do redirect baseado no role do usuário
  if (dbUser.role === 'ADMIN') {
    console.log('Login bem-sucedido - Admin')
    return { success: true, redirectTo: '/admin/dashboard' }
  } else {
    console.log('Login bem-sucedido - Student')
    return { success: true, redirectTo: '/dashboard' }
  }
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
        const newUser = await prisma.user.create({
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

        // Matricular automaticamente em todos os cursos gratuitos
        const freeCourses = await prisma.course.findMany({
          where: {
            tenantId: tenant.id,
            status: 'PUBLISHED',
            isFree: true,
          },
        })

        if (freeCourses.length > 0) {
          const enrollments = freeCourses.map(course => ({
            userId: newUser.id,
            courseId: course.id,
            tenantId: tenant.id,
            status: 'ACTIVE' as const,
          }))

          await prisma.enrollment.createMany({
            data: enrollments,
            skipDuplicates: true,
          })
        }
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
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Erro ao obter usuário do Supabase:', error)
      return null
    }

    if (!user) {
      return null
    }

    // Buscar dados completos do usuário no Prisma
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUid: user.id },
      include: {
        tenant: true,
      },
    })

    if (!dbUser) {
      console.error('Usuário existe no Supabase mas não no banco de dados:', user.id)
      return null
    }

    return dbUser
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    return null
  }
}
