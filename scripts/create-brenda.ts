const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')

const email = 'brenda.barcelos01@gmail.com'
const userName = 'Brenda'
const tempPassword = 'Acesso@2025'
const tenantId = 'cmjp57hhf0000v62p524yzlzl'
const freeCourseId = 'cmjy59gxc0005u9q5r5pwsmhd'
const oracaoCourseId = 'cmjp8sghy0003fyzxml4bxbzb'

const prisma = new PrismaClient()

async function main() {
  // Verifica se usuário já existe
  const existingUser = await prisma.user.findFirst({
    where: { email }
  })

  if (existingUser) {
    console.log('Usuario ja existe no banco de dados')
    console.log('ID:', existingUser.id)
    console.log('Email:', existingUser.email)
    console.log('Supabase UID:', existingUser.supabaseUid)

    // Verifica matriculas
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: existingUser.id },
      include: { course: true }
    })

    console.log('\nMatriculas existentes:')
    enrollments.forEach((e: any) => {
      console.log(`- ${e.course.title} (${e.status})`)
    })

    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Criando usuario no Supabase Auth...')
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: userName },
  })

  if (authError) {
    console.log('Erro Supabase:', authError.message)
    return
  }

  console.log('Usuario criado no Supabase Auth:', authData.user.id)

  console.log('Criando usuario no banco de dados...')
  const user = await prisma.user.create({
    data: {
      tenantId,
      email,
      name: userName,
      supabaseUid: authData.user.id,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })

  console.log('Usuario criado no banco:', user.id)

  console.log('Criando matriculas...')
  await prisma.enrollment.createMany({
    data: [
      {
        tenantId,
        userId: user.id,
        courseId: freeCourseId,
        status: 'ACTIVE',
        progress: 0,
        enrolledAt: new Date(),
        source: 'manual',
      },
      {
        tenantId,
        userId: user.id,
        courseId: oracaoCourseId,
        status: 'ACTIVE',
        progress: 0,
        enrolledAt: new Date(),
        source: 'manual',
      }
    ]
  })

  console.log('\n✓ Usuario criado com sucesso!')
  console.log('Email:', email)
  console.log('Senha:', tempPassword)
  console.log('Cursos liberados: Aulas Gratuitas, Oracao Profetica')
}

main().catch(console.error).finally(() => prisma.$disconnect())
