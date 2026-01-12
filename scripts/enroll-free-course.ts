import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function enrollAllUsersInFreeCourse() {
  try {
    console.log('🚀 Iniciando matrícula automática no curso gratuito...')

    // Buscar todos os tenants
    const tenants = await prisma.tenant.findMany()

    for (const tenant of tenants) {
      console.log(`\n📋 Processando tenant: ${tenant.name}`)

      // Buscar o curso gratuito do tenant
      const freeCourse = await prisma.course.findFirst({
        where: {
          tenantId: tenant.id,
          slug: 'aulas-gratuitas',
          status: 'PUBLISHED',
        },
      })

      if (!freeCourse) {
        console.log(`⚠️  Curso "Aulas Gratuitas" não encontrado para ${tenant.name}`)
        console.log(`💡 Crie um curso com slug "aulas-gratuitas" no admin`)
        continue
      }

      console.log(`✅ Curso encontrado: ${freeCourse.title}`)

      // Buscar todos os usuários STUDENT do tenant
      const students = await prisma.user.findMany({
        where: {
          tenantId: tenant.id,
          role: 'STUDENT',
        },
      })

      console.log(`👥 Total de alunos: ${students.length}`)

      let enrolled = 0
      let alreadyEnrolled = 0

      for (const student of students) {
        // Verificar se já está matriculado
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            userId: student.id,
            courseId: freeCourse.id,
          },
        })

        if (existingEnrollment) {
          alreadyEnrolled++
          continue
        }

        // Criar matrícula
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: freeCourse.id,
            tenantId: tenant.id,
            status: 'ACTIVE',
          },
        })

        enrolled++
        console.log(`  ✓ ${student.name || student.email} matriculado`)
      }

      console.log(`\n📊 Resumo para ${tenant.name}:`)
      console.log(`   ✅ Novos matriculados: ${enrolled}`)
      console.log(`   ℹ️  Já matriculados: ${alreadyEnrolled}`)
    }

    console.log('\n🎉 Processo concluído!')
  } catch (error) {
    console.error('❌ Erro ao matricular usuários:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

enrollAllUsersInFreeCourse()
