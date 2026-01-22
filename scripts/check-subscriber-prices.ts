import prisma from '../lib/prisma'

async function checkSubscriberPrices() {
  try {
    console.log('\n💎 Verificando preços para assinantes...\n')

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        price: true,
        subscriberPrice: true,
        checkoutUrl: true,
        subscriberCheckoutUrl: true,
      },
    })

    courses.forEach((course) => {
      console.log(`📚 ${course.title}`)
      console.log(`   Preço Normal: R$ ${course.price || 'Não definido'}`)
      console.log(`   Preço Assinante: R$ ${course.subscriberPrice || 'NÃO CONFIGURADO'}`)
      console.log(`   Checkout Normal: ${course.checkoutUrl || 'Não definido'}`)
      console.log(`   Checkout Assinante: ${course.subscriberCheckoutUrl || 'NÃO CONFIGURADO'}`)
      console.log('')
    })

    const withSubscriberPrice = courses.filter(c => c.subscriberPrice)
    console.log(`\n✅ ${withSubscriberPrice.length} de ${courses.length} cursos têm preço de assinante configurado\n`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriberPrices()
