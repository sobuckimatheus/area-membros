import prisma from '../lib/prisma'

async function checkSubscriptions() {
  try {
    console.log('\n💳 Verificando assinaturas no sistema...\n')

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    })

    if (subscriptions.length === 0) {
      console.log('⚠️  Nenhuma assinatura cadastrada.')
      console.log('   Os banners da Área do Assinante só aparecem para usuários com assinatura ativa.\n')
      return
    }

    // Buscar usuários
    const userIds = [...new Set(subscriptions.map(s => s.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    console.log(`✅ Total de assinaturas: ${subscriptions.length}\n`)

    subscriptions.forEach((sub, index) => {
      const isActive = sub.status === 'ACTIVE'
      const statusIcon = isActive ? '✅' : '❌'
      const user = userMap.get(sub.userId)

      console.log(`${statusIcon} Assinatura ${index + 1}:`)
      console.log(`   Usuário: ${user?.name || 'N/A'} (${user?.email || 'N/A'})`)
      console.log(`   Status: ${sub.status}`)
      console.log(`   Plano: ${sub.planName}`)
      console.log(`   Início: ${sub.startedAt.toLocaleDateString('pt-BR')}`)
      console.log(`   Período atual: ${sub.currentPeriodStart.toLocaleDateString('pt-BR')} - ${sub.currentPeriodEnd.toLocaleDateString('pt-BR')}`)
      if (sub.cancelledAt) {
        console.log(`   Cancelada em: ${sub.cancelledAt.toLocaleDateString('pt-BR')}`)
      }
      console.log('')
    })

    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE')
    console.log(`💎 Assinaturas ativas: ${activeSubscriptions.length}`)

    if (activeSubscriptions.length > 0) {
      console.log('\n✨ Usuários com assinatura ativa verão os 3 banners na Área do Assinante!\n')
    } else {
      console.log('\n⚠️  Nenhuma assinatura ativa. Crie uma assinatura de teste para ver os banners.\n')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar assinaturas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriptions()
