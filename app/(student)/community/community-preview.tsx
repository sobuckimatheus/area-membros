import { Lock } from 'lucide-react'

type PreviewMsg = {
  id: string
  content: string
  imageUrl: string | null
  authorName: string
  authorAvatar: string | null
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) return <img src={url} alt={name} className="h-9 w-9 rounded-full object-cover" />
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar text-sm font-medium text-sidebar-foreground">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

/**
 * Prévia do grupo para quem ainda não é membro do Jardim:
 * mostra o "clima" das conversas (parcialmente visível) + convite.
 * Não é uma tela de bloqueio — desperta o desejo de entrar.
 */
export function CommunityPreview({ messages, checkoutUrl }: { messages: PreviewMsg[]; checkoutUrl: string }) {
  const isExternal = /^https?:\/\//.test(checkoutUrl)
  const sample: PreviewMsg[] =
    messages.length > 0
      ? messages
      : [
          { id: '1', authorName: 'Membro do Jardim', authorAvatar: null, imageUrl: null, content: 'Meninas, hoje aconteceu algo que eu vinha pedindo a Deus há meses…' },
          { id: '2', authorName: 'Membro do Jardim', authorAvatar: null, imageUrl: null, content: 'Que testemunho lindo! Deus é fiel 🙏' },
          { id: '3', authorName: 'Membro do Jardim', authorAvatar: null, imageUrl: null, content: 'Posso pedir uma oração? Estou passando por…' },
        ]

  return (
    <div>
      <div className="relative rounded-2xl border border-border bg-card p-4">
        <div className="space-y-3">
          {sample.map((m) => (
            <div key={m.id} className="flex items-end gap-2">
              <Avatar name={m.authorName} url={m.authorAvatar} />
              <div className="max-w-[78%] rounded-2xl bg-muted px-3 py-2">
                <p className="mb-0.5 text-xs font-semibold text-accent">{m.authorName}</p>
                <p className="select-none text-[15px] leading-snug text-foreground blur-[3px]">
                  {m.content || (m.imageUrl ? '📷 Foto' : '')}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-2xl bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="font-serif text-2xl text-primary">O grupo é exclusivo do Jardim</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Dentro do Jardim, as mulheres conversam, trocam ideias, compartilham testemunhos e oram umas
          pelas outras — todos os dias. É um espaço de fé, apoio e pertencimento.
        </p>
        <a
          href={checkoutUrl}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Quero fazer parte do Jardim
        </a>
      </div>
    </div>
  )
}
