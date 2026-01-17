import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixUserTenant() {
  try {
    console.log('🔧 Corrigindo tenant do usuário...\n')

    // Buscar o tenant demo (que tem os cursos)
    const demoTenant = await prisma.tenant.findFirst({
      where: { slug: 'demo' },
    })

    if (!demoTenant) {
      console.error('❌ Tenant demo não encontrado!')
      return
    }

    console.log(`✅ Tenant demo encontrado: ${demoTenant.name} (${demoTenant.id})`)

    // Buscar o usuário teste@teste4.com
    const user = await prisma.user.findFirst({
      where: { email: 'teste@teste4.com' },
      include: { tenant: true },
    })

    if (!user) {
      console.error('❌ Usuário não encontrado!')
      return
    }

    console.log(`\n👤 Usuário encontrado: ${user.email}`)
    console.log(`   Tenant atual: ${user.tenant.name} (${user.tenantId})`)

    // Atualizar o tenant do usuário
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { tenantId: demoTenant.id },
      include: { tenant: true },
    })

    console.log(`\n✅ Tenant atualizado com sucesso!`)
    console.log(`   Novo tenant: ${updatedUser.tenant.name} (${updatedUser.tenantId})`)

    // Verificar cursos do novo tenant
    const courses = await prisma.course.count({
      where: { tenantId: demoTenant.id },
    })

    console.log(`\n📚 Cursos disponíveis no tenant: ${courses}`)
    console.log('\n🎉 Agora você pode fazer login e verá todos os cursos!')
    console.log('   URL: https://areamembros.dianamascarello.com.br/auth/login')
    console.log('   Email: teste@teste4.com')
    console.log('   Senha: Diana@2026')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserTenant()
