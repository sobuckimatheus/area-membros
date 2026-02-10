'use client'

// Detecta URLs no texto e as transforma em links clicáveis
function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      // Remover pontuação no final da URL (ex: ponto final, vírgula)
      const cleanUrl = part.replace(/[.,;:!?)"'>]+$/, '')
      const trailing = part.slice(cleanUrl.length)
      return (
        <span key={i}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 underline break-all"
          >
            {cleanUrl}
          </a>
          {trailing}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function LessonContent({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="whitespace-pre-line text-zinc-300 leading-relaxed">
      {lines.map((line, i) => (
        <span key={i}>
          {renderTextWithLinks(line)}
          {i < lines.length - 1 && '\n'}
        </span>
      ))}
    </div>
  )
}
