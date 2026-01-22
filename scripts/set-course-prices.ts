import prisma from '../lib/prisma'

// Defina os preços dos cursos aqui
const coursePrices: Record<string, { price: number; compareAtPrice?: number }> = {
  'Oração Profética do Futuro Marido': { price: 29.90 },
  'Sem Amarras': { price: 29.90 },
  'Coração Curado': { price: 29.90 },
  'Alma Gêmea da Vida Real': { price: 97.00 },
  'A Cura da Criança Interior': { price: 29.90 },
  'Método Seja Vista': { price: 497.00 },
}

async function setCoursePrice() {
  try {
    console.log('\n💰 Atualizando preços dos cursos...\n')

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        isFree: false,
      },
    })

    let updated = 0

    for (const course of courses) {
      const priceData = coursePrices[course.title]

      if (!priceData) {
        console.log(`⚠️  Preço não definido para: ${course.title}`)
        continue
      }

      await prisma.course.update({
        where: { id: course.id },
        data: {
          price: priceData.price,
          compareAtPrice: priceData.compareAtPrice || null,
          currency: 'BRL',
        },
      })

      console.log(`✅ ${course.title}`)
      console.log(`   Preço: R$ ${priceData.price.toFixed(2)}`)
      if (priceData.compareAtPrice) {
        console.log(`   De: R$ ${priceData.compareAtPrice.toFixed(2)}`)
      }
      console.log()

      updated++
    }

    console.log(`\n✨ ${updated} cursos atualizados com sucesso!\n`)
  } catch (error) {
    console.error('❌ Erro ao atualizar preços:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setCoursePrice()
