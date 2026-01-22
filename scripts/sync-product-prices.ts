import prisma from '../lib/prisma'

async function syncProductPrices() {
  try {
    console.log('\n🔄 Sincronizando preços dos produtos...\n')

    // Buscar integração Kirvano
    const kirvanoIntegration = await prisma.integration.findFirst({
      where: {
        platform: 'KIRVANO',
        isActive: true,
      },
    })

    if (!kirvanoIntegration) {
      console.error('❌ Integração Kirvano não encontrada')
      return
    }

    console.log(`✅ Integração encontrada: ${kirvanoIntegration.platform}`)

    const apiKey = kirvanoIntegration.config as any

    if (!apiKey?.apiKey) {
      console.error('❌ API Key da Kirvano não configurada')
      return
    }

    console.log('\n📦 Buscando produtos da Kirvano...\n')

    // Buscar produtos da Kirvano
    const response = await fetch('https://api.kirvano.com/v2/product/list', {
      headers: {
        'Authorization': `Bearer ${apiKey.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ Erro ao buscar produtos:', response.statusText)
      return
    }

    const data = await response.json()
    const products = data.data || []

    console.log(`✅ ${products.length} produtos encontrados na Kirvano\n`)

    // Buscar cursos com produtos vinculados
    const courses = await prisma.course.findMany({
      where: {
        productMappings: {
          some: {
            integrationId: kirvanoIntegration.id,
          },
        },
      },
      include: {
        productMappings: {
          where: {
            integrationId: kirvanoIntegration.id,
          },
        },
      },
    })

    console.log(`📚 ${courses.length} cursos com produtos vinculados\n`)

    let updated = 0

    for (const course of courses) {
      const mapping = course.productMappings[0]

      if (!mapping) continue

      // Buscar produto correspondente
      const product = products.find((p: any) => p.id === mapping.externalProductId)

      if (!product) {
        console.log(`⚠️  Produto não encontrado para: ${course.title}`)
        continue
      }

      // Atualizar curso com preço do produto
      const price = parseFloat(product.price) / 100 // Kirvano retorna em centavos

      await prisma.course.update({
        where: { id: course.id },
        data: {
          price: price,
          currency: 'BRL',
        },
      })

      console.log(`✅ ${course.title}`)
      console.log(`   Produto: ${product.name}`)
      console.log(`   Preço: R$ ${price.toFixed(2)}\n`)

      updated++
    }

    console.log(`\n✨ ${updated} cursos atualizados com sucesso!`)
  } catch (error) {
    console.error('❌ Erro ao sincronizar preços:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncProductPrices()
