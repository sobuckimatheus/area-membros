import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const email = 'may.ss23590@gmail.com'

  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          course: {
            select: { title: true }
          }
        }
      }
    }
  })

  if (!user) {
    console.log('❌ Usuário não encontrado')
  } else {
    console.log('✅ Usuário encontrado')
    console.log('Nome:', user.name)
    console.log('Email:', user.email)
    console.log('Status:', user.status)
    console.log('Supabase UID:', user.supabaseUid || 'AUSENTE')
    console.log('\nCursos ativos:')
    if (user.enrollments.length === 0) {
      console.log('  Nenhum curso')
    } else {
      user.enrollments.forEach(e => {
        console.log('  -', e.course.title)
      })
    }
  }

  await prisma.$disconnect()
}

check()
