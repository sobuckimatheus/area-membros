import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WelcomeEmailParams {
  to: string
  name: string
  courseTitles: string[]
  password: string
}

export async function sendWelcomeEmail({
  to,
  name,
  courseTitles,
  password,
}: WelcomeEmailParams) {
  try {
    const coursesList = courseTitles.length > 0
      ? courseTitles.map(title => `• ${title}`).join('<br/>')
      : 'seu novo curso'

    const { data, error } = await resend.emails.send({
      from: 'Área de Membros <noreply@dianamascarello.com.br>',
      to: [to],
      subject: '🎉 Seu acesso está pronto!',
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
                color: white !important;
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
              .credentials {
                background: #1a1a2e;
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .credential-row {
                display: flex;
                margin: 8px 0;
                font-size: 15px;
              }
              .credential-label {
                color: #a0aec0;
                min-width: 80px;
              }
              .credential-value {
                color: #fff;
                font-weight: 600;
                font-family: monospace;
                font-size: 16px;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Acesso Liberado!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.95;">Sua compra foi confirmada com sucesso</p>
            </div>

            <div class="content">
              <p>Olá, <strong>${name}</strong>! 👋</p>

              <p>Parabéns! Sua matrícula foi confirmada e seu acesso já está liberado.</p>

              <div class="courses">
                <strong>📚 Curso(s) liberado(s):</strong><br/>
                <div style="margin-top: 10px;">${coursesList}</div>
              </div>

              <p><strong>Seus dados de acesso:</strong></p>

              <div class="credentials">
                <div class="credential-row">
                  <span class="credential-label">🌐 Site:</span>
                  <span class="credential-value" style="margin-left: 10px;">areamembros.dianamascarello.com.br</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">📧 Email:</span>
                  <span class="credential-value" style="margin-left: 10px;">${to}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">🔑 Senha:</span>
                  <span class="credential-value" style="margin-left: 10px;">${password}</span>
                </div>
              </div>

              <p style="text-align: center;">
                <a href="https://areamembros.dianamascarello.com.br/auth/login" class="button">
                  Acessar Agora →
                </a>
              </p>

              <p style="font-size: 14px; color: #666; background: #fff3cd; padding: 12px; border-radius: 6px;">
                💡 <strong>Dica:</strong> Após entrar, recomendamos alterar sua senha em <strong>Menu → Alterar Senha</strong>.
              </p>
            </div>

            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>© ${new Date().getFullYear()} Diana Mascarello - Todos os direitos reservados</p>
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
