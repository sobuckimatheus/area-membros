import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/actions/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, orderedIds } = await request.json()

    if (!courseId || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Verificar se o curso pertence ao tenant
    const course = await prisma.course.findFirst({
      where: { id: courseId, tenantId: user.tenantId },
    })

    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    // Atualizar a ordem de cada módulo
    await Promise.all(
      orderedIds.map((id: string, index: number) =>
        prisma.module.update({
          where: { id, courseId },
          data: { order: index + 1 },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao reordenar módulos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
