'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, GraduationCap, User, Bell, Menu, X, KeyRound, LogOut,
} from 'lucide-react'
import { JardimLogo } from './logo'

/**
 * Casca visual "O Jardim de Rute" para a área de membros:
 * sidebar (desktop) + topo + drawer e bottom-nav (mobile).
 *
 * Só apresentação — recebe usuário + signout e envolve o conteúdo real.
 * Itens sem rota ainda (Ao vivo, Módulos, etc.) são placeholders visuais
 * até as funcionalidades existirem; não navegam pra evitar 404.
 */

type NavItem = { icon: any; label: string; href?: string; sub?: string }

const NAV: NavItem[] = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: GraduationCap, label: 'Meus Cursos', href: '/my-courses' },
  { icon: User, label: 'Meu Perfil', href: '/profile' },
]

const MOBILE_NAV: NavItem[] = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: GraduationCap, label: 'Meus Cursos', href: '/my-courses' },
  { icon: User, label: 'Perfil', href: '/profile' },
]

function useIsActive() {
  const pathname = usePathname()
  return (href?: string) => {
    if (!href) return false
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const isActive = useIsActive()
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => {
        const active = isActive(item.href)
        const cls = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          active
            ? 'bg-sidebar-accent text-sidebar-foreground'
            : item.href
              ? 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60'
              : 'text-sidebar-foreground/45 cursor-default'
        }`
        const content = (
          <>
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex flex-col items-start leading-tight">
              <span>{item.label}</span>
              {item.sub && <span className="text-[11px] text-sidebar-primary">{item.sub}</span>}
            </span>
          </>
        )
        return item.href ? (
          <Link key={item.label} href={item.href} onClick={onNavigate} className={cls}>{content}</Link>
        ) : (
          <button key={item.label} type="button" className={cls} title="Em breve">{content}</button>
        )
      })}
    </nav>
  )
}

function VerseCard() {
  return (
    <div className="m-3 rounded-xl bg-black/15 px-4 py-5 text-center">
      <JardimLogo className="mx-auto h-6 w-6 opacity-90" />
      <p className="mt-2 text-[11px] uppercase tracking-widest text-sidebar-primary">Versículo do dia</p>
      <p className="mt-1 text-[12px] leading-relaxed text-sidebar-foreground/80">
        Plantei, Apolo regou, mas Deus deu o crescimento.
      </p>
      <p className="mt-1 text-[11px] text-sidebar-foreground/50">1 Co 3:6</p>
    </div>
  )
}

function LogoBlock() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-6">
      <JardimLogo className="h-16 w-16" />
      <div className="text-center leading-tight">
        <p className="font-serif text-lg tracking-wide text-sidebar-foreground">O JARDIM</p>
        <p className="font-serif text-sm tracking-[0.25em] text-sidebar-primary">DE RUTE</p>
      </div>
    </div>
  )
}

export function JardimStudentShell({
  user,
  signoutAction,
  children,
}: {
  user: { name: string | null; email: string }
  signoutAction: () => void
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const isActive = useIsActive()
  const initial = user.name?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="jardim flex min-h-screen bg-background text-foreground">
      {/* Sidebar desktop — fixa, acompanha a rolagem */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground">
        <LogoBlock />
        <NavList />
        <VerseCard />
      </aside>

      {/* Drawer mobile */}
      <div className={`lg:hidden fixed inset-0 z-50 ${menuOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMenuOpen(false)}
        />
        <div className={`absolute left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <JardimLogo className="h-9 w-9" />
              <span className="font-serif tracking-wide">O JARDIM <span className="text-sidebar-primary">DE RUTE</span></span>
            </div>
            <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X className="h-5 w-5" /></button>
          </div>
          <NavList onNavigate={() => setMenuOpen(false)} />
        </div>
      </div>

      {/* Coluna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:px-8 lg:py-5">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu className="h-6 w-6 text-primary" /></button>
            <JardimLogo className="h-8 w-8" />
            <span className="font-serif text-sm tracking-wide text-primary">O JARDIM <span className="text-accent">DE RUTE</span></span>
          </div>

          <div className="hidden lg:block">
            <h1 className="font-serif text-xl tracking-[0.15em] text-primary">ÁREA DE MEMBROS</h1>
            <p className="text-sm text-muted-foreground">Seu espaço de transformação e crescimento</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-primary hover:bg-muted" aria-label="Notificações">
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar text-sm font-medium text-sidebar-foreground"
                aria-label="Menu do usuário"
              >
                {initial}
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-card py-2 shadow-lg">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-medium text-card-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted">
                      <User className="h-4 w-4" /> Meu Perfil
                    </Link>
                    <Link href="/change-password" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted">
                      <KeyRound className="h-4 w-4" /> Alterar Senha
                    </Link>
                    <form action={signoutAction}>
                      <button type="submit" className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      </div>

      {/* Bottom-nav mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href)
          const cls = `flex flex-col items-center gap-1 py-2.5 text-[10px] ${active ? 'text-primary' : 'text-muted-foreground'}`
          return item.href ? (
            <Link key={item.label} href={item.href} className={cls}><item.icon className="h-5 w-5" />{item.label}</Link>
          ) : (
            <button key={item.label} type="button" className={cls}><item.icon className="h-5 w-5" />{item.label}</button>
          )
        })}
      </nav>
    </div>
  )
}
