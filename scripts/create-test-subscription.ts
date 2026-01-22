import prisma from '../lib/prisma'

async function createTestSubscription() {
  try {
    console.log('\n💳 Criando assinatura de teste...\n')

    // Buscar um usuário admin para criar a assinatura
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, tenantId: true, name: true, email: true },
    })

    if (!admin) {
      console.log('❌ Nenhum usuário admin encontrado.')
      return
    }

    // Verificar se já tem assinatura
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: admin.id, status: 'ACTIVE' },
    })

    if (existingSub) {
      console.log('⚠️  Este usuário já tem uma assinatura ativa.')
      console.log(`   Usuário: ${admin.name} (${admin.email})`)
      console.log(`   Status: ${existingSub.status}`)
      console.log(`   Plano: ${existingSub.planName}\n`)
      return
    }

    // Criar assinatura de teste
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // Assinatura válida por 1 mês

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: admin.tenantId,
        userId: admin.id,
        planName: 'Plano Premium',
        planInterval: 'monthly',
        amount: 97.00,
        currency: 'BRL',
        status: 'ACTIVE',
        gateway: 'TEST',
        gatewayId: 'test-subscription-' + Date.now(),
        startedAt: startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
      },
    })

    console.log('✅ Assinatura de teste criada com sucesso!')
    console.log(`   Usuário: ${admin.name} (${admin.email})`)
    console.log(`   Status: ${subscription.status}`)
    console.log(`   Plano: ${subscription.planName}`)
    console.log(`   Período: ${subscription.currentPeriodStart.toLocaleDateString('pt-BR')} - ${subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}`)
    console.log('\n✨ Agora faça login com este usuário e os 3 banners aparecerão no dashboard!\n')
  } catch (error) {
    console.error('❌ Erro ao criar assinatura:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestSubscription()
