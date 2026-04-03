import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/services/email'

export const dynamic = 'force-dynamic'

// Protege a rota com uma chave secreta
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000)
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000)

    // Buscar webhooks aprovados entre 1 e 2 minutos atrás que ainda não receberam follow-up
    const logs = await prisma.webhookLog.findMany({
      where: {
        platform: 'ONPROFIT',
        status: 'SUCCESS',
        followUpSentAt: null,
        processedAt: {
          gte: twoMinutesAgo,
          lte: oneMinuteAgo,
        },
      },
      include: {
        user: {
          include: {
            enrollments: {
              include: {
                course: { select: { title: true } }
              }
            }
          }
        }
      }
    })

    if (logs.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    // Agrupar por userId para não enviar duplicado se houver múltiplos logs
    const usersSent = new Set<string>()
    let sent = 0

    for (const log of logs) {
      if (!log.user || usersSent.has(log.user.id)) continue

      const courseTitles = log.user.enrollments
        .map(e => e.course.title)
        .filter(t => t !== 'Aulas Gratuitas')

      try {
        await sendWelcomeEmail({
          to: log.user.email,
          name: log.user.name || log.user.email.split('@')[0],
          courseTitles,
          password: 'Acesso@2025',
        })

        // Marcar todos os logs desse usuário como follow-up enviado
        await prisma.webhookLog.updateMany({
          where: {
            userId: log.user.id,
            followUpSentAt: null,
          },
          data: { followUpSentAt: now },
        })

        usersSent.add(log.user.id)
        sent++
        console.log(`✅ Follow-up enviado para: ${log.user.email}`)
      } catch (err) {
        console.error(`❌ Erro ao enviar follow-up para ${log.user.email}:`, err)
      }
    }

    return NextResponse.json({ success: true, sent })
  } catch (error: any) {
    console.error('❌ Erro no cron de follow-up:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
