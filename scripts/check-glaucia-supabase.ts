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
      // Remover aspas se houver
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

async function checkSupabaseUser() {
  try {
    // Buscar por email
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error)
      return
    }

    const user = users.users.find(u => u.email === 'glauciacarbonari@gmail.com')

    if (!user) {
      console.log('❌ Usuário não encontrado no Supabase Auth')
      return
    }

    console.log('✅ Usuário encontrado no Supabase Auth!')
    console.log('\n📋 Dados do Supabase Auth:')
    console.log('ID (UID):', user.id)
    console.log('Email:', user.email)
    console.log('Email confirmado:', user.email_confirmed_at ? '✅ Sim' : '❌ Não')
    console.log('Criado em:', user.created_at)
    console.log('Último login:', user.last_sign_in_at || 'Nunca')
    console.log('\nMetadata do usuário:')
    console.log(JSON.stringify(user.user_metadata, null, 2))

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

checkSupabaseUser()
