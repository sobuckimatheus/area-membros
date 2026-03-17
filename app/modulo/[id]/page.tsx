import { notFound } from 'next/navigation'

// Configuração dos vídeos - EDITE AQUI COM SEUS EMBEDS
const videos = {
  '1': {
    titulo: 'Día 1',
    descricao: 'Primer módulo del curso',
    embedUrl: 'https://play.tynk.ai/p/fc82173f-e19a-4710-ab5f-1d442e7b787b',
  },
  '2': {
    titulo: 'Día 2',
    descricao: 'Segundo módulo del curso',
    embedUrl: 'https://play.tynk.ai/p/2e6d3c7e-8e80-4e98-b15b-a428545c1290',
  },
  '3': {
    titulo: 'Día 3',
    descricao: 'Tercer módulo del curso',
    embedUrl: 'https://play.tynk.ai/p/4a98f53f-7a52-4541-a62a-6a2a9928f097',
  },
  '4': {
    titulo: 'Día 4',
    descricao: 'Cuarto módulo del curso',
    embedUrl: 'https://play.tynk.ai/p/a60aa89a-084e-4781-bd25-7ead86a98729',
  },
  '5': {
    titulo: 'Día 5',
    descricao: 'Quinto módulo del curso',
    embedUrl: 'https://play.tynk.ai/p/8f7da9b0-985b-4c2f-96ae-b361f52ccff1',
  },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ModuloPage({ params }: PageProps) {
  const { id } = await params
  const video = videos[id as keyof typeof videos]

  if (!video) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            {video.titulo}
          </h1>
          <p className="text-slate-300">
            {video.descricao}
          </p>
        </div>

        {/* Player de Vídeo */}
        <div className="max-w-5xl mx-auto">
          <div className="relative w-full rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={video.embedUrl}
              className="w-full h-full"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.titulo}
            />
          </div>
        </div>

        {/* Navegação entre módulos */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
            {parseInt(id) > 1 ? (
              <a
                href={`/modulo/${parseInt(id) - 1}`}
                className="text-white hover:text-purple-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Día Anterior
              </a>
            ) : (
              <div />
            )}

            <span className="text-white font-semibold">
              Día {id} de 5
            </span>

            {parseInt(id) < 5 ? (
              <a
                href={`/modulo/${parseInt(id) + 1}`}
                className="text-white hover:text-purple-300 transition-colors flex items-center gap-2"
              >
                Próximo Día
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Lista de todos os módulos */}
        <div className="max-w-5xl mx-auto mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Todos los Días</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(videos).map(([moduleId, moduleVideo]) => (
              <a
                key={moduleId}
                href={`/modulo/${moduleId}`}
                className={`p-4 rounded-lg transition-all ${
                  moduleId === id
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:scale-105'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{moduleId}</div>
                  <div className="text-sm">{moduleVideo.titulo}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Gerar páginas estáticas para todos os módulos
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ]
}
