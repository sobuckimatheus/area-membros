import prisma from '@/lib/prisma'

/**
 * Verifica se o usuário tem uma assinatura ativa
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      currentPeriodEnd: {
        gte: new Date(), // verifica se ainda não expirou
      },
    },
  })

  return !!subscription
}

/**
 * Retorna a assinatura ativa do usuário, se houver
 */
export async function getActiveSubscription(userId: string) {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      currentPeriodEnd: {
        gte: new Date(),
      },
    },
  })
}
