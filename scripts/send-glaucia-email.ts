import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { join } from 'path'

// Carregar variáveis do .env
const envPath = join(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...values] = line.split('=')
      let value = values.join('=').trim()
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      return [key.trim(), value]
    })
)

const resendApiKey = envVars.RESEND_API_KEY

const resend = new Resend(resendApiKey)

async function sendEmail() {
  try {
    const email = 'glauciacarbonari@gmail.com'
    const name = 'Glaucia'
    const password = '5ecu09ddogA1!'
    const courseName = 'Oração Profética do Futuro Marido'
    const loginUrl = 'https://escoladianamascarello.com.br/auth/login'

    console.log('📧 Enviando email para:', email)

    const { data, error } = await resend.emails.send({
      from: 'Diana Mascarello <onboarding@resend.dev>',
      to: email,
      subject: '🎉 Seu acesso ao curso foi liberado!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .credentials {
              background: white;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .credentials p {
              margin: 10px 0;
            }
            .credentials strong {
              color: #667eea;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vinda, ${name}!</h1>
              <p>Seu acesso ao curso foi liberado</p>
            </div>

            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>

              <p>Sua conta foi criada com sucesso e você já está matriculada no curso:</p>

              <h2 style="color: #667eea;">📚 ${courseName}</h2>

              <div class="credentials">
                <h3>🔐 Suas credenciais de acesso:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Senha:</strong> ${password}</p>
              </div>

              <p><strong>⚠️ IMPORTANTE:</strong> Por segurança, recomendamos que você altere sua senha após o primeiro acesso.</p>

              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Acessar Plataforma</a>
              </div>

              <p>Após fazer login, você terá acesso imediato ao curso e poderá começar seus estudos.</p>

              <p>Se tiver qualquer dúvida, estamos à disposição para ajudar!</p>

              <p>Bons estudos! 💜</p>

              <p><strong>Equipe Diana Mascarello</strong></p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} Diana Mascarello. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Erro ao enviar email:', error)
      return
    }

    console.log('✅ Email enviado com sucesso!')
    console.log('ID:', data?.id)

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

sendEmail()
