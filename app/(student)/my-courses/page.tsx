import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/actions/auth"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Função helper para formatar preço
function formatPrice(price: any, currency: string = 'BRL') {
  if (!price) return null

  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(numPrice)
}

export default async function MyCoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar apenas cursos matriculados
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
      course: {
        status: "PUBLISHED",
      },
    },
    include: {
      course: {
        include: {
          category: true,
          productMappings: {
            include: {
              integration: true,
            },
          },
          _count: {
            select: {
              modules: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen pt-20 bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Meus Cursos</h1>
          <p className="mt-1 text-zinc-400">
            {enrollments.length > 0
              ? `Você está matriculado em ${enrollments.length} ${enrollments.length === 1 ? 'curso' : 'cursos'}`
              : 'Você ainda não está matriculado em nenhum curso'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        {enrollments.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Nenhum curso encontrado</CardTitle>
              <CardDescription className="text-zinc-400">
                Você ainda não adquiriu nenhum curso. Explore os cursos disponíveis e comece a aprender!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/courses">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Explorar Cursos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden hover:shadow-xl hover:shadow-red-900/20 transition-shadow bg-zinc-900 border-zinc-800">
                  {enrollment.course.thumbnailUrl && (
                    <div className="aspect-[9/16] bg-zinc-800 relative">
                      <img
                        src={enrollment.course.thumbnailUrl}
                        alt={enrollment.course.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader className="p-3">
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-900/30 text-green-400 border border-green-800">
                        ✓
                      </span>
                      {enrollment.course.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800">
                          {enrollment.course.category.name}
                        </span>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-white text-sm leading-tight">{enrollment.course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      {/* Barra de progresso */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">Progresso</span>
                          <span className="font-medium text-white">{enrollment.progress.toString()}%</span>
                        </div>
                        <div className="w-full rounded-full h-1.5 bg-zinc-800">
                          <div
                            className="h-1.5 rounded-full transition-all bg-red-600"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Preço */}
                      {!enrollment.course.isFree && enrollment.course.price && (
                        <div className="text-xs text-zinc-400">
                          Valor: <span className="text-white font-semibold">{formatPrice(enrollment.course.price, enrollment.course.currency)}</span>
                        </div>
                      )}

                      <Link href={`/course/${enrollment.course.slug}`}>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8">
                          {Number(enrollment.progress) === 0 ? 'Começar' : 'Continuar'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-red-500">
                    {enrollments.length}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Cursos Ativos
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-green-500">
                    {enrollments.filter(e => Number(e.progress) === 100).length}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Cursos Concluídos
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-yellow-500">
                    {Math.round(
                      enrollments.reduce((acc, e) => acc + Number(e.progress), 0) / enrollments.length
                    )}
                    %
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Progresso Médio
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
