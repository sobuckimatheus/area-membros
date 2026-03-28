import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const email = 'ellayne.oliver@icloud.com'
  const password = 'Acesso@2025'

  // Buscar usuário
  const user = await prisma.user.findFirst({
    where: { email },
  })

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  console.log('✅ Usuário encontrado:', user.name)

  // Resetar senha no Supabase Auth
  if (user.supabaseUid) {
    const { error } = await supabase.auth.admin.updateUserById(user.supabaseUid, {
      password,
    })

    if (error) {
      console.error('❌ Erro ao resetar senha:', error.message)
    } else {
      console.log('✅ Senha resetada para: Acesso@2025')
    }
  }

  // Buscar curso Oração Profética
  const curso = await prisma.course.findUnique({
    where: { id: 'cmjp8sghy0003fyzxml4bxbzb' },
  })

  if (!curso) {
    throw new Error('Curso Oração Profética não encontrado')
  }

  console.log('✅ Curso encontrado:', curso.title)

  // Verificar se já está matriculada
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: curso.id,
      status: 'ACTIVE',
    },
  })

  if (existingEnrollment) {
    console.log('⚠️  Usuária já está matriculada em:', curso.title)
  } else {
    await prisma.enrollment.create({
      data: {
        tenantId: user.tenantId,
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

  console.log('\n📧 Credenciais atualizadas:')
  console.log('Email:', email)
  console.log('Senha:', password)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
