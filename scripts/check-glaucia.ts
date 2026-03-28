import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: 'glauciacarbonari@gmail.com'
      },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                title: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado no banco de dados')
      return
    }

    console.log('✅ Usuário encontrado!')
    console.log('\n📋 Dados do usuário:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Nome:', user.name)
    console.log('Supabase UID:', user.supabaseUid || '❌ NÃO TEM')
    console.log('Role:', user.role)
    console.log('Status:', user.status)
    console.log('Tenant ID:', user.tenantId)
    console.log('\n📚 Matrículas:', user.enrollments.length)
    user.enrollments.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.course.title} (${e.status})`)
    })

  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
