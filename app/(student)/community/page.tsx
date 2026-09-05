export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { isJardimMember, getJardimCourse } from '@/lib/services/community'
import { ChatRoom } from './chat-room'
import { CommunityPreview } from './community-preview'
import type { ChatMessage } from '@/lib/actions/community'

const MSG_INCLUDE = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  replyTo: {
    select: {
      id: true, content: true, imageUrl: true, isDeleted: true,
      author: { select: { name: true } },
    },
  },
} as const

function serialize(m: any, currentUserId: string): ChatMessage {
  return {
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
    mine: m.authorId === currentUserId,
  }
}

export default async function CommunityPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const member = await isJardimMember(user.id, user.tenantId)

  if (!member) {
    const [rows, jardim] = await Promise.all([
      prisma.message.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { author: { select: { name: true, avatarUrl: true } } },
      }),
      getJardimCourse(user.tenantId),
    ])
    const preview = rows.reverse().map((m: any) => ({
      id: m.id,
      content: m.content,
      imageUrl: m.imageUrl,
      authorName: m.author.name || 'Membro do Jardim',
      authorAvatar: m.author.avatarUrl || null,
    }))
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-primary">Comunidade</h1>
          <p className="mt-1 text-muted-foreground">O grupo exclusivo das mulheres do Jardim</p>
        </div>
        <CommunityPreview
          messages={preview}
          checkoutUrl={jardim?.checkoutUrl || (jardim ? `/course/${jardim.slug}` : '/courses')}
        />
      </div>
    )
  }

  const rows = await prisma.message.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: MSG_INCLUDE,
  })
  const messages = rows.reverse().map((m: any) => serialize(m, user.id))

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-4 py-4 lg:py-6">
      <div className="mb-3">
        <h1 className="font-serif text-2xl text-primary">Comunidade</h1>
        <p className="text-sm text-muted-foreground">O grupo exclusivo das mulheres do Jardim</p>
      </div>
      <ChatRoom initialMessages={messages} currentUserId={user.id} />
    </div>
  )
}
