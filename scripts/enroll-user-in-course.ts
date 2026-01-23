import prisma from '../lib/prisma'

async function enrollUserInCourse() {
  try {
    console.log('\n📝 Matriculando usuário no curso Área do Assinante...\n')

    // Buscar o curso
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { title: { contains: 'Area do Assinante', mode: 'insensitive' } },
          { title: { contains: 'Área do Assinante', mode: 'insensitive' } },
        ],
      },
    })

    if (!course) {
      console.log('❌ Curso não encontrado.\n')
      return
    }

    // Buscar usuário aluno
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true, tenantId: true },
    })

    if (!student) {
      console.log('❌ Nenhum usuário aluno encontrado.\n')
      return
    }

    // Verificar se já tem matrícula
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: student.id,
        courseId: course.id,
      },
    })

    if (existingEnrollment) {
      console.log('✅ Usuário já tem matrícula neste curso!')
      console.log(`   Usuário: ${student.name} (${student.email})`)
      console.log(`   Curso: ${course.title}`)
      console.log(`   Status: ${existingEnrollment.status}`)
      console.log(`   Progresso: ${existingEnrollment.progress}%`)
      console.log('')
      return
    }

    // Criar matrícula
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        tenantId: student.tenantId,
        status: 'ACTIVE',
        progress: 0,
      },
    })

    console.log('✅ Matrícula criada com sucesso!')
    console.log(`   Usuário: ${student.name} (${student.email})`)
    console.log(`   Curso: ${course.title}`)
    console.log(`   Status: ${enrollment.status}`)
    console.log('')
    console.log('💡 Agora o usuário pode acessar todo o conteúdo do curso!\n')
  } catch (error) {
    console.error('❌ Erro ao criar matrícula:', error)
  } finally {
    await prisma.$disconnect()
  }
}

enrollUserInCourse()
