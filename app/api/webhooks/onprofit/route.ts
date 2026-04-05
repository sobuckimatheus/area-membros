import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/services/email'

// Status da Onprofit que indicam pagamento aprovado
const APPROVED_STATUSES = ['PAID', 'AUTHORIZED', 'MANUALLY_AUTHORIZED']

export async function POST(request: NextRequest) {
  let webhookLogId: string | null = null

  try {
    const body = await request.json()

    console.log('=== WEBHOOK ONPROFIT RECEBIDO ===')
    console.log(JSON.stringify(body, null, 2))
    console.log('=================================')

    // Buscar tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'demo' },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 500 })
    }

    // Buscar ou criar integração Onprofit
    let integration = await prisma.integration.findFirst({
      where: { tenantId: tenant.id, platform: 'ONPROFIT' },
    })

    if (!integration) {
      integration = await prisma.integration.create({
        data: {
          tenantId: tenant.id,
          platform: 'ONPROFIT',
          isActive: true,
        },
      })
    }

    // Criar log do webhook
    const webhookLog = await prisma.webhookLog.create({
      data: {
        tenantId: tenant.id,
        integrationId: integration.id,
        platform: 'ONPROFIT',
        event: body.status || 'unknown',
        requestPayload: body,
        status: 'PENDING',
      },
    })
    webhookLogId = webhookLog.id

    await prisma.integration.update({
      where: { id: integration.id },
      data: { webhookCount: { increment: 1 }, lastWebhookAt: new Date() },
    })

    // Processar apenas pagamentos aprovados
    const status = body.status?.toUpperCase()
    if (!APPROVED_STATUSES.includes(status)) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'SUCCESS',
          processedAt: new Date(),
          errorMessage: `Status "${status}" ignorado — apenas ${APPROVED_STATUSES.join(', ')} são processados`,
        },
      })
      return NextResponse.json({ success: true, message: `Status ${status} ignorado` })
    }

    // Extrair dados do payload Onprofit
    // Email e nome ficam dentro de "customer"
    const customer = body.customer || body
    const email = customer.email || body.email
    const firstName = customer.name || body.name || ''
    const lastName = customer.lastname || body.lastname || ''
    const name = `${firstName} ${lastName}`.trim() || null
    // Para order bumps, product_id no root aponta para o produto principal,
    // então usamos body.product.id que tem o ID correto do order bump
    const productId = body.item_type === 'order_bump'
      ? body.product?.id?.toString()
      : body.product_id?.toString() || body.product?.id?.toString()

    if (!email) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { status: 'FAILED', errorMessage: 'Email não encontrado no payload' },
      })
      await prisma.integration.update({
        where: { id: integration.id },
        data: { errorCount: { increment: 1 } },
      })
      return NextResponse.json({ error: 'Email não encontrado no payload' }, { status: 400 })
    }

    if (!productId) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { status: 'FAILED', errorMessage: 'product_id não encontrado no payload' },
      })
      await prisma.integration.update({
        where: { id: integration.id },
        data: { errorCount: { increment: 1 } },
      })
      return NextResponse.json({ error: 'product_id não encontrado no payload' }, { status: 400 })
    }

    // Buscar ou criar usuário
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    })

    const tempPassword = 'Acesso@2025'

    if (!user) {
      // Tentar criar usuário no Supabase Auth
      const createResult = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: name || email.split('@')[0] },
      })

      let supabaseUid: string | null = null

      if (createResult.error) {
        if (createResult.error.message?.includes('already registered')) {
          // Usuário já existe no Supabase — buscar pelo email
          console.log('Usuário já existe no Supabase, buscando...')
          const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
          const existingSupabaseUser = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
          if (existingSupabaseUser) {
            supabaseUid = existingSupabaseUser.id
            await supabase.auth.admin.updateUserById(existingSupabaseUser.id, { password: tempPassword })
            console.log(`✅ Usuário encontrado no Supabase: ${existingSupabaseUser.id}`)
          } else {
            // Não achou via listUsers — pode ser race condition, continua sem supabaseUid
            console.warn('⚠️  Usuário não encontrado via listUsers, prosseguindo sem supabaseUid')
          }
        } else {
          throw new Error(`Falha ao criar autenticação para ${email}: ${createResult.error.message}`)
        }
      } else {
        supabaseUid = createResult.data.user.id
      }

      // Criar usuário no Prisma (com tratamento de race condition)
      try {
        user = await prisma.user.create({
          data: {
            tenantId: tenant.id,
            email,
            name: name || email.split('@')[0],
            supabaseUid: supabaseUid,
            role: 'STUDENT',
            status: 'ACTIVE',
            emailVerified: new Date(),
          },
        })
        console.log(`✅ Usuário criado: ${user.email}`)
      } catch (createError: any) {
        // Race condition: outro webhook simultâneo já criou o usuário
        if (createError.code === 'P2002') {
          user = await prisma.user.findUnique({
            where: { tenantId_email: { tenantId: tenant.id, email } },
          })
          console.log(`✅ Usuário encontrado após race condition: ${user?.email}`)
        } else {
          throw createError
        }
      }
    } else {
      console.log(`✅ Usuário encontrado: ${user.email}`)
    }

    if (!user) {
      throw new Error(`Não foi possível criar ou encontrar o usuário: ${email}`)
    }

    // Buscar mapeamento do produto — tenta oferta específica primeiro, depois produto genérico
    const offerHash = body.offer_hash as string | undefined
    const offerSpecificId = offerHash ? `${productId}:${offerHash}` : null

    let productMapping = offerSpecificId
      ? await prisma.productMapping.findFirst({
          where: {
            tenantId: tenant.id,
            externalProductId: offerSpecificId,
            integration: { platform: 'ONPROFIT' },
          },
          include: { courses: true },
        })
      : null

    if (!productMapping) {
      // Verificar se o produto atual tem mapeamento genérico próprio
      const genericMapping = await prisma.productMapping.findFirst({
        where: {
          tenantId: tenant.id,
          externalProductId: productId,
          integration: { platform: 'ONPROFIT' },
        },
        include: { courses: true },
      })

      // Se não tem mapeamento próprio E o offer_hash pertence a um bundle de
      // outro produto, ignorar (OnProfit envia um webhook por produto do bundle,
      // todos com o mesmo offer_hash — o bundle principal já processa tudo).
      // Se tiver mapeamento próprio (ex: order bump independente), processar normalmente.
      if (!genericMapping && offerHash) {
        const bundleForOtherProduct = await prisma.productMapping.findFirst({
          where: {
            tenantId: tenant.id,
            externalProductId: { contains: `:${offerHash}` },
            integration: { platform: 'ONPROFIT' },
          },
        })

        if (bundleForOtherProduct) {
          console.log(`⚠️  offer_hash ${offerHash} pertence ao bundle "${bundleForOtherProduct.externalProductName}" — webhook avulso ignorado`)
          await prisma.webhookLog.update({
            where: { id: webhookLog.id },
            data: {
              status: 'SUCCESS',
              processedAt: new Date(),
              userId: user.id,
              errorMessage: `Webhook avulso ignorado — produto pertence ao bundle ${bundleForOtherProduct.externalProductName}`,
            },
          })
          return NextResponse.json({ success: true, message: 'Webhook avulso de bundle ignorado' })
        }
      }

      productMapping = genericMapping
    }

    console.log(`🔍 Mapeamento usado: ${productMapping?.externalProductName || 'Não encontrado'} (offer_hash: ${offerHash || 'N/A'})`)

    if (!productMapping || productMapping.courses.length === 0) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'FAILED',
          processedAt: new Date(),
          userId: user.id,
          errorMessage: `Produto ${productId} (${body.name}) não está mapeado no sistema`,
        },
      })
      await prisma.integration.update({
        where: { id: integration.id },
        data: { errorCount: { increment: 1 } },
      })
      console.log(`⚠️  Produto ${productId} não mapeado`)
      return NextResponse.json({
        success: false,
        message: `Produto ${productId} não está mapeado`,
        unmappedProduct: productId,
      })
    }

    // Criar matrículas nos cursos comprados
    const enrollments = []

    for (const course of productMapping.courses) {
      const existing = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: course.id, status: 'ACTIVE' },
      })

      if (existing) {
        console.log(`⚠️  Matrícula já existe: ${user.email} → ${course.title}`)
        continue
      }

      try {
        const enrollment = await prisma.enrollment.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            courseId: course.id,
            status: 'ACTIVE',
            progress: 0,
            enrolledAt: new Date(),
            source: 'webhook',
            sourceId: webhookLog.id,
          },
        })
        enrollments.push({ id: enrollment.id, course: course.title })
        console.log(`✅ Matrícula criada: ${course.title} para ${user.email}`)
      } catch (enrollError: any) {
        if (enrollError.code === 'P2002') {
          // Matrícula já existe (race condition ou re-compra) — ignorar
          console.log(`⚠️  Matrícula já existe: ${user.email} → ${course.title}`)
        } else {
          throw enrollError
        }
      }
    }

    // Matricular automaticamente em cursos gratuitos
    const freeCourses = await prisma.course.findMany({
      where: {
        tenantId: tenant.id,
        status: 'PUBLISHED',
        isFree: true,
      },
    })

    for (const course of freeCourses) {
      const existing = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: course.id, status: 'ACTIVE' },
      })

      if (existing) continue

      await prisma.enrollment.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          courseId: course.id,
          status: 'ACTIVE',
          progress: 0,
          enrolledAt: new Date(),
          source: 'auto_free',
        },
      })

      enrollments.push({ id: 'free', course: course.title })
      console.log(`✅ Curso gratuito adicionado: ${course.title} para ${user.email}`)
    }

    // Atualizar log
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: {
        status: 'SUCCESS',
        processedAt: new Date(),
        userId: user.id,
      },
    })

    // Enviar email de boas-vindas — sempre que pagamento for aprovado
    try {
      if (user.supabaseUid) {
        await supabase.auth.admin.updateUserById(user.supabaseUid, { password: tempPassword })
      }

      // Usar cursos do mapeamento (não só os novos) para garantir que o email
      // seja enviado mesmo em re-compras ou order bumps
      const courseTitlesForEmail = enrollments.length > 0
        ? enrollments.map(e => e.course)
        : productMapping.courses.map(c => c.title)

      await sendWelcomeEmail({
        to: user.email,
        name: user.name || user.email.split('@')[0],
        courseTitles: courseTitlesForEmail,
        password: tempPassword,
      })

      console.log(`✅ Email de boas-vindas enviado para ${user.email}`)
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: `${enrollments.length} matrícula(s) criada(s)`,
      user: { id: user.id, email: user.email, name: user.name },
      enrollments,
    })
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook Onprofit:', error)

    // Marcar o log como FAILED para não ficar preso em PENDING
    if (webhookLogId) {
      try {
        await prisma.webhookLog.update({
          where: { id: webhookLogId },
          data: { status: 'FAILED', errorMessage: error.message, processedAt: new Date() },
        })
      } catch { /* ignora erro secundário */ }
    }

    return NextResponse.json(
      { error: 'Erro ao processar webhook', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook Onprofit - Endpoint ativo',
    url: '/api/webhooks/onprofit',
    method: 'POST',
    status: 'online',
    events: ['PAID', 'AUTHORIZED', 'MANUALLY_AUTHORIZED'],
  })
}
