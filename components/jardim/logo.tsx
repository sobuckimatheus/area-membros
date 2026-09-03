// Logo "O Jardim de Rute" — árvore dentro de um arco, em SVG (dourado).
export function JardimLogo({
  className,
  gold = '#c6a04e',
}: {
  className?: string
  gold?: string
}) {
  return (
    <svg viewBox="0 0 120 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M24 118 V56 a36 36 0 0 1 72 0 V118" stroke={gold} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 118 H90" stroke={gold} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 112 V72" stroke={gold} strokeWidth="3" strokeLinecap="round" />
      <path d="M60 84 C60 84 50 78 44 68 M60 90 C60 90 70 82 78 74 M60 96 C60 96 52 92 46 86 M60 100 C60 100 68 96 74 92"
        stroke={gold} strokeWidth="2" strokeLinecap="round" />
      <g fill={gold}>
        <circle cx="60" cy="52" r="9" /><circle cx="46" cy="60" r="7" /><circle cx="74" cy="60" r="7" />
        <circle cx="52" cy="46" r="6" /><circle cx="68" cy="46" r="6" /><circle cx="60" cy="66" r="6" />
        <circle cx="40" cy="52" r="5" /><circle cx="80" cy="52" r="5" />
      </g>
    </svg>
  )
}
