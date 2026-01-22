import prisma from '../lib/prisma'

async function checkCoursePrices() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        price: true,
        compareAtPrice: true,
        currency: true,
        isFree: true,
        productMappings: {
          include: {
            integration: true,
          },
        },
      },
    })

    console.log('\n📊 Cursos Publicados:\n')

    for (const course of courses) {
      console.log(`\n📚 ${course.title}`)
      console.log(`   ID: ${course.id}`)
      console.log(`   Gratuito: ${course.isFree ? 'Sim' : 'Não'}`)
      console.log(`   Preço: ${course.price || 'Não definido'}`)
      console.log(`   Preço Comparativo: ${course.compareAtPrice || 'Não definido'}`)
      console.log(`   Moeda: ${course.currency}`)
      console.log(`   Produtos Vinculados: ${course.productMappings.length}`)

      if (course.productMappings.length > 0) {
        course.productMappings.forEach((mapping) => {
          console.log(`      - ${mapping.integration.platform}: ${mapping.externalProductId}`)
        })
      }
    }

    console.log('\n✅ Verificação concluída!')
  } catch (error) {
    console.error('❌ Erro ao verificar preços:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCoursePrices()
