import prisma from '@/lib/prisma'

export async function syncUserPurchases(userId: string) {
  try {
    console.log(`[syncUserPurchases] Iniciando sincronização para usuário ${userId}`)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          select: { courseId: true },
        },
      },
    })

    if (!user) {
      console.log('[syncUserPurchases] Usuário não encontrado')
      return { success: false, message: 'Usuário não encontrado' }
    }

    // Como o webhook já cria os enrollments automaticamente quando uma compra é aprovada,
    // esta função serve apenas como backup. Retorna sucesso indicando que não há ação necessária.
    console.log(`[syncUserPurchases] Webhook já processa enrollments automaticamente`)
    console.log(`[syncUserPurchases] Usuário possui ${user.enrollments.length} enrollment(s) ativo(s)`)

    return {
      success: true,
      newEnrollments: 0,
      message: 'Webhook processa enrollments automaticamente',
    }
  } catch (error) {
    console.error('[syncUserPurchases] Erro ao sincronizar compras:', error)
    return { success: false, message: 'Erro ao sincronizar compras' }
  }
}
