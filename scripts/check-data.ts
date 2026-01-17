import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('🔍 Verificando dados no banco...\n')

    // 1. Listar todos os tenants
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
            categories: true,
          },
        },
      },
    })

    console.log('📊 Tenants encontrados:')
    console.log('━'.repeat(80))
    for (const tenant of tenants) {
      console.log(`\n🏢 ${tenant.name} (${tenant.id})`)
      console.log(`   Slug: ${tenant.slug}`)
      console.log(`   Usuários: ${tenant._count.users}`)
      console.log(`   Cursos: ${tenant._count.courses}`)
      console.log(`   Categorias: ${tenant._count.categories}`)
    }

    // 2. Listar todos os usuários
    console.log('\n\n👥 Usuários encontrados:')
    console.log('━'.repeat(80))
    const users = await prisma.user.findMany({
      include: {
        tenant: true,
      },
    })

    for (const user of users) {
      console.log(`\n👤 ${user.name || user.email}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Tenant: ${user.tenant.name} (${user.tenantId})`)
      console.log(`   Supabase UID: ${user.supabaseUid}`)
    }

    // 3. Listar todos os cursos
    console.log('\n\n📚 Cursos encontrados:')
    console.log('━'.repeat(80))
    const courses = await prisma.course.findMany({
      include: {
        tenant: true,
        category: true,
      },
    })

    if (courses.length === 0) {
      console.log('\n❌ Nenhum curso encontrado!')
    } else {
      for (const course of courses) {
        console.log(`\n📖 ${course.title}`)
        console.log(`   Slug: ${course.slug}`)
        console.log(`   Status: ${course.status}`)
        console.log(`   Tenant: ${course.tenant.name} (${course.tenantId})`)
        console.log(`   Categoria: ${course.category?.name || 'Sem categoria'}`)
        console.log(`   Gratuito: ${course.isFree ? 'Sim' : 'Não'}`)
      }
    }

    // 4. Listar todas as categorias
    console.log('\n\n📁 Categorias encontradas:')
    console.log('━'.repeat(80))
    const categories = await prisma.category.findMany({
      include: {
        tenant: true,
        _count: {
          select: { courses: true },
        },
      },
    })

    if (categories.length === 0) {
      console.log('\n❌ Nenhuma categoria encontrada!')
    } else {
      for (const category of categories) {
        console.log(`\n📁 ${category.name}`)
        console.log(`   Slug: ${category.slug}`)
        console.log(`   Tenant: ${category.tenant.name} (${category.tenantId})`)
        console.log(`   Cursos: ${category._count.courses}`)
      }
    }

    console.log('\n')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
