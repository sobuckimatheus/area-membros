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
    <div className="jardim min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-8 py-6">
          <h1 className="font-serif text-3xl font-bold text-primary">Meus Cursos</h1>
          <p className="mt-1 text-muted-foreground">
            {enrollments.length > 0
              ? `Você está matriculado em ${enrollments.length} ${enrollments.length === 1 ? 'curso' : 'cursos'}`
              : 'Você ainda não está matriculado em nenhum curso'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        {enrollments.length === 0 ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Nenhum curso encontrado</CardTitle>
              <CardDescription className="text-muted-foreground">
                Você ainda não adquiriu nenhum curso. Explore os cursos disponíveis e comece a aprender!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/courses" prefetch={false}>
                <Button className="bg-primary hover:opacity-90 text-primary-foreground">
                  Explorar Cursos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border">
                  {enrollment.course.thumbnailUrl && (
                    <div className="aspect-[9/16] bg-muted relative">
                      <img
                        src={enrollment.course.thumbnailUrl}
                        alt={enrollment.course.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader className="p-3">
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-secondary text-primary border border-border">
                        ✓
                      </span>
                      {enrollment.course.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                          {enrollment.course.category.name}
                        </span>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-card-foreground text-sm leading-tight">{enrollment.course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      {/* Barra de progresso */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium text-foreground">{enrollment.progress.toString()}%</span>
                        </div>
                        <div className="w-full rounded-full h-1.5 bg-muted">
                          <div
                            className="h-1.5 rounded-full transition-all bg-accent"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      <Link href={`/course/${enrollment.course.slug}`} prefetch={false}>
                        <Button className="w-full bg-primary hover:opacity-90 text-primary-foreground text-xs h-8">
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
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">
                    {enrollments.length}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Cursos Ativos
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">
                    {enrollments.filter(e => Number(e.progress) === 100).length}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Cursos Concluídos
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-accent">
                    {Math.round(
                      enrollments.reduce((acc, e) => acc + Number(e.progress), 0) / enrollments.length
                    )}
                    %
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
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
