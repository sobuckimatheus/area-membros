import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar Tenant de demonstração
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Diana Mascarello',
      slug: 'demo',
      plan: 'PRO',
      planStatus: 'active',
      maxStudents: 5000,
      maxCourses: 20,
      maxStorage: 2147483647, // ~2GB (max INT4)
    },
  })
  console.log('✅ Tenant criado:', tenant.name)

  // Criar configurações do tenant
  const settings = await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      siteName: 'Diana Mascarello',
      siteDescription: 'Plataforma de cursos online de alta qualidade',
      contactEmail: 'contato@dianamascarello.com',
      supportEmail: 'suporte@dianamascarello.com',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      currency: 'BRL',
      enableComments: true,
      enableCertificates: true,
      enableMarketplace: true,
    },
  })
  console.log('✅ Configurações criadas')

  // Criar customização visual
  const customization = await prisma.tenantCustomization.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
      accentColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontPrimary: 'Inter',
      fontSecondary: 'Inter',
      layoutStyle: 'modern',
      cardStyle: 'rounded',
      menuPosition: 'top',
      carouselEnabled: true,
    },
  })
  console.log('✅ Customização criada')

  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@dianamascarello.com'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@dianamascarello.com',
      name: 'Diana Mascarello',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Criar categorias
  const categoryProgramacao = await prisma.category.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'programacao'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Programação',
      slug: 'programacao',
      description: 'Cursos de desenvolvimento de software e programação',
      icon: '💻',
      color: '#3B82F6',
      order: 1,
    },
  })

  const categoryNegocios = await prisma.category.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'negocios'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Negócios',
      slug: 'negocios',
      description: 'Cursos de empreendedorismo e gestão de negócios',
      icon: '📊',
      color: '#10B981',
      order: 2,
    },
  })

  const categoryMarketing = await prisma.category.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'marketing'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Marketing',
      slug: 'marketing',
      description: 'Cursos de marketing digital e vendas',
      icon: '📢',
      color: '#F59E0B',
      order: 3,
    },
  })
  console.log('✅ Categorias criadas')

  // Criar curso de exemplo
  const course = await prisma.course.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'javascript-completo'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      title: 'JavaScript Completo - Do Zero ao Avançado',
      slug: 'javascript-completo',
      description: 'Aprenda JavaScript do zero ao avançado com projetos práticos e reais. Domine a linguagem mais popular do mundo e construa aplicações web modernas.',
      shortDesc: 'JavaScript do básico ao avançado com projetos práticos',
      categoryId: categoryProgramacao.id,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      featured: true,
      price: 297,
      compareAtPrice: 597,
      currency: 'BRL',
      badge: 'BESTSELLER',
      accessType: 'LIFETIME',
      estimatedDuration: 1200, // 20 horas
      instructorName: 'João Silva',
      instructorBio: 'Desenvolvedor Full-Stack com 10 anos de experiência',
      learningObjectives: [
        'Dominar JavaScript ES6+',
        'Criar aplicações web modernas',
        'Entender programação assíncrona',
        'Trabalhar com APIs REST',
        'Desenvolver projetos reais'
      ],
      requirements: [
        'Computador com acesso à internet',
        'Conhecimento básico de HTML/CSS',
        'Vontade de aprender'
      ],
      faq: [
        {
          question: 'Quanto tempo tenho de acesso?',
          answer: 'Acesso vitalício ao conteúdo do curso'
        },
        {
          question: 'Recebo certificado?',
          answer: 'Sim, ao completar 100% do curso você recebe um certificado digital'
        }
      ],
      order: 1,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Curso criado:', course.title)

  // Criar módulo do curso
  const module1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Introdução ao JavaScript',
      description: 'Primeiros passos com JavaScript e conceitos fundamentais',
      order: 1,
    },
  })

  // Criar aulas do módulo
  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module1.id,
        title: 'Bem-vindo ao curso',
        description: 'Apresentação do curso e como aproveitar ao máximo o conteúdo',
        type: 'VIDEO',
        videoUrl: 'https://example.com/video1.mp4',
        videoProvider: 'vimeo',
        videoDuration: 600, // 10 minutos
        isFree: true,
        order: 1,
      },
      {
        moduleId: module1.id,
        title: 'O que é JavaScript?',
        description: 'Introdução à linguagem JavaScript e suas aplicações',
        type: 'VIDEO',
        videoUrl: 'https://example.com/video2.mp4',
        videoProvider: 'vimeo',
        videoDuration: 900, // 15 minutos
        isFree: true,
        order: 2,
      },
      {
        moduleId: module1.id,
        title: 'Configurando o ambiente',
        description: 'Instalando VS Code e ferramentas necessárias',
        type: 'VIDEO',
        videoUrl: 'https://example.com/video3.mp4',
        videoProvider: 'vimeo',
        videoDuration: 1200, // 20 minutos
        order: 3,
      },
    ],
  })
  console.log('✅ Módulo e aulas criados')

  // Criar template de certificado
  const certificateTemplate = await prisma.certificateTemplate.create({
    data: {
      tenantId: tenant.id,
      name: 'Template Padrão',
      description: 'Template padrão de certificado',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h1>Certificado de Conclusão</h1>
          <p>Certificamos que</p>
          <h2>{{studentName}}</h2>
          <p>concluiu com sucesso o curso</p>
          <h3>{{courseName}}</h3>
          <p>em {{date}}</p>
          <p>Certificado Nº: {{certificateNumber}}</p>
        </div>
      `,
      signerName: 'João Silva',
      signerTitle: 'Diretor de Educação',
      showDate: true,
      showDuration: true,
      isDefault: true,
      isActive: true,
    },
  })
  console.log('✅ Template de certificado criado')

  // Criar template de email de boas-vindas
  const emailTemplate = await prisma.emailTemplate.create({
    data: {
      tenantId: tenant.id,
      key: 'welcome',
      name: 'Email de Boas-vindas',
      description: 'Email enviado quando o aluno se cadastra',
      subject: 'Bem-vindo à {{siteName}}!',
      htmlBody: `
        <h1>Olá {{name}}!</h1>
        <p>Seja muito bem-vindo à nossa plataforma!</p>
        <p>Estamos felizes em ter você conosco.</p>
        <p>Acesse sua área de membros e comece a estudar agora mesmo:</p>
        <a href="{{dashboardUrl}}">Acessar Dashboard</a>
      `,
      variables: ['name', 'siteName', 'dashboardUrl'],
      isActive: true,
    },
  })
  console.log('✅ Template de email criado')

  console.log('')
  console.log('✨ Seed concluído com sucesso!')
  console.log('')
  console.log('📊 Dados criados:')
  console.log(`   - Tenant: ${tenant.name} (slug: ${tenant.slug})`)
  console.log(`   - Admin: ${admin.email}`)
  console.log(`   - Categorias: 3`)
  console.log(`   - Cursos: 1`)
  console.log(`   - Módulos: 1`)
  console.log(`   - Aulas: 3`)
  console.log('')
  console.log('🚀 Próximos passos:')
  console.log('   1. Execute: npm run dev')
  console.log('   2. Acesse: http://localhost:3000')
  console.log('   3. Abra o Prisma Studio: npm run db:studio')
  console.log('')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
