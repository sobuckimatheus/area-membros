const BREVO_API_KEY = process.env.BREVO_API_KEY

// Lista do Brevo que serve de gatilho para a automação de emails.
// Ao entrar nessa lista, o contato inicia o fluxo configurado no painel do Brevo.
const BREVO_AUTOMATION_LIST_ID = parseInt(process.env.BREVO_AUTOMATION_LIST_ID || '3')

interface AddContactParams {
  email: string
  name?: string | null
  /** Atributos extras enviados ao Brevo (ex: { CURSOS: 'Sem Amarras, Coração Curado' }) */
  attributes?: Record<string, string>
}

/**
 * Adiciona (ou atualiza) o contato na lista de automação do Brevo.
 *
 * O gatilho da automação é "contato entra na lista", então a inclusão aqui
 * é o que dispara o fluxo de emails. Nunca lança erro: falha de integração
 * não pode quebrar o processamento da compra.
 */
export async function addContactToAutomationList({
  email,
  name,
  attributes = {},
}: AddContactParams): Promise<{ success: boolean; error?: string }> {
  if (!BREVO_API_KEY) {
    console.warn('⚠️  BREVO_API_KEY não configurada — automação não disparada')
    return { success: false, error: 'BREVO_API_KEY não configurada' }
  }

  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  const firstName = parts[0] || email.split('@')[0]
  const lastName = parts.slice(1).join(' ')

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        // A conta usa atributos em português (NOME/SOBRENOME).
        // Atributos inexistentes são silenciosamente ignorados pelo Brevo.
        attributes: {
          NOME: firstName,
          ...(lastName ? { SOBRENOME: lastName } : {}),
          ...attributes,
        },
        listIds: [BREVO_AUTOMATION_LIST_ID],
        // Permite reprocessar contatos já existentes (re-compras) sem erro 400
        updateEnabled: true,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const message = (err as any)?.message || `HTTP ${response.status}`
      console.error(`❌ Brevo: falha ao adicionar ${email} na lista ${BREVO_AUTOMATION_LIST_ID}: ${message}`)
      return { success: false, error: message }
    }

    console.log(`✅ Brevo: ${email} adicionado na lista ${BREVO_AUTOMATION_LIST_ID} (automação disparada)`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Brevo: erro ao adicionar contato:', error)
    return { success: false, error: error.message }
  }
}
