'use client'

import { Video, Play } from 'lucide-react'
import { JardimStudentShell } from '@/components/jardim/student-shell'
import { JardimLogo } from '@/components/jardim/logo'

/**
 * PREVIEW visual — usa o componente REAL da área de membros
 * (JardimStudentShell) com um corpo de dashboard de exemplo.
 * Serve só pra validar o visual; não é rota da área real.
 */

const COURSES = [
  { title: 'IDENTIDADE', desc: 'Descubra quem você é em Deus e o seu valor.', progress: 67 },
  { title: 'CURA', desc: 'Seja curada, liberta e transformada por dentro.', progress: 42 },
  { title: 'MATURIDADE', desc: 'Desenvolva emoções, limites e relacionamentos saudáveis.', progress: 25 },
  { title: 'PREPARAÇÃO', desc: 'Se prepare para viver, construir e florescer na promessa.', progress: 10 },
]

function CourseCard({ title, desc, progress }: (typeof COURSES)[number]) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative flex h-36 flex-col items-center justify-center bg-secondary px-4 text-center">
        <JardimLogo className="mb-2 h-6 w-6" />
        <p className="font-serif text-lg tracking-wide text-primary">{title}</p>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{desc}</p>
      </div>
      <div className="px-4 py-3">
        <div className="mb-1 text-[11px] text-muted-foreground">{progress}% concluído</div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function PreviewJardimPage() {
  return (
    <JardimStudentShell user={{ name: 'Diana', email: 'diana@exemplo.com' }} signoutAction={() => {}}>
      <div className="space-y-8 p-4 lg:p-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-2xl border border-border bg-muted">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="flex flex-col justify-center p-6 md:p-10">
              <JardimLogo className="mb-4 h-7 w-7" />
              <h2 className="font-serif text-2xl leading-snug text-primary md:text-4xl">
                Um lugar de cultivo para mulheres que entenderam que{' '}
                <span className="italic text-accent">uma promessa exige preparação.</span>
              </h2>
              <button className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                Continuar Assistindo <Play className="h-4 w-4" />
              </button>
            </div>
            <div className="relative min-h-[180px] bg-gradient-to-br from-[#d9c9a3] to-[#b79b6f] md:min-h-full">
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#7c6a45]/60">imagem do hero</div>
            </div>
          </div>
        </section>

        {/* Meus Cursos */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-primary">Meus Cursos</h2>
            <button className="text-sm text-accent hover:underline">Ver todos →</button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {COURSES.map((c) => <CourseCard key={c.title} {...c} />)}
          </div>
        </section>

        {/* Ao vivo + Próxima aula */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-serif text-lg text-primary">Ao vivo</h3>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="rounded bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">Ao vivo</span>
              <span className="text-foreground">Toda terça às 14:40</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Encontros ao vivo para aprofundamento, respostas e direcionamento.</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Video className="h-4 w-4" /> Entrar na sala
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-serif text-lg text-primary">Próxima Aula</h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="h-16 w-24 shrink-0 rounded-lg bg-gradient-to-br from-[#d9c9a3] to-[#b79b6f]" />
              <div>
                <p className="text-xs text-muted-foreground">Aula 04</p>
                <p className="font-serif text-primary">Curando feridas que te impedem de florescer</p>
              </div>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              Assistir agora <Play className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </JardimStudentShell>
  )
}
