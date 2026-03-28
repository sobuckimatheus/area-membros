import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const supabaseUid = 'c21b1694-fec1-480d-a4ba-a084722e1ec4'
  const email = 'canovais32@gmail.com'
  const password = 'Acesso@2025'

  const { error } = await supabase.auth.admin.updateUserById(supabaseUid, {
    password,
  })

  if (error) {
    console.error('❌ Erro ao resetar senha:', error.message)
  } else {
    console.log('✅ Senha resetada com sucesso!')
    console.log('\n📧 Credenciais:')
    console.log('Email:', email)
    console.log('Senha:', password)
  }
}

main()
