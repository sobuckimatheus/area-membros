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

    // Buscar compras aprovadas do usuário que foram registradas via webhook
    const purchases = await prisma.purchase.findMany({
      where: {
        tenantId: user.tenantId,
        customerEmail: user.email,
        status: 'APPROVED',
      },
      include: {
        course: true,
      },
    })

    console.log(`[syncUserPurchases] ${purchases.length} compras aprovadas encontradas`)

    const enrolledCourseIds = new Set(user.enrollments.map((e) => e.courseId))
    let newEnrollments = 0

    // Para cada compra aprovada, verificar se o usuário já tem acesso ao curso
    for (const purchase of purchases) {
      if (!purchase.courseId) {
        console.log(`[syncUserPurchases] Compra ${purchase.id} não tem curso vinculado`)
        continue
      }

      if (enrolledCourseIds.has(purchase.courseId)) {
        console.log(`[syncUserPurchases] Usuário já matriculado no curso ${purchase.course?.title}`)
        continue
      }

      // Criar enrollment
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: purchase.courseId,
          tenantId: user.tenantId,
          status: 'ACTIVE',
          progress: 0,
          source: 'PURCHASE',
          sourceId: purchase.id,
        },
      })

      enrolledCourseIds.add(purchase.courseId)
      newEnrollments++

      console.log(`[syncUserPurchases] ✅ Novo enrollment criado: ${purchase.course?.title}`)
    }

    console.log(`[syncUserPurchases] Sincronização concluída. ${newEnrollments} novos cursos liberados`)

    return {
      success: true,
      newEnrollments,
      message: newEnrollments > 0
        ? `${newEnrollments} novo(s) curso(s) liberado(s)!`
        : 'Nenhum curso novo encontrado',
    }
  } catch (error) {
    console.error('[syncUserPurchases] Erro ao sincronizar compras:', error)
    return { success: false, message: 'Erro ao sincronizar compras' }
  }
}
