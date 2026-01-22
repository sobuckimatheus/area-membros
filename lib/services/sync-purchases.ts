import prisma from '@/lib/prisma'

interface KirvanoTransaction {
  id: string
  product_id: string
  product_name: string
  customer_email: string
  status: string
  created_at: string
}

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

    // Buscar integração Kirvano ativa
    const kirvanoIntegration = await prisma.integration.findFirst({
      where: {
        tenantId: user.tenantId,
        platform: 'KIRVANO',
        isActive: true,
      },
    })

    if (!kirvanoIntegration) {
      console.log('[syncUserPurchases] Integração Kirvano não encontrada')
      return { success: false, message: 'Integração Kirvano não configurada' }
    }

    const config = kirvanoIntegration.config as any

    if (!config?.apiKey) {
      console.log('[syncUserPurchases] API Key da Kirvano não configurada')
      return { success: false, message: 'API Key não configurada' }
    }

    // Buscar transações do usuário na Kirvano
    const response = await fetch(
      `https://api.kirvano.com/v2/transaction/list?customer_email=${encodeURIComponent(user.email)}`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('[syncUserPurchases] Erro ao buscar transações:', response.statusText)
      return { success: false, message: 'Erro ao buscar transações' }
    }

    const data = await response.json()
    const transactions: KirvanoTransaction[] = data.data || []

    console.log(`[syncUserPurchases] ${transactions.length} transações encontradas`)

    // Filtrar apenas transações aprovadas/pagas
    const approvedTransactions = transactions.filter(
      (t) => t.status === 'approved' || t.status === 'paid' || t.status === 'complete'
    )

    console.log(`[syncUserPurchases] ${approvedTransactions.length} transações aprovadas`)

    // Buscar mapeamentos de produtos
    const productMappings = await prisma.productMapping.findMany({
      where: {
        integrationId: kirvanoIntegration.id,
        isActive: true,
      },
      include: {
        courses: true,
      },
    })

    console.log(`[syncUserPurchases] ${productMappings.length} mapeamentos de produtos encontrados`)

    const enrolledCourseIds = new Set(user.enrollments.map((e) => e.courseId))
    let newEnrollments = 0

    // Para cada transação aprovada, verificar se o usuário já tem acesso ao curso
    for (const transaction of approvedTransactions) {
      const mapping = productMappings.find(
        (m) => m.externalProductId === transaction.product_id
      )

      if (!mapping || mapping.courses.length === 0) {
        console.log(`[syncUserPurchases] Produto ${transaction.product_id} não mapeado para cursos`)
        continue
      }

      // Criar enrollment para cada curso vinculado ao produto
      for (const course of mapping.courses) {
        if (enrolledCourseIds.has(course.id)) {
          console.log(`[syncUserPurchases] Usuário já matriculado no curso ${course.title}`)
          continue
        }

        // Criar enrollment
        await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            tenantId: user.tenantId,
            status: 'ACTIVE',
            progress: 0,
            source: 'PURCHASE',
          },
        })

        enrolledCourseIds.add(course.id)
        newEnrollments++

        console.log(`[syncUserPurchases] ✅ Novo enrollment criado: ${course.title}`)
      }
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
