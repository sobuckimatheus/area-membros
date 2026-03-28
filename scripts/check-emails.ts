import prisma from '../lib/prisma'

async function main() {
  const logs = await prisma.webhookLog.findMany({
    where: { platform: 'ONPROFIT', status: 'SUCCESS', event: 'PAID' },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { requestPayload: true, createdAt: true }
  })

  logs.forEach((l: any) => {
    const email = l.requestPayload?.customer?.email
    if (!email) return
    console.log(l.createdAt.toISOString().slice(0, 16) + ' | ' + email + ' | ' + email.split('@')[1])
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
