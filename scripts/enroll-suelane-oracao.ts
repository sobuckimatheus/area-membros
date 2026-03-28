import prisma from '../lib/prisma'

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'suelanneroque2014@hotmail.com' } })
  if (!user) { console.log('Usuario nao encontrado'); return }

  const courseId = 'cmjp8sghy0003fyzxml4bxbzb'

  const existing = await prisma.enrollment.findFirst({
    where: { userId: user.id, courseId, status: 'ACTIVE' }
  })

  if (existing) {
    console.log('Ja tem acesso')
    return
  }

  await prisma.enrollment.create({
    data: {
      tenantId: 'cmjp57hhf0000v62p524yzlzl',
      userId: user.id,
      courseId,
      status: 'ACTIVE',
      progress: 0,
      enrolledAt: new Date(),
      source: 'manual',
    }
  })

  console.log('Oracao Profetica liberada!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
