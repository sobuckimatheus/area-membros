import { createClient } from '@supabase/supabase-js'
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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixPassword() {
  try {
    const email = 'glauciacarbonari@gmail.com'
    const correctPassword = 'Acesso@2025'

    console.log('🔍 Buscando usuário no Supabase Auth...')

    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError)
      return
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      console.error('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário encontrado')
    console.log('   UID:', user.id)

    console.log('\n🔐 Atualizando senha para a senha padrão...')

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: correctPassword }
    )

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError)
      return
    }

    console.log('✅ Senha atualizada com sucesso!')
    console.log('\n' + '='.repeat(60))
    console.log('✅ SENHA CORRIGIDA!')
    console.log('='.repeat(60))
    console.log('\n📧 Credenciais corretas:')
    console.log('Email:', email)
    console.log('Senha:', correctPassword)
    console.log('Link:', 'https://areamembros.dianamascarello.com.br/')

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

fixPassword()
