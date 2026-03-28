import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixEnrollment() {
  try {
    const email = 'glauciacarbonari@gmail.com'

    console.log('🔍 Buscando usuário...')
    const user = await prisma.user.findFirst({
      where: { email }
    })

    if (!user) {
      console.error('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:', user.name)

    console.log('\n🔍 Buscando curso correto...')
    const correctCourse = await prisma.course.findFirst({
      where: {
        slug: 'oracao-profetica-do-futuro-marido'
      }
    })

    if (!correctCourse) {
      console.error('❌ Curso não encontrado')
      return
    }

    console.log('✅ Curso encontrado:', correctCourse.title)

    console.log('\n🗑️  Removendo matrícula incorreta...')
    await prisma.enrollment.deleteMany({
      where: {
        userId: user.id,
        courseId: { not: correctCourse.id }
      }
    })
    console.log('✅ Matrícula incorreta removida')

    console.log('\n📚 Verificando se já está matriculado no curso correto...')
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: correctCourse.id
      }
    })

    if (existingEnrollment) {
      console.log('✅ Já está matriculado no curso correto!')
    } else {
      console.log('📚 Criando matrícula no curso correto...')
      await prisma.enrollment.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          courseId: correctCourse.id,
          status: 'ACTIVE',
          source: 'manual',
        }
      })
      console.log('✅ Matrícula criada!')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ MATRÍCULA CORRIGIDA COM SUCESSO!')
    console.log('='.repeat(60))
    console.log('\n📚 Curso:', correctCourse.title)
    console.log('Status: ATIVA')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixEnrollment()
