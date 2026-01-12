import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Ler o corpo da requisição
    const body = await request.json()

    // Log completo do payload recebido
    console.log('=== WEBHOOK KIRVANO RECEBIDO ===')
    console.log(JSON.stringify(body, null, 2))
    console.log('=================================')

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

    // Criar log do webhook
    const webhookLog = await prisma.webhookLog.create({
      data: {
        tenantId: tenant.id,
        platform: 'KIRVANO',
        event: body.event || 'purchase',
        requestPayload: body,
        payload: body,
        status: 'PENDING',
      },
    })

    // Extrair dados do payload
    const email = body.customer?.email
    const name = body.customer?.name
    const products = body.products || []

    if (!email) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Email não encontrado no payload',
        },
      })
      return NextResponse.json(
        { error: 'Email não encontrado no payload' },
        { status: 400 }
      )
    }

    if (products.length === 0) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Nenhum produto encontrado no payload',
        },
      })
      return NextResponse.json(
        { error: 'Nenhum produto encontrado no payload' },
        { status: 400 }
      )
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: {
        email_tenantId: {
          email,
          tenantId: tenant.id,
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

    for (const product of products) {
      // Buscar mapeamento do produto
      const productMapping = await prisma.productMapping.findFirst({
        where: {
          tenantId: tenant.id,
          externalProductId: product.id,
          integration: {
            platform: 'KIRVANO',
          },
        },
        include: {
          courses: true,
        },
      })

      if (!productMapping || productMapping.courses.length === 0) {
        unmappedProducts.push(product.id)
        console.log(`⚠️  Produto ${product.id} (${product.name}) não está mapeado no sistema`)
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
          productId: product.id,
          productName: product.name,
        })

        console.log(`✅ Matrícula criada: ${course.title} (${product.name}) para ${user.email}`)
      }
    }

    // Atualizar log do webhook
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: {
        status: enrollments.length > 0 ? 'SUCCESS' : 'FAILED',
        processedAt: new Date(),
        errorMessage: unmappedProducts.length > 0
          ? `Produtos não mapeados: ${unmappedProducts.join(', ')}`
          : null,
      },
    })

    console.log(`✅ Webhook processado!`)
    console.log(`   Usuário: ${user.email}`)
    console.log(`   Matrículas criadas: ${enrollments.length}`)
    console.log(`   Produtos não mapeados: ${unmappedProducts.length}`)

    // TODO: Enviar email de boas-vindas

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
    console.error('❌ Erro ao processar webhook:', error)

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
    message: 'Webhook Kirvano - Endpoint ativo',
    url: '/api/webhooks/kirvano',
    method: 'POST',
    status: 'online',
  })
}
