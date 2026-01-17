import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    // Configuração do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Listar todos os usuários do Supabase
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Erro ao buscar usuários do Supabase:', error)
      return
    }

    console.log('\n📋 Usuários no Supabase:')
    console.log('━'.repeat(80))

    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado no Supabase')
      return
    }

    for (const supabaseUser of users) {
      console.log(`\n👤 Email: ${supabaseUser.email}`)
      console.log(`   ID Supabase: ${supabaseUser.id}`)
      console.log(`   Criado em: ${new Date(supabaseUser.created_at).toLocaleString('pt-BR')}`)

      // Verificar se existe no banco de dados
      const dbUser = await prisma.user.findUnique({
        where: { supabaseUid: supabaseUser.id },
        include: { tenant: true }
      })

      if (dbUser) {
        console.log(`   ✅ Existe no banco de dados`)
        console.log(`   Nome: ${dbUser.name}`)
        console.log(`   Role: ${dbUser.role}`)
        console.log(`   Tenant: ${dbUser.tenant.name}`)
      } else {
        console.log(`   ❌ NÃO existe no banco de dados - PRECISA SINCRONIZAR`)
      }
    }

    console.log('\n')
    console.log('━'.repeat(80))
    console.log('\n💡 Se algum usuário estiver marcado como "NÃO existe no banco de dados",')
    console.log('   você precisa criar/sincronizar esse usuário.')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
