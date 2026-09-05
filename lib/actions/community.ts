'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'
import { isJardimMember } from '@/lib/services/community'

async function requireMember() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autenticado')
  const member = await isJardimMember(user.id, user.tenantId)
  if (!member) throw new Error('Acesso exclusivo do Jardim')
  return user
}

export type ChatMessage = {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  author: { id: string; name: string; avatarUrl: string | null }
  replyTo: { id: string; authorName: string; content: string; imageUrl: string | null } | null
  mine: boolean
}

function serialize(m: any, currentUserId: string): ChatMessage {
  return {
    id: m.id,
    content: m.content,
    imageUrl: m.imageUrl,
    createdAt: m.createdAt.toISOString(),
    author: {
      id: m.author.id,
      name: m.author.name || 'Membro do Jardim',
      avatarUrl: m.author.avatarUrl || null,
    },
    replyTo: m.replyTo
      ? {
          id: m.replyTo.id,
          authorName: m.replyTo.author?.name || 'Membro do Jardim',
          content: m.replyTo.isDeleted ? 'Mensagem removida' : m.replyTo.content,
          imageUrl: m.replyTo.imageUrl || null,
        }
      : null,
    mine: m.authorId === currentUserId,
  }
}

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

/** Envia uma mensagem para o grupo (com citação opcional). */
export async function sendMessage(input: {
  content: string
  imageUrl?: string | null
  replyToId?: string | null
}): Promise<ChatMessage> {
  const user = await requireMember()
  const content = input.content?.trim() || ''
  const imageUrl = input.imageUrl || null

  if (!content && !imageUrl) throw new Error('Mensagem vazia')

  // Garante que a mensagem citada é do mesmo tenant (segurança)
  let replyToId: string | null = null
  if (input.replyToId) {
    const target = await prisma.message.findFirst({
      where: { id: input.replyToId, tenantId: user.tenantId },
      select: { id: true },
    })
    replyToId = target?.id || null
  }

  const msg = await prisma.message.create({
    data: {
      tenantId: user.tenantId,
      authorId: user.id,
      content,
      imageUrl,
      replyToId,
    },
    include: MSG_INCLUDE,
  })

  return serialize(msg, user.id)
}
