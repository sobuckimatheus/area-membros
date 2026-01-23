import prisma from '../lib/prisma'

async function checkSubscriberCourse() {
  try {
    console.log('\n🎓 Buscando curso "Area do Assinante"...\n')

    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { title: { contains: 'Area do Assinante', mode: 'insensitive' } },
          { title: { contains: 'Área do Assinante', mode: 'insensitive' } },
          { slug: { contains: 'area', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isSubscriberOnly: true,
      },
    })

    if (!course) {
      console.log('❌ Curso "Area do Assinante" não encontrado.')
      console.log('   Certifique-se de que o curso foi criado.\n')
      return
    }

    console.log('✅ Curso encontrado!')
    console.log(`   Título: ${course.title}`)
    console.log(`   Slug: ${course.slug}`)
    console.log(`   URL: /course/${course.slug}`)
    console.log(`   Status: ${course.status}`)
    console.log(`   Exclusivo: ${course.isSubscriberOnly ? 'Sim' : 'Não'}`)
    console.log('\n💡 Use este link nos banners: /course/' + course.slug + '\n')
  } catch (error) {
    console.error('❌ Erro ao buscar curso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriberCourse()
