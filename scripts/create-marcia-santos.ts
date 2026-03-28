import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const email = 'Pra.marciasantos@gmail.com'
  const name = 'Márcia Santos'
  const password = 'Acesso@2025'

  // Buscar tenant
  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'demo' },
  })

  if (!tenant) {
    throw new Error('Tenant não encontrado')
  }

  console.log('✅ Tenant encontrado:', tenant.slug)

  // Verificar se usuário já existe
  let user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email } },
  })

  if (user) {
    console.log('⚠️  Usuário já existe:', user.email)
  } else {
    // Criar no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      if (authError.message?.includes('already registered')) {
        console.log('Usuário já existe no Supabase Auth, buscando...')
        const { data: listData } = await supabase.auth.admin.listUsers()
        const existingUser = listData?.users?.find(u => u.email === email)

        if (existingUser) {
          await supabase.auth.admin.updateUserById(existingUser.id, { password })

          user = await prisma.user.create({
            data: {
              tenantId: tenant.id,
              email,
              name,
              supabaseUid: existingUser.id,
              role: 'STUDENT',
              status: 'ACTIVE',
              emailVerified: new Date(),
            },
          })
          console.log('✅ Usuário criado no Prisma:', user.email)
        }
      } else {
        throw authError
      }
    } else {
      user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name,
          supabaseUid: authData.user.id,
          role: 'STUDENT',
          status: 'ACTIVE',
          emailVerified: new Date(),
        },
      })
      console.log('✅ Usuário criado:', user.email)
    }
  }

  if (!user) {
    throw new Error('Não foi possível criar o usuário')
  }

  // Buscar curso Oração Profética
  const curso = await prisma.course.findUnique({
    where: { id: 'cmjp8sghy0003fyzxml4bxbzb' },
  })

  if (!curso) {
    throw new Error('Curso Oração Profética não encontrado')
  }

  console.log('✅ Curso encontrado:', curso.title)

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: curso.id,
      status: 'ACTIVE',
    },
  })

  if (existingEnrollment) {
    console.log('⚠️  Usuário já está matriculado em:', curso.title)
  } else {
    await prisma.enrollment.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        courseId: curso.id,
        status: 'ACTIVE',
        progress: 0,
        enrolledAt: new Date(),
        source: 'manual',
      },
    })
    console.log('✅ Matrícula criada:', curso.title)
  }

  // Curso gratuito
  const cursoGratuito = await prisma.course.findFirst({
    where: {
      tenantId: tenant.id,
      status: 'PUBLISHED',
      isFree: true,
    },
  })

  if (cursoGratuito) {
    const existingFree = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: cursoGratuito.id,
        status: 'ACTIVE',
      },
    })

    if (!existingFree) {
      await prisma.enrollment.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          courseId: cursoGratuito.id,
          status: 'ACTIVE',
          progress: 0,
          enrolledAt: new Date(),
          source: 'auto_free',
        },
      })
      console.log('✅ Curso gratuito adicionado:', cursoGratuito.title)
    }
  }

  console.log('\n📧 Credenciais:')
  console.log('Email:', email)
  console.log('Senha:', password)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
