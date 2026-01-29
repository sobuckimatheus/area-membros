'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ProgressBarProvider() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // Detecta quando começa a navegação
    const handleStart = () => setIsNavigating(true)
    const handleComplete = () => setIsNavigating(false)

    // Marca navegação como completa quando pathname muda
    setIsNavigating(false)

    // Listener para cliques em links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:') && !link.target) {
        setIsNavigating(true)
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [pathname])

  return (
    <>
      <ProgressBar
        height="6px"
        color="#ef4444"
        options={{
          showSpinner: false,
          trickle: true,
          trickleSpeed: 150,
          minimum: 0.15,
          easing: 'ease',
          speed: 300,
        }}
        shallowRouting
        delay={50}
        style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 99999;
          box-shadow: 0 0 10px #ef4444, 0 0 5px #ef4444;
        "
      />

      {/* Loading Overlay */}
      {isNavigating && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000]"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-800 font-semibold text-lg">Carregando...</p>
          </div>
        </div>
      )}
    </>
  )
}
