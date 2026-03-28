import prisma from '../lib/prisma'

async function testUpdate() {
  try {
    console.log('🔍 Buscando curso Coração Curado...')

    const course = await prisma.course.findFirst({
      where: {
        slug: 'coracao-curado'
      }
    })

    if (!course) {
      console.log('❌ Curso não encontrado')
      return
    }

    console.log('✅ Curso encontrado:')
    console.log('   ID:', course.id)
    console.log('   Título:', course.title)
    console.log('   Checkout URL:', course.checkoutUrl || 'Não configurado')
    console.log('')

    console.log('🔨 Testando atualização...')

    const updated = await prisma.course.update({
      where: { id: course.id },
      data: {
        checkoutUrl: course.checkoutUrl || 'https://exemplo.com/test'
      }
    })

    console.log('✅ Atualização bem-sucedida!')
    console.log('   Checkout URL:', updated.checkoutUrl)

  } catch (error) {
    console.error('❌ Erro ao atualizar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUpdate()
