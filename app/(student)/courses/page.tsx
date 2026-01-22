import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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
    <div className="min-h-screen pt-20 bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Explorar Cursos</h1>
          <p className="mt-1 text-zinc-400">
            {courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        {courses.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Nenhum curso disponível</CardTitle>
              <CardDescription className="text-zinc-400">
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
                  className="overflow-hidden hover:shadow-xl hover:shadow-red-900/20 transition-shadow bg-zinc-900 border-zinc-800"
                >
                  {/* Thumbnail - Formato Netflix vertical 9:16 */}
                  {course.thumbnailUrl && (
                    <div className="aspect-[9/16] bg-zinc-800 relative">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                      {isEnrolled && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-900/30 text-green-400 border border-green-800 text-xs font-medium rounded">
                          ✓
                        </div>
                      )}
                      {course.isFree && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-900/30 text-red-400 border border-red-800 text-xs font-medium rounded">
                          GRÁTIS
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="p-3">
                    {/* Badges */}
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      {course.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800">
                          {course.category.name}
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <CardTitle className="line-clamp-2 text-white text-sm leading-tight">
                      {course.title}
                    </CardTitle>

                    {/* Instrutor */}
                    {course.instructorName && (
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {course.instructorName}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="p-3 pt-0">
                    {/* Stats compactas */}
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-3">
                      <span>{course._count.modules} módulos</span>
                      <span>•</span>
                      <span>{course._count.enrollments} alunos</span>
                    </div>

                    {/* Preço */}
                    {!course.isFree && course.price && (
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-bold text-sm">
                            {formatPrice(course.price, course.currency)}
                          </span>
                          {course.compareAtPrice && (
                            <span className="text-zinc-500 line-through text-xs">
                              {formatPrice(course.compareAtPrice, course.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <Link href={`/course/${course.slug}`}>
                      <Button
                        className="w-full text-xs h-8"
                        variant={isEnrolled ? "default" : "outline"}
                        style={
                          isEnrolled
                            ? { backgroundColor: '#dc2626', borderColor: '#dc2626' }
                            : { backgroundColor: 'transparent', borderColor: '#52525b', color: 'white' }
                        }
                      >
                        {isEnrolled ? 'Continuar' : 'Ver Detalhes'}
                      </Button>
                    </Link>
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
