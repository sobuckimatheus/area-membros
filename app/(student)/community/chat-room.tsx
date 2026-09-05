'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ImagePlus, X, Send, Loader2, Reply, CornerDownRight } from 'lucide-react'
import { sendMessage, type ChatMessage } from '@/lib/actions/community'

function timeHM(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yst = new Date(); yst.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === yst.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

function Avatar({ name, url, size = 32 }: { name: string; url: string | null; size?: number }) {
  if (url) return <img src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
  return (
    <div className="flex items-center justify-center rounded-full bg-sidebar text-sidebar-foreground font-medium"
      style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function QuotedBlock({ authorName, content, imageUrl }: { authorName: string; content: string; imageUrl: string | null }) {
  return (
    <div className="mb-1 flex items-start gap-1.5 rounded-md border-l-2 border-accent bg-black/5 px-2 py-1 text-xs">
      <div className="min-w-0">
        <p className="font-semibold text-accent">{authorName}</p>
        <p className="truncate text-muted-foreground">{imageUrl && !content ? '📷 Foto' : content}</p>
      </div>
    </div>
  )
}

export function ChatRoom({ initialMessages, currentUserId }: { initialMessages: ChatMessage[]; currentUserId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const lastIdRef = useRef<string | null>(initialMessages.at(-1)?.id ?? null)

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => { scrollToBottom(false) }, [scrollToBottom])

  // Polling: busca mensagens novas a cada 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const after = lastIdRef.current
        const res = await fetch(`/api/community/messages${after ? `?after=${after}` : ''}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data.messages?.length) {
          const el = scrollRef.current
          const nearBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight < 120 : true
          setMessages((prev) => {
            const known = new Set(prev.map((m) => m.id))
            const incoming = (data.messages as ChatMessage[])
              .filter((m) => !known.has(m.id))
              .map((m) => ({ ...m, mine: m.author.id === currentUserId }))
            if (!incoming.length) return prev
            lastIdRef.current = incoming.at(-1)!.id
            return [...prev, ...incoming]
          })
          if (nearBottom) setTimeout(() => scrollToBottom(), 50)
        }
      } catch { /* silencioso */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [currentUserId, scrollToBottom])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null); setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/community/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha no upload')
      setImageUrl(data.url)
    } catch (err: any) { setError(err.message) } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function submit() {
    if ((!text.trim() && !imageUrl) || sending) return
    setSending(true); setError(null)
    try {
      const msg = await sendMessage({ content: text, imageUrl, replyToId: replyTo?.id ?? null })
      setMessages((prev) => [...prev, { ...msg, mine: true }])
      lastIdRef.current = msg.id
      setText(''); setImageUrl(null); setReplyTo(null)
      setTimeout(() => scrollToBottom(), 50)
    } catch (err: any) { setError(err.message) } finally { setSending(false) }
  }

  let lastDay = ''

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col rounded-2xl border border-border bg-card">
      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Ainda não há mensagens. Seja a primeira a conversar com o Jardim. 🌷
          </p>
        )}
        {messages.map((m) => {
          const day = dayLabel(m.createdAt)
          const showDay = day !== lastDay
          lastDay = day
          return (
            <div key={m.id}>
              {showDay && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-0.5 text-[11px] text-muted-foreground">{day}</span>
                </div>
              )}
              <div className={`group flex items-end gap-2 ${m.mine ? 'flex-row-reverse' : ''}`}>
                {!m.mine && <Avatar name={m.author.name} url={m.author.avatarUrl} />}
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${m.mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {!m.mine && <p className="mb-0.5 text-xs font-semibold text-accent">{m.author.name}</p>}
                  {m.replyTo && (
                    <QuotedBlock authorName={m.replyTo.authorName} content={m.replyTo.content} imageUrl={m.replyTo.imageUrl} />
                  )}
                  {m.imageUrl && <img src={m.imageUrl} alt="" className="mb-1 max-h-72 rounded-lg" />}
                  {m.content && <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{m.content}</p>}
                  <p className={`mt-0.5 text-right text-[10px] ${m.mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{timeHM(m.createdAt)}</p>
                </div>
                <button
                  onClick={() => setReplyTo(m)}
                  className="mb-2 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                  aria-label="Responder"
                  title="Responder"
                >
                  <Reply className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-lg border-l-2 border-accent bg-muted px-3 py-1.5">
            <div className="flex items-center gap-2 text-xs">
              <CornerDownRight className="h-3.5 w-3.5 text-accent" />
              <div className="min-w-0">
                <span className="font-semibold text-accent">{replyTo.author.name}</span>
                <span className="ml-2 text-muted-foreground">{replyTo.imageUrl && !replyTo.content ? '📷 Foto' : replyTo.content.slice(0, 60)}</span>
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} aria-label="Cancelar resposta"><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
        )}
        {imageUrl && (
          <div className="relative mb-2 w-fit">
            <img src={imageUrl} alt="" className="max-h-40 rounded-lg" />
            <button onClick={() => setImageUrl(null)} className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background" aria-label="Remover imagem">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <div className="flex items-end gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Enviar foto">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="Escreva uma mensagem..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button onClick={submit} disabled={sending || uploading} className="rounded-full bg-primary p-2.5 text-primary-foreground hover:opacity-90 disabled:opacity-50" aria-label="Enviar">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
