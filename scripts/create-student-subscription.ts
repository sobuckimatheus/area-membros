import prisma from '../lib/prisma'

async function createStudentSubscription() {
  try {
    console.log('\n💳 Criando assinatura para aluno...\n')

    // Buscar um usuário STUDENT
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, tenantId: true, name: true, email: true },
    })

    if (!student) {
      console.log('❌ Nenhum usuário aluno encontrado.')
      console.log('   Crie um usuário aluno primeiro.\n')
      return
    }

    // Verificar se já tem assinatura
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: student.id, status: 'ACTIVE' },
    })

    if (existingSub) {
      console.log('✅ Este aluno já tem uma assinatura ativa!')
      console.log(`   Usuário: ${student.name} (${student.email})`)
      console.log(`   Status: ${existingSub.status}`)
      console.log(`   Plano: ${existingSub.planName}`)
      console.log(`   Período: ${existingSub.currentPeriodStart.toLocaleDateString('pt-BR')} - ${existingSub.currentPeriodEnd.toLocaleDateString('pt-BR')}`)
      console.log('\n✨ Os banners da Área do Assinante já devem aparecer no dashboard!\n')
      return
    }

    // Criar assinatura de teste
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // Assinatura válida por 1 mês

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: student.tenantId,
        userId: student.id,
        planName: 'Plano Premium',
        planInterval: 'monthly',
        amount: 97.00,
        currency: 'BRL',
        status: 'ACTIVE',
        gateway: 'TEST',
        gatewayId: 'test-subscription-student-' + Date.now(),
        startedAt: startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
      },
    })

    console.log('✅ Assinatura criada com sucesso para o aluno!')
    console.log(`   Usuário: ${student.name} (${student.email})`)
    console.log(`   Status: ${subscription.status}`)
    console.log(`   Plano: ${subscription.planName}`)
    console.log(`   Período: ${subscription.currentPeriodStart.toLocaleDateString('pt-BR')} - ${subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}`)
    console.log('\n✨ Agora faça login com este aluno e os banners aparecerão no dashboard!\n')
  } catch (error) {
    console.error('❌ Erro ao criar assinatura:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createStudentSubscription()
