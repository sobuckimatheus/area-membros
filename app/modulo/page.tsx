export default function ModulosPage() {
  const modulos = [
    { id: 1, titulo: 'Día 1', descricao: 'Primer día del programa' },
    { id: 2, titulo: 'Día 2', descricao: 'Segundo día del programa' },
    { id: 3, titulo: 'Día 3', descricao: 'Tercer día del programa' },
    { id: 4, titulo: 'Día 4', descricao: 'Cuarto día del programa' },
    { id: 5, titulo: 'Día 5', descricao: 'Quinto día del programa' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Del Brazo a la Cuna en 7 Días
          </h1>
          <p className="text-xl text-slate-300">
            Elige un día para comenzar
          </p>
        </div>

        {/* Grid de Módulos */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulos.map((modulo) => (
            <a
              key={modulo.id}
              href={`/modulo/${modulo.id}`}
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 mx-auto group-hover:bg-purple-500 transition-colors">
                <span className="text-3xl font-bold text-white">
                  {modulo.id}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                {modulo.titulo}
              </h2>
              <p className="text-slate-300 text-center">
                {modulo.descricao}
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center text-purple-300 group-hover:text-purple-200">
                  Ver ahora
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Info adicional */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              📚 Sobre el Programa
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Este programa contiene 5 días de contenido esencial. Puedes ver los videos en el orden que prefieras,
              pero recomendamos seguir la secuencia para un mejor aprovechamiento del contenido.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
