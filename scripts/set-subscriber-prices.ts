import prisma from '../lib/prisma'

// Defina os preços para assinantes aqui
const subscriberPrices: Record<string, { subscriberPrice: number; subscriberCheckoutUrl: string }> = {
  'Oração Profética do Futuro Marido': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/aa7aebae-e41d-4a1a-b0ca-65bda4e83faf',
  },
  'Sem Amarras': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/fecde97c-6015-4107-a3e9-17b86beeacf2',
  },
  'Coração Curado': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/9f25aafe-f142-491c-a23b-954821c085b0',
  },
  'Alma Gêmea da Vida Real': {
    subscriberPrice: 67.00,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/a3aac7b2-ee06-4449-b9ce-97e24f6a6623',
  },
  'A Cura da Criança Interior': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/846b9be1-49da-4c6f-b7b5-f66b1f07643f',
  },
  'Método Seja Vista': {
    subscriberPrice: 397.00,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/ba934277-189c-4ced-9f2b-e37d49219131',
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
