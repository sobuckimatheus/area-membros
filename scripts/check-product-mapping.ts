import prisma from '../lib/prisma'

async function checkProductMapping() {
  try {
    console.log('\n🔗 Verificando mapeamento de produtos...\n')

    // Buscar o curso
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { title: { contains: 'Area do Assinante', mode: 'insensitive' } },
          { title: { contains: 'Área do Assinante', mode: 'insensitive' } },
        ],
      },
      include: {
        productMappings: {
          include: {
            integration: true,
            courses: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      console.log('❌ Curso "Área do Assinante" não encontrado.\n')
      return
    }

    console.log(`📚 Curso: ${course.title}`)
    console.log(`   ID: ${course.id}`)
    console.log(`   Checkout URL: ${course.checkoutUrl || 'Não configurado'}`)
    console.log('')

    if (course.productMappings.length === 0) {
      console.log('⚠️  PROBLEMA: Nenhum produto Kirvano está vinculado a este curso!')
      console.log('')
      console.log('💡 SOLUÇÃO:')
      console.log('   1. Acesse /admin/products')
      console.log('   2. Clique em "Novo Mapeamento"')
      console.log('   3. Cole o ID do produto da Kirvano')
      console.log('   4. Selecione o curso "Área do Assinante"')
      console.log('')
      console.log('📝 Para encontrar o ID do produto na Kirvano:')
      console.log('   - URL do checkout: ' + (course.checkoutUrl || 'não configurado'))
      console.log('   - O ID geralmente está na URL ou nos dados do webhook')
      console.log('')
      return
    }

    console.log(`✅ Produto(s) vinculado(s): ${course.productMappings.length}\n`)

    course.productMappings.forEach((mapping, index) => {
      console.log(`📦 Produto ${index + 1}:`)
      console.log(`   Nome: ${mapping.externalProductName || 'Sem nome'}`)
      console.log(`   ID Externo: ${mapping.externalProductId}`)
      console.log(`   Plataforma: ${mapping.integration.platform}`)
      console.log(`   Status: ${mapping.isActive ? '✅ Ativo' : '❌ Inativo'}`)
      console.log(`   Cursos vinculados: ${mapping.courses.length}`)
      mapping.courses.forEach((c) => {
        console.log(`      - ${c.title}`)
      })
      console.log('')
    })

    console.log('✅ Configuração OK!')
    console.log('   Quando alguém comprar via Kirvano, o webhook criará a matrícula automaticamente.')
    console.log('')
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductMapping()
