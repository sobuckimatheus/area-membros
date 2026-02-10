import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WelcomeEmailParams {
  to: string
  name: string
  courseTitles: string[]
  resetPasswordUrl: string
}

export async function sendWelcomeEmail({
  to,
  name,
  courseTitles,
  resetPasswordUrl,
}: WelcomeEmailParams) {
  try {
    const coursesList = courseTitles.length > 0
      ? courseTitles.map(title => `• ${title}`).join('\n')
      : 'seu novo curso'

    const { data, error } = await resend.emails.send({
      from: 'Área de Membros <noreply@dianamascarello.com.br>',
      to: [to],
      subject: '🎉 Bem-vindo! Seu acesso está pronto',
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
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: #ef4444;
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .courses {
                background: white;
                padding: 15px;
                border-radius: 6px;
                margin: 15px 0;
                border-left: 4px solid #667eea;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
              .credentials {
                background: white;
                padding: 15px;
                border-radius: 6px;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.95;">Sua compra foi confirmada com sucesso</p>
            </div>

            <div class="content">
              <p>Olá, <strong>${name}</strong>!</p>

              <p>Parabéns! Sua matrícula foi confirmada e seu acesso já está liberado.</p>

              <div class="courses">
                <strong>📚 Curso(s) liberado(s):</strong><br/>
                <div style="margin-top: 10px; white-space: pre-line;">${coursesList}</div>
              </div>

              <div class="credentials">
                <strong>🔐 Seus dados de acesso:</strong><br/>
                <strong>Email:</strong> ${to}<br/>
                <strong>Senha:</strong> Você precisa criar sua senha clicando no botão abaixo
              </div>

              <p style="text-align: center;">
                <a href="${resetPasswordUrl}" class="button">
                  Criar Minha Senha e Acessar
                </a>
              </p>

              <p style="font-size: 14px; color: #666;">
                Após criar sua senha, acesse a plataforma em:<br/>
                <a href="https://areamembros.dianamascarello.com.br" style="color: #667eea;">
                  https://areamembros.dianamascarello.com.br
                </a>
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

              <p style="font-size: 14px; color: #666;">
                <strong>💡 Dica:</strong> Salve este email! Ele contém informações importantes sobre seu acesso.
              </p>
            </div>

            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>© ${new Date().getFullYear()} Área de Membros - Todos os direitos reservados</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Erro ao enviar email:', error)
      throw error
    }

    console.log('✅ Email de boas-vindas enviado para:', to)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Falha ao enviar email de boas-vindas:', error)
    return { success: false, error }
  }
}
