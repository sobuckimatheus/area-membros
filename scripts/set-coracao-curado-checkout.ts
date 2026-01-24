import prisma from '../lib/prisma'

async function setCoracaoCuradoCheckout() {
  try {
    console.log('\n💰 Configurando checkout do curso Coração Curado...\n')

    // Buscar o curso
    const course = await prisma.course.findFirst({
      where: {
        slug: 'coracao-curado',
      },
    })

    if (!course) {
      console.log('❌ Curso "Coração Curado" não encontrado.\n')
      return
    }

    console.log(`📚 Curso encontrado: ${course.title}`)
    console.log(`   Preço atual: R$ ${course.price || 'Não configurado'}`)
    console.log(`   Checkout atual: ${course.checkoutUrl || 'NÃO CONFIGURADO'}`)
    console.log('')

    // IMPORTANTE: Cole aqui o link do checkout da Kirvano
    const checkoutUrl = 'SEU_LINK_AQUI'

    if (checkoutUrl === 'SEU_LINK_AQUI') {
      console.log('⚠️  ATENÇÃO: Você precisa editar este script e adicionar o link do checkout!')
      console.log('')
      console.log('📝 Edite o arquivo:')
      console.log('   scripts/set-coracao-curado-checkout.ts')
      console.log('')
      console.log('💡 Substitua "SEU_LINK_AQUI" pelo link real do checkout da Kirvano')
      console.log('   Exemplo: https://pay.kirvano.com/abc-123-def-456')
      console.log('')
      return
    }

    // Atualizar checkout URL
    const updated = await prisma.course.update({
      where: { id: course.id },
      data: {
        checkoutUrl,
      },
    })

    console.log('✅ Checkout URL configurado com sucesso!')
    console.log(`   Curso: ${updated.title}`)
    console.log(`   Checkout: ${updated.checkoutUrl}`)
    console.log('')
    console.log('💡 Agora o botão de compra aparecerá na página do curso!\n')
  } catch (error) {
    console.error('❌ Erro ao configurar checkout:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setCoracaoCuradoCheckout()
