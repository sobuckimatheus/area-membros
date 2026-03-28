import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

const FIXED_USERS = [
  'ana.tavaresadamo@gmail.com',
  'janaina.cavalheiro.br@gmail.com',
  'mendes.mayline@gmail.com',
  'melinarezende@yahoo.com.br'
]

async function sendAccessEmail(user: any, courses: string[]) {
  const coursesList = courses.length > 0
    ? courses.map(title => `• ${title}`).join('<br/>')
    : '• Aulas Gratuitas'

  const coursesListText = courses.length > 0
    ? courses.map(title => `  - ${title}`).join('\n')
    : '  - Aulas Gratuitas'

  try {
    const { data, error } = await resend.emails.send({
      from: 'Diana Mascarello <contato@dianamascarello.com.br>',
      to: [user.email],
      subject: `Seu acesso foi atualizado - Area de Membros`,
      text: `Ola, ${user.name}!

Seu acesso a Area de Membros foi atualizado e corrigido.

Curso(s) liberado(s):
${coursesListText}

Para acessar, entre no site abaixo com seu email e senha:

  Site:  areamembros.dianamascarello.com.br
  Login: ${user.email}
  Senha: Acesso@2025

Acesse agora: https://areamembros.dianamascarello.com.br/auth/login

Dica: apos o primeiro acesso, voce pode alterar sua senha em Menu > Alterar Senha.

Qualquer duvida, responda este email.

Diana Mascarello
`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fdf8f8;
              }
              .container {
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 12px rgba(0,0,0,0.06);
              }
              .header {
                background: #c9a96e;
                color: white;
                padding: 36px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
              }
              .header p {
                margin: 8px 0 0 0;
                opacity: 0.9;
                font-size: 15px;
              }
              .content {
                padding: 32px 30px;
              }
              .content p {
                margin: 0 0 16px 0;
                color: #555;
              }
              .button {
                display: inline-block;
                background: #c9a96e;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                margin: 8px 0 20px 0;
              }
              .courses {
                background: #fdf6ec;
                padding: 16px 20px;
                border-radius: 6px;
                margin: 16px 0;
                border-left: 4px solid #c9a96e;
              }
              .courses p {
                margin: 4px 0;
              }
              .credentials {
                background: #f9f4ee;
                border: 1px solid #e8d9c4;
                color: #333;
                padding: 20px 24px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .credential-row {
                margin: 10px 0;
                font-size: 15px;
              }
              .credential-label {
                color: #999;
                display: inline-block;
                width: 60px;
              }
              .credential-value {
                color: #333;
                font-weight: 700;
                font-family: monospace;
                font-size: 15px;
              }
              .tip {
                font-size: 13px;
                color: #888;
                background: #fafafa;
                border: 1px solid #efefef;
                padding: 12px 16px;
                border-radius: 6px;
                margin-top: 20px;
              }
              .footer {
                text-align: center;
                color: #bbb;
                font-size: 12px;
                padding: 20px 30px;
                border-top: 1px solid #f0ebe5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Acesso Atualizado</h1>
                <p>Seu acesso foi corrigido e ja esta disponivel</p>
              </div>

              <div class="content">
                <p>Ola, <strong>${user.name}</strong>!</p>

                <p>Seu acesso a Area de Membros foi atualizado e corrigido. Agora voce ja pode entrar normalmente.</p>

                <div class="courses">
                  <strong>Curso(s) liberado(s):</strong>
                  <div style="margin-top: 8px;">${coursesList}</div>
                </div>

                <p>Para entrar na area de membros, use as informacoes abaixo:</p>

                <div class="credentials">
                  <div class="credential-row">
                    <span class="credential-label">Site</span>
                    <span class="credential-value">areamembros.dianamascarello.com.br</span>
                  </div>
                  <div class="credential-row">
                    <span class="credential-label">Login</span>
                    <span class="credential-value">${user.email}</span>
                  </div>
                  <div class="credential-row">
                    <span class="credential-label">Senha</span>
                    <span class="credential-value">Acesso@2025</span>
                  </div>
                </div>

                <p style="text-align: center;">
                  <a href="https://areamembros.dianamascarello.com.br/auth/login" class="button">
                    Acessar Agora
                  </a>
                </p>

                <div class="tip">
                  Dica: apos o primeiro acesso, voce pode alterar sua senha em Menu &gt; Alterar Senha.
                </div>
              </div>

              <div class="footer">
                <p>Diana Mascarello - Todos os direitos reservados</p>
                <p>Qualquer duvida, responda este email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error(`  ❌ Erro ao enviar email:`, error)
      return false
    }

    console.log(`  ✅ Email enviado com sucesso`)
    return true
  } catch (error) {
    console.error(`  ❌ Falha ao enviar email:`, error)
    return false
  }
}

async function main() {
  console.log('📧 Enviando emails para usuários com acesso corrigido...\n')

  let sent = 0
  let errors = 0

  for (const email of FIXED_USERS) {
    console.log(`\n👤 ${email}`)

    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            course: {
              select: { title: true }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('  ⚠️  Usuário não encontrado')
      errors++
      continue
    }

    const courses = user.enrollments.map(e => e.course.title)
    const success = await sendAccessEmail(user, courses)

    if (success) {
      sent++
    } else {
      errors++
    }

    // Aguardar 1 segundo entre emails para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMO:')
  console.log(`  ✅ Emails enviados: ${sent}`)
  console.log(`  ❌ Erros: ${errors}`)
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main()
