import prisma from '../lib/prisma'

const email = process.argv[2]

async function main() {
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) { console.log('Usuario nao encontrado'); return }
  console.log('User:', user.id, user.name)

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: { select: { title: true } } }
  })
  console.log('Enrollments:', enrollments.map((e: any) => e.course.title + ' [' + e.status + ']').join(', ') || 'nenhum')

  const logs = await prisma.webhookLog.findMany({
    where: { platform: 'ONPROFIT' },
    orderBy: { createdAt: 'desc' },
    select: { status: true, requestPayload: true, createdAt: true }
  })
  const hers = logs.filter((l: any) => l.requestPayload?.customer?.email === email)
  console.log('\nWebhook logs:')
  hers.forEach((l: any) => {
    console.log(l.createdAt.toISOString().slice(0, 16) + ' | ' + l.status + ' | ' + l.requestPayload?.item_type + ' | product.id: ' + l.requestPayload?.product?.id + ' | ' + l.requestPayload?.product?.name)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
