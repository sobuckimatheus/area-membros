import prisma from '@/lib/prisma'

/**
 * Uma usuária é "membro ativo do Jardim" quando possui matrícula ATIVA
 * no curso "O Jardim de Rute". Só membros ativos têm acesso completo à
 * comunidade (publicar, curtir, comentar). As demais veem uma prévia.
 */
export async function isJardimMember(userId: string, tenantId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      course: {
        tenantId,
        title: { contains: 'Jardim de Rute', mode: 'insensitive' },
      },
    },
    select: { id: true },
  })
  return !!enrollment
}

/**
 * Retorna o curso "O Jardim de Rute" (para CTA de compra / checkout).
 * Reutiliza o checkoutUrl já existente no curso — não inventa URL.
 */
export async function getJardimCourse(tenantId: string) {
  return prisma.course.findFirst({
    where: {
      tenantId,
      title: { contains: 'Jardim de Rute', mode: 'insensitive' },
    },
    select: { id: true, slug: true, title: true, checkoutUrl: true, price: true },
  })
}

export const POST_CATEGORIES = [
  { value: 'COMUNIDADE', label: 'Comunidade' },
  { value: 'PEDIDO_ORACAO', label: 'Pedidos de oração' },
  { value: 'TESTEMUNHO', label: 'Testemunhos' },
  { value: 'DEUS_AGINDO', label: 'O que Deus está fazendo' },
] as const

export type PostCategoryValue = (typeof POST_CATEGORIES)[number]['value']
