import { PrismaClient } from '@prisma/client'
import prisma from '../lib/prisma'

async function test() {
  console.log('🧪 Testando middleware de criação automática no Supabase Auth\n')

  // Buscar tenant
  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'demo' }
  })

  if (!tenant) {
    throw new Error('Tenant não encontrado')
  }

  // Email de teste único
  const testEmail = `teste.middleware.${Date.now()}@exemplo.com`

  console.log('📧 Criando usuário de teste:', testEmail)
  console.log('⏳ O middleware deve criar automaticamente no Supabase Auth...\n')

  try {
    // Criar usuário APENAS no Prisma - o middleware deve criar no Supabase automaticamente
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: testEmail,
        name: 'Teste Middleware',
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: new Date()
        // NÃO estamos passando supabaseUid - o middleware deve adicionar!
      }
    })

    console.log('✅ Usuário criado no Prisma!')
    console.log('📊 Dados do usuário:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Supabase UID:', user.supabaseUid || '❌ AUSENTE')

    if (user.supabaseUid) {
      console.log('\n✅ SUCESSO! Middleware funcionou - usuário tem supabaseUid')
    } else {
      console.log('\n❌ FALHA! Middleware não funcionou - usuário sem supabaseUid')
    }

    // Limpar teste
    console.log('\n🧹 Limpando usuário de teste...')
    await prisma.user.delete({ where: { id: user.id } })
    console.log('✅ Teste concluído e limpeza realizada')

  } catch (error) {
    console.error('\n❌ Erro ao testar middleware:', error)
    throw error
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
