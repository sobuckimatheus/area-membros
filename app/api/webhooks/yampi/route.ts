import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Ler o corpo da requisição
    const body = await request.json()

    // Log completo do payload recebido
    console.log('=== WEBHOOK YAMPI RECEBIDO ===')
    console.log(JSON.stringify(body, null, 2))
    console.log('==============================')

    // Buscar tenant demo
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'demo' },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 500 }
      )
    }

    // Buscar ou criar integração Yampi
    let yampiIntegration = await prisma.integration.findFirst({
      where: {
        tenantId: tenant.id,
        platform: 'YAMPI',
      },
    })

    if (!yampiIntegration) {
      yampiIntegration = await prisma.integration.create({
        data: {
          tenantId: tenant.id,
          platform: 'YAMPI',
          isActive: true,
        },
      })
    }

    // Criar log do webhook
    const webhookLog = await prisma.webhookLog.create({
      data: {
        tenantId: tenant.id,
        integrationId: yampiIntegration.id,
        platform: 'YAMPI',
        event: body.event || 'order_paid',
        requestPayload: body,
        status: 'PENDING',
      },
    })

    // Atualizar contadores da integração
    await prisma.integration.update({
      where: { id: yampiIntegration.id },
      data: {
        webhookCount: { increment: 1 },
        lastWebhookAt: new Date(),
      },
    })

    // Processar apenas eventos de pagamento aprovado
    const event = body.event || body.type
    if (event !== 'order_paid' && event !== 'paid') {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'SUCCESS',
          processedAt: new Date(),
          errorMessage: `Evento ${event} ignorado - apenas order_paid é processado`,
        },
      })
      return NextResponse.json({
        success: true,
        message: `Evento ${event} recebido mas ignorado`,
      })
    }

    // Extrair dados do payload Yampi
    const order = body.data?.order || body.order || body
    const customer = order.customer || body.customer
    const items = order.items || order.products || []

    const email = customer?.email
    const name = customer?.name || customer?.full_name

    if (!email) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Email não encontrado no payload',
        },
      })
      await prisma.integration.update({
        where: { id: yampiIntegration.id },
        data: { errorCount: { increment: 1 } },
      })
      return NextResponse.json(
        { error: 'Email não encontrado no payload' },
        { status: 400 }
      )
    }

    if (items.length === 0) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Nenhum produto encontrado no payload',
        },
      })
      await prisma.integration.update({
        where: { id: yampiIntegration.id },
        data: { errorCount: { increment: 1 } },
      })
      return NextResponse.json(
        { error: 'Nenhum produto encontrado no payload' },
        { status: 400 }
      )
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email,
        },
      },
    })

    if (!user) {
      // Criar usuário no Supabase Auth (senha aleatória)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!'

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          name: name || email.split('@')[0],
        },
      })

      if (authError) {
        console.error('Erro ao criar usuário no Supabase:', authError)
      }

      // Criar usuário no Prisma
      user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name: name || email.split('@')[0],
          supabaseUid: authData?.user?.id,
          role: 'STUDENT',
          status: 'ACTIVE',
          emailVerified: new Date(),
        },
      })

      console.log(`✅ Usuário criado: ${user.email}`)
    } else {
      console.log(`✅ Usuário encontrado: ${user.email}`)
    }

    // Processar cada produto comprado
    const enrollments = []
    const unmappedProducts = []

    for (const item of items) {
      const productId = item.sku_code || item.product_id || item.id?.toString()

      if (!productId) {
        console.log(`⚠️  Item sem ID identificável:`, item)
        continue
      }

      // Buscar mapeamento do produto
      const productMapping = await prisma.productMapping.findFirst({
        where: {
          tenantId: tenant.id,
          externalProductId: productId,
          integration: {
            platform: 'YAMPI',
          },
        },
        include: {
          courses: true,
        },
      })

      if (!productMapping || productMapping.courses.length === 0) {
        unmappedProducts.push(productId)
        console.log(`⚠️  Produto ${productId} (${item.name || item.title}) não está mapeado no sistema`)
        continue
      }

      // Criar matrícula para cada curso vinculado ao produto
      for (const course of productMapping.courses) {
        // Verificar se já existe matrícula ativa
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            userId: user.id,
            courseId: course.id,
            status: 'ACTIVE',
          },
        })

        if (existingEnrollment) {
          console.log(`⚠️  Matrícula já existe para ${user.email} no curso ${course.title}`)
          continue
        }

        // Criar matrícula
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

        enrollments.push({
          id: enrollment.id,
          course: course.title,
          productId,
          productName: item.name || item.title,
        })

        console.log(`✅ Matrícula criada: ${course.title} (${item.name || item.title}) para ${user.email}`)
      }
    }

    // Atualizar log do webhook
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: {
        status: enrollments.length > 0 ? 'SUCCESS' : 'FAILED',
        processedAt: new Date(),
        userId: user.id,
        errorMessage: unmappedProducts.length > 0
          ? `Produtos não mapeados: ${unmappedProducts.join(', ')}`
          : null,
      },
    })

    if (enrollments.length === 0 && unmappedProducts.length > 0) {
      await prisma.integration.update({
        where: { id: yampiIntegration.id },
        data: { errorCount: { increment: 1 } },
      })
    }

    console.log(`✅ Webhook Yampi processado!`)
    console.log(`   Usuário: ${user.email}`)
    console.log(`   Matrículas criadas: ${enrollments.length}`)
    console.log(`   Produtos não mapeados: ${unmappedProducts.length}`)

    return NextResponse.json({
      success: true,
      message: `${enrollments.length} matrícula(s) criada(s) com sucesso`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      enrollments,
      unmappedProducts: unmappedProducts.length > 0 ? unmappedProducts : undefined,
    })
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook Yampi:', error)

    return NextResponse.json(
      {
        error: 'Erro ao processar webhook',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// Endpoint de teste
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Yampi - Endpoint ativo',
    url: '/api/webhooks/yampi',
    method: 'POST',
    status: 'online',
    events: ['order_paid', 'order_canceled', 'order_refunded'],
  })
}
