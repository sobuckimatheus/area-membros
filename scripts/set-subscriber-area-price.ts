import prisma from '../lib/prisma'

async function setSubscriberAreaPrice() {
  try {
    console.log('\n💰 Configurando preço do curso Área do Assinante...\n')

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
      console.log('❌ Curso "Área do Assinante" não encontrado.')
      console.log('   Certifique-se de que o curso foi criado.\n')
      return
    }

    // Atualizar preço e checkout
    const updated = await prisma.course.update({
      where: { id: course.id },
      data: {
        price: 14.90,
        currency: 'BRL',
        checkoutUrl: 'https://pay.kirvano.com/c4e042de-9d2c-449c-a1bc-c8b9942b77e8',
        subscriberPrice: null,
        subscriberCheckoutUrl: null,
      },
    })

    console.log('✅ Curso atualizado com sucesso!')
    console.log(`   Curso: ${updated.title}`)
    console.log(`   Preço: R$ ${updated.price}`)
    console.log(`   Checkout: ${updated.checkoutUrl}`)
    console.log(`   Preço Assinante: ${updated.subscriberPrice || 'Não configurado'}`)
    console.log('\n💡 Agora o curso pode ser comprado por R$ 14,90!\n')
  } catch (error) {
    console.error('❌ Erro ao configurar preço:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setSubscriberAreaPrice()
