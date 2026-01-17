import { createClient } from '@supabase/supabase-js'

async function resetUserPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas')
    return
  }

  // Criar cliente com service role para ter permissões administrativas
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('🔐 Resetando senha do usuário...\n')

    // Buscar o usuário pelo email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError)
      return
    }

    const user = users?.find(u => u.email === 'teste@teste4.com')

    if (!user) {
      console.error('❌ Usuário não encontrado')
      return
    }

    console.log('👤 Usuário encontrado:')
    console.log(`   Email: ${user.email}`)
    console.log(`   ID: ${user.id}\n`)

    // Definir nova senha
    const newPassword = 'Diana@2026'

    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (error) {
      console.error('❌ Erro ao resetar senha:', error)
      return
    }

    console.log('✅ Senha resetada com sucesso!\n')
    console.log('📋 Credenciais de login:')
    console.log('   URL: https://areamembros.dianamascarello.com.br/auth/login')
    console.log(`   Email: ${user.email}`)
    console.log(`   Nova senha: ${newPassword}`)
    console.log('\n💡 Você pode alterar esta senha depois de fazer login.')

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

resetUserPassword()
