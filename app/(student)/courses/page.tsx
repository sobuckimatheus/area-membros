import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { hasActiveSubscription } from '@/lib/services/subscription'

// Função helper para formatar preço
function formatPrice(price: any, currency: string = 'BRL') {
  if (!price) return null

  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(numPrice)
}

export default async function CoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verificar se usuário tem assinatura ativa
  const isSubscriber = await hasActiveSubscription(user.id)

  // Buscar todos os cursos publicados
  const courses = await prisma.course.findMany({
    where: {
      tenantId: user.tenantId,
      status: 'PUBLISHED',
    },
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
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Buscar matrículas do usuário
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    select: {
      courseId: true,
    },
  })

  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-card-foreground">Explorar Cursos</h1>
          <p className="mt-1 text-muted-foreground">
            {courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        {courses.length === 0 ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Nenhum curso disponível</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ainda não há cursos publicados. Volte mais tarde!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {courses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.id)

              return (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-xl hover:shadow-lg transition-shadow bg-card border-border"
                >
                  {/* Thumbnail - Formato Netflix vertical 9:16 - Clicável */}
                  {course.thumbnailUrl && (
                    <Link href={`/course/${course.slug}`} prefetch={false}>
                      <div className="aspect-[9/16] bg-muted relative cursor-pointer group">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {isEnrolled && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-100 text-green-700 border border-green-200 text-xs font-medium rounded">
                            ✓
                          </div>
                        )}
                        {course.isFree && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-accent/15 text-accent border border-accent/30 text-xs font-medium rounded">
                            GRÁTIS
                          </div>
                        )}
                        {/* Overlay hover */}
                        <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-card-foreground text-xs font-medium">Ver detalhes</span>
                        </div>
                      </div>
                    </Link>
                  )}

                  <CardHeader className="p-3">
                    {/* Badges */}
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      {course.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                          {course.category.name}
                        </span>
                      )}
                    </div>

                    {/* Título - Clicável */}
                    <Link href={`/course/${course.slug}`} prefetch={false}>
                      <CardTitle className="line-clamp-2 text-card-foreground text-sm leading-tight cursor-pointer hover:text-accent transition-colors">
                        {course.title}
                      </CardTitle>
                    </Link>

                    {/* Instrutor */}
                    {course.instructorName && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {course.instructorName}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="p-3 pt-0">
                    {/* Stats compactas */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                      <span>{course._count.modules} módulos</span>
                      <span>•</span>
                      <span>{course._count.enrollments} alunos</span>
                    </div>

                    {/* Preço */}
                    {!course.isFree && !isEnrolled && (
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-card-foreground font-bold text-sm">
                            {formatPrice(course.price, course.currency)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    {isEnrolled ? (
                      <Link href={`/course/${course.slug}`} prefetch={false}>
                        <Button
                          className="w-full text-xs h-8"
                          variant="default"
                          style={{ backgroundColor: '#2e3b28', borderColor: '#2e3b28' }}
                        >
                          Continuar
                        </Button>
                      </Link>
                    ) : course.isFree ? (
                      <Link href={`/course/${course.slug}`} prefetch={false}>
                        <Button
                          className="w-full text-xs h-8"
                          variant="outline"
                          style={{ backgroundColor: 'transparent', borderColor: '#c6a04e', color: '#2e3b28' }}
                        >
                          Ver Detalhes
                        </Button>
                      </Link>
                    ) : (
                      <a
                        href={course.checkoutUrl || `/course/${course.slug}`}
                        target={course.checkoutUrl ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                      >
                        <Button
                          className="w-full text-xs h-8"
                          variant="default"
                          style={{ backgroundColor: '#2e3b28', borderColor: '#2e3b28' }}
                        >
                          Comprar Agora
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
