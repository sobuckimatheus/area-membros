import prisma from '../lib/prisma'

async function checkCourseCheckout() {
  try {
    console.log('\n🔍 Verificando configuração de checkout dos cursos...\n')

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        checkoutUrl: true,
        price: true,
        introVideoUrl: true,
      },
      orderBy: {
        title: 'asc',
      },
    })

    if (courses.length === 0) {
      console.log('⚠️  Nenhum curso publicado encontrado.\n')
      return
    }

    console.log(`📚 Total de cursos publicados: ${courses.length}\n`)

    courses.forEach((course) => {
      const hasCheckout = !!course.checkoutUrl
      const hasPrice = !!course.price
      const hasVideo = !!course.introVideoUrl
      const statusIcon = hasCheckout ? '✅' : '❌'

      console.log(`${statusIcon} ${course.title}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Preço: ${hasPrice ? `R$ ${course.price}` : 'Não configurado'}`)
      console.log(`   Checkout URL: ${hasCheckout ? course.checkoutUrl : 'NÃO CONFIGURADO'}`)
      console.log(`   Vídeo Intro: ${hasVideo ? 'Sim' : 'Não'}`)

      if (hasVideo && !hasCheckout) {
        console.log(`   ⚠️  ATENÇÃO: Tem vídeo mas não tem checkout URL!`)
      }

      console.log('')
    })

    const withoutCheckout = courses.filter(c => !c.checkoutUrl)
    if (withoutCheckout.length > 0) {
      console.log(`\n⚠️  ${withoutCheckout.length} curso(s) sem checkout URL configurado:`)
      withoutCheckout.forEach(c => {
        console.log(`   - ${c.title}`)
      })
      console.log('')
    }
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCourseCheckout()
