import prisma from '../lib/prisma'

async function checkBanners() {
  try {
    console.log('\n🎯 Verificando banners cadastrados...\n')

    const banners = await prisma.subscriberBanner.findMany({
      orderBy: { createdAt: 'desc' },
    })

    if (banners.length === 0) {
      console.log('⚠️  Nenhum banner cadastrado ainda.')
      console.log('   Acesse /admin/subscriber-banners para criar o primeiro banner.\n')
      return
    }

    console.log(`✅ Total de banners: ${banners.length}\n`)

    banners.forEach((banner, index) => {
      console.log(`📌 Banner ${index + 1}:`)
      console.log(`   ID: ${banner.id}`)
      console.log(`   Título: ${banner.title || '(sem título)'}`)
      console.log(`   Imagem: ${banner.imageUrl}`)
      console.log(`   Link: ${banner.link || '(sem link)'}`)
      console.log(`   Ordem: ${banner.order}`)
      console.log(`   Status: ${banner.isActive ? '✅ Ativo' : '❌ Inativo'}`)
      console.log(`   Criado em: ${banner.createdAt.toLocaleDateString('pt-BR')}`)
      console.log('')
    })

    const activeBanners = banners.filter(b => b.isActive)
    console.log(`💎 Banners ativos que aparecem no dashboard: ${activeBanners.length}`)
    console.log('\n💡 Lembre-se: Os banners só aparecem para usuários com assinatura ativa.\n')
  } catch (error) {
    console.error('❌ Erro ao verificar banners:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBanners()
