import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'
import { isJardimMember } from '@/lib/services/community'

const MSG_INCLUDE = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  replyTo: {
    select: {
      id: true,
      content: true,
      imageUrl: true,
      isDeleted: true,
      author: { select: { name: true } },
    },
  },
} as const

/**
 * Retorna mensagens do grupo do Jardim.
 * - sem `after`: últimas 60 (ordem cronológica);
 * - com `after=<id>`: apenas mensagens criadas depois dessa (polling).
 * Exclusivo para membros do Jardim.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const member = await isJardimMember(user.id, user.tenantId)
  if (!member) return NextResponse.json({ error: 'Acesso exclusivo do Jardim' }, { status: 403 })

  const after = request.nextUrl.searchParams.get('after')

  let afterDate: Date | undefined
  if (after) {
    const ref = await prisma.message.findUnique({ where: { id: after }, select: { createdAt: true } })
    afterDate = ref?.createdAt
  }

  const rows = afterDate
    ? await prisma.message.findMany({
        where: { tenantId: user.tenantId, createdAt: { gt: afterDate } },
        orderBy: { createdAt: 'asc' },
        include: MSG_INCLUDE,
        take: 100,
      })
    : (
        await prisma.message.findMany({
          where: { tenantId: user.tenantId },
          orderBy: { createdAt: 'desc' },
          include: MSG_INCLUDE,
          take: 60,
        })
      ).reverse()

  const messages = rows.map((m: any) => ({
    id: m.id,
    content: m.content,
    imageUrl: m.imageUrl,
    createdAt: m.createdAt.toISOString(),
    author: { id: m.author.id, name: m.author.name || 'Membro do Jardim', avatarUrl: m.author.avatarUrl || null },
    replyTo: m.replyTo
      ? {
          id: m.replyTo.id,
          authorName: m.replyTo.author?.name || 'Membro do Jardim',
          content: m.replyTo.isDeleted ? 'Mensagem removida' : m.replyTo.content,
          imageUrl: m.replyTo.imageUrl || null,
        }
      : null,
    mine: m.authorId === user.id,
  }))

  return NextResponse.json({ messages })
}
