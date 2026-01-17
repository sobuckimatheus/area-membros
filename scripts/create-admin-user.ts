import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔧 Criando tenant e usuário admin...\n')

    // 1. Criar ou atualizar o tenant
    const tenant = await prisma.tenant.upsert({
      where: { id: 'diana-tenant-2026' },
      update: {
        name: 'Diana Mascarello',
        slug: 'diana-mascarello',
      },
      create: {
        id: 'diana-tenant-2026',
        name: 'Diana Mascarello',
        slug: 'diana-mascarello',
      },
    })

    console.log('✅ Tenant criado/atualizado:')
    console.log(`   ID: ${tenant.id}`)
    console.log(`   Nome: ${tenant.name}`)
    console.log(`   Slug: ${tenant.slug}\n`)

    // 2. Criar ou atualizar o usuário admin
    const user = await prisma.user.upsert({
      where: { supabaseUid: 'a691e46f-6ada-44a3-b459-fabbc3f92955' },
      update: {
        email: 'teste@teste4.com',
        name: 'Diana Mascarello',
        role: 'ADMIN',
      },
      create: {
        supabaseUid: 'a691e46f-6ada-44a3-b459-fabbc3f92955',
        email: 'teste@teste4.com',
        name: 'Diana Mascarello',
        role: 'ADMIN',
        tenantId: tenant.id,
      },
      include: {
        tenant: true,
      },
    })

    console.log('✅ Usuário admin criado/atualizado:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Supabase UID: ${user.supabaseUid}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nome: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Tenant: ${user.tenant.name}`)
    console.log(`   Criado em: ${user.createdAt.toLocaleString('pt-BR')}\n`)

    console.log('🎉 Sucesso! Agora você pode fazer login em:')
    console.log('   https://areamembros.dianamascarello.com.br/auth/login')
    console.log('\n   Email: teste@teste4.com')
    console.log('   Senha: [a senha que você definiu no Supabase Auth]\n')

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
