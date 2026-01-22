import prisma from '../lib/prisma'

async function checkIntegration() {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        platform: 'KIRVANO',
      },
    })

    if (!integration) {
      console.log('❌ Integração Kirvano não encontrada')
      return
    }

    console.log('\n✅ Integração encontrada:')
    console.log(JSON.stringify(integration, null, 2))
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkIntegration()
