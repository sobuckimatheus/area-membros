import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, BookOpen, Users, Clock } from 'lucide-react'

export default async function AdminCoursesPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const courses = await prisma.course.findMany({
    where: { tenantId: user.tenantId },
    include: {
      category: true,
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cursos</h1>
          <p className="text-slate-600 mt-2">
            Gerencie os cursos da plataforma
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum curso cadastrado
            </h3>
            <p className="text-slate-600 mb-6">
              Comece criando seu primeiro curso
            </p>
            <Link href="/admin/courses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <Link href={`/admin/courses/${course.id}`} className="flex flex-col flex-1">
                {course.thumbnailUrl && (
                  <div className="w-full bg-slate-200">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                        course.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </span>
                    {course.category && (
                      <span className="text-xs text-slate-500">
                        {course.category.name}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center flex-wrap gap-3 text-sm text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{course._count.enrollments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      <span>{course._count.modules}</span>
                    </div>
                    {course.durationHours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{course.durationHours}h</span>
                      </div>
                    )}
                  </div>

                  {course.instructorName && (
                    <div className="text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <span className="font-medium">Instrutor:</span> {course.instructorName}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
