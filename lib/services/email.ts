import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const BREVO_API_KEY = process.env.BREVO_API_KEY

interface WelcomeEmailParams {
  to: string
  name: string
  courseTitles: string[]
  password: string
  bcc?: string
}

async function sendViaBrevo(to: string, name: string, subject: string, html: string, text: string, bcc?: string) {
  const toList: { email: string; name: string }[] = [{ email: to, name }]
  const bccList = bcc ? [{ email: bcc }] : undefined

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Diana Mascarello', email: 'contato@dianamascarello.com.br' },
      to: toList,
      ...(bccList ? { bcc: bccList } : {}),
      subject,
      htmlContent: html,
      textContent: text,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || 'Erro ao enviar via Brevo')
  }

  return await response.json()
}

export async function sendWelcomeEmail({
  to,
  name,
  courseTitles,
  password,
  bcc,
}: WelcomeEmailParams) {
  try {
    const firstName = name.split(' ')[0]

    const coursesList = courseTitles.length > 0
      ? courseTitles.map(title => `<li style="margin: 6px 0; color: #555;">${title}</li>`).join('')
      : '<li style="margin: 6px 0; color: #555;">seu novo curso</li>'

    const coursesListText = courseTitles.length > 0
      ? courseTitles.map(title => `  - ${title}`).join('\n')
      : '  - seu novo curso'

    const subject = `${firstName}, sua conta na Área de Membros foi ativada`

    const textContent = `Olá, ${firstName}!

Sua compra foi confirmada — que alegria ter você aqui!

RECEBA A SUA ORAÇÃO:
Preencha o formulário abaixo para receber a sua oração diretamente no seu e-mail.
Não esqueça de acessar a Área de Membros — lá você encontra conteúdos exclusivos que
vão te ajudar na sua jornada espiritual e te levar para o próximo nível!

Link do formulário:
https://form.respondi.app/csO1877y

---

CURSOS LIBERADOS:
${coursesListText}

SEUS DADOS DE ACESSO:
  Site:  https://areamembros.dianamascarello.com.br
  Email: ${to}
  Senha: ${password}

Clique aqui para acessar agora:
https://areamembros.dianamascarello.com.br/auth/login

Dica: após entrar, recomendamos alterar sua senha em Configurações > Alterar Senha.

Qualquer dúvida, responda este e-mail.

Com carinho,
Diana Mascarello

---
Você está recebendo este e-mail porque realizou uma compra.
Para não receber mais, envie um e-mail para contato@dianamascarello.com.br com o assunto "Descadastrar".
`

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu acesso esta pronto</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f0eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f0eb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">

            <!-- Header -->
            <tr>
              <td style="background:#c9a96e;padding:36px 40px;text-align:center;">
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);letter-spacing:2px;text-transform:uppercase;font-weight:600;">Área de Membros</p>
                <h1 style="margin:10px 0 0 0;font-size:26px;font-weight:700;color:#ffffff;">Diana Mascarello</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 40px 32px 40px;">
                <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#2d2d2d;">Olá, ${firstName}!</p>
                <p style="margin:0 0 28px 0;font-size:15px;color:#666;">Sua compra foi confirmada — que alegria ter você aqui!</p>

                <!-- Formulário de Oração -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdf6ec;border-left:4px solid #c9a96e;border-radius:0 6px 6px 0;margin-bottom:20px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#c9a96e;text-transform:uppercase;letter-spacing:1px;">Receba a sua oração</p>
                      <p style="margin:0 0 16px 0;font-size:15px;color:#555;line-height:1.6;">
                        Preencha o formulário para receber a sua oração diretamente no seu e-mail.
                        Não esqueça de acessar a Área de Membros — lá você encontra conteúdos exclusivos
                        que vão te ajudar na sua jornada espiritual e te levar para o próximo nível!
                      </p>
                      <a href="https://form.respondi.app/csO1877y"
                         style="display:inline-block;background:#c9a96e;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:700;">
                        Preencher o Formulário
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divisor -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="border-top:1px solid #f0e8da;"></td>
                  </tr>
                </table>

                <!-- Cursos -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f4ee;border:1px solid #e8d9c4;border-radius:8px;margin-bottom:20px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#c9a96e;text-transform:uppercase;letter-spacing:1px;">Curso(s) liberado(s)</p>
                      <ul style="margin:0;padding-left:18px;">
                        ${coursesList}
                      </ul>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 14px 0;font-size:15px;color:#444;font-weight:600;">Seus dados de acesso:</p>

                <!-- Credenciais -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f4ee;border:1px solid #e8d9c4;border-radius:8px;margin-bottom:28px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding:6px 0;font-size:14px;">
                            <span style="color:#999;display:inline-block;width:55px;">Site</span>
                            <span style="color:#333;font-weight:600;">areamembros.dianamascarello.com.br</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;font-size:14px;border-top:1px solid #f0e8da;">
                            <span style="color:#999;display:inline-block;width:55px;">Email</span>
                            <span style="color:#333;font-weight:600;">${to}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;font-size:14px;border-top:1px solid #f0e8da;">
                            <span style="color:#999;display:inline-block;width:55px;">Senha</span>
                            <span style="color:#333;font-weight:700;font-family:monospace;font-size:15px;">${password}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Botao -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom:28px;">
                      <a href="https://areamembros.dianamascarello.com.br/auth/login"
                         style="display:inline-block;background:#c9a96e;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:16px;font-weight:700;">
                        Acessar Agora
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Dica -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:#fafafa;border:1px solid #efefef;border-radius:6px;padding:14px 16px;">
                      <p style="margin:0;font-size:13px;color:#888;"><strong>Dica:</strong> após o primeiro acesso, recomendamos alterar sua senha em <strong>Configurações &gt; Alterar Senha</strong>.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9f6f2;border-top:1px solid #f0ebe5;padding:20px 40px;text-align:center;">
                <p style="margin:0 0 6px 0;font-size:13px;color:#aaa;">Diana Mascarello — Todos os direitos reservados</p>
                <p style="margin:0;font-size:12px;color:#bbb;">
                  Você recebeu este e-mail porque realizou uma compra.<br>
                  <a href="mailto:contato@dianamascarello.com.br?subject=Descadastrar" style="color:#bbb;">Cancelar recebimento</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

    // Provedor principal: Brevo
    if (BREVO_API_KEY) {
      try {
        await sendViaBrevo(to, name, subject, htmlContent, textContent, bcc)
        console.log('✅ Email enviado via Brevo para:', to)
        return { success: true }
      } catch (brevoError) {
        console.warn('⚠️  Brevo falhou, tentando Resend...', brevoError)
      }
    }

    // Fallback: Resend
    if (!resend) throw new Error('Nenhum provedor de email configurado')
    const { data, error } = await resend.emails.send({
      from: 'Diana Mascarello <contato@dianamascarello.com.br>',
      to: [to],
      subject,
      headers: {
        'List-Unsubscribe': '<mailto:contato@dianamascarello.com.br?subject=Descadastrar>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      text: textContent,
      html: htmlContent,
    })

    if (error) {
      console.error('❌ Erro ao enviar email:', error)
      throw error
    }

    console.log('✅ Email enviado via Resend para:', to)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Falha ao enviar email de boas-vindas:', error)
    return { success: false, error }
  }
}
