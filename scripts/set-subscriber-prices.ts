import prisma from '../lib/prisma'

// Defina os preços para assinantes aqui
const subscriberPrices: Record<string, { subscriberPrice: number; subscriberCheckoutUrl: string }> = {
  'Oração Profética do Futuro Marido': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/SEU_LINK_ASSINANTES_ORACAO',
  },
  'Sem Amarras': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/SEU_LINK_ASSINANTES_AMARRAS',
  },
  'Coração Curado': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/SEU_LINK_ASSINANTES_CORACAO',
  },
  'Alma Gêmea da Vida Real': {
    subscriberPrice: 67.00,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/SEU_LINK_ASSINANTES_ALMA',
  },
  'A Cura da Criança Interior': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/SEU_LINK_ASSINANTES_CRIANCA',
  },
  'Método Seja Vista': {
    subscriberPrice: 397.00,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/SEU_LINK_ASSINANTES_VISTA',
  },
}

async function setSubscriberPrices() {
  try {
    console.log('\n💎 Atualizando preços para assinantes...\n')

    const courses = await prisma.course.findMany({
      where: {
        title: {
          in: Object.keys(subscriberPrices),
        },
      },
    })

    console.log(`✅ Encontrados ${courses.length} cursos para atualizar\n`)

    for (const course of courses) {
      const priceConfig = subscriberPrices[course.title]

      if (!priceConfig) {
        console.log(`⚠️  Configuração não encontrada para: ${course.title}`)
        continue
      }

      await prisma.course.update({
        where: { id: course.id },
        data: {
          subscriberPrice: priceConfig.subscriberPrice,
          subscriberCheckoutUrl: priceConfig.subscriberCheckoutUrl,
        },
      })

      console.log(`✅ ${course.title}`)
      console.log(`   Preço para assinantes: R$ ${priceConfig.subscriberPrice.toFixed(2)}`)
      console.log(`   URL de checkout: ${priceConfig.subscriberCheckoutUrl}`)
      console.log('')
    }

    console.log('✅ Preços para assinantes atualizados com sucesso!\n')
  } catch (error) {
    console.error('❌ Erro ao atualizar preços:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setSubscriberPrices()
