import prisma from '../lib/prisma'

async function checkUserAccess() {
  try {
    console.log('\n🔍 Verificando acesso do usuário ao curso Área do Assinante...\n')

    // Buscar o curso
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { title: { contains: 'Area do Assinante', mode: 'insensitive' } },
          { title: { contains: 'Área do Assinante', mode: 'insensitive' } },
        ],
      },
      include: {
        productMappings: {
          include: {
            integration: true,
          },
        },
      },
    })

    if (!course) {
      console.log('❌ Curso não encontrado.\n')
      return
    }

    console.log(`📚 Curso: ${course.title}`)
    console.log(`   ID: ${course.id}`)
    console.log(`   Gratuito: ${course.isFree ? 'Sim' : 'Não'}`)
    console.log(`   Exclusivo Assinantes: ${course.isSubscriberOnly ? 'Sim' : 'Não'}`)
    console.log('')

    // Buscar produtos mapeados
    if (course.productMappings.length > 0) {
      console.log('📦 Produtos vinculados:')
      course.productMappings.forEach((pm) => {
        console.log(`   - ${pm.externalProductName || pm.externalProductId}`)
      })
      console.log('')
    } else {
      console.log('⚠️  Nenhum produto vinculado ao curso.\n')
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

    console.log(`👤 Usuário: ${student.name} (${student.email})`)
    console.log('')

    // Verificar matrícula
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: student.id,
        courseId: course.id,
        status: 'ACTIVE',
      },
    })

    if (enrollment) {
      console.log('✅ Usuário TEM matrícula no curso!')
      console.log(`   Status: ${enrollment.status}`)
      console.log(`   Progresso: ${enrollment.progress}%`)
      console.log('')
    } else {
      console.log('❌ Usuário NÃO tem matrícula no curso.')
      console.log('')
    }

    // Verificar compras
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: student.id,
        tenantId: student.tenantId,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    })

    if (purchases.length > 0) {
      console.log(`📝 Compras registradas: ${purchases.length}`)
      purchases.forEach((p) => {
        console.log(`   - Curso: ${p.course.title}`)
        console.log(`     Status: ${p.status}`)
        console.log(`     Valor: R$ ${p.amount}`)
      })
      console.log('')
    } else {
      console.log('⚠️  Nenhuma compra registrada para este usuário.\n')
    }

    // Verificar assinatura
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: student.id,
        status: 'ACTIVE',
      },
    })

    if (subscription) {
      console.log('✅ Usuário TEM assinatura ativa!')
      console.log(`   Plano: ${subscription.planName}`)
      console.log(`   Válida até: ${subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}`)
      console.log('')
    } else {
      console.log('❌ Usuário NÃO tem assinatura ativa.\n')
    }

    // Diagnóstico
    console.log('🔧 DIAGNÓSTICO:')
    if (enrollment) {
      console.log('   ✅ Acesso OK - Usuário pode acessar o curso')
    } else if (course.isFree) {
      console.log('   ⚠️  Curso gratuito mas usuário não matriculado')
      console.log('   💡 Solução: Criar matrícula automática')
    } else if (subscription && course.isSubscriberOnly) {
      console.log('   ⚠️  Usuário é assinante e curso é exclusivo')
      console.log('   💡 Solução: Dar acesso automático para assinantes')
    } else {
      console.log('   ❌ Usuário precisa comprar o curso ou ter assinatura')
    }
    console.log('')
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserAccess()
