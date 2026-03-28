import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const usersWithoutAuth = await prisma.user.findMany({
    where: {
      supabaseUid: null,
      status: 'ACTIVE'
    },
    select: {
      email: true,
      name: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  })

  console.log(`\n📊 Usuários ATIVOS sem Supabase Auth: ${usersWithoutAuth.length}`)

  if (usersWithoutAuth.length > 0) {
    console.log('\n❌ Esses usuários NÃO conseguem fazer login:')
    usersWithoutAuth.forEach(user => {
      console.log(`  - ${user.email}`)
    })
    console.log('\n⚠️ Problema: Usuários sem supabaseUid não podem fazer login nem usar "Esqueceu a senha"')
  }

  await prisma.$disconnect()
}

check()
