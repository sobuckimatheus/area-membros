import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAllSupabaseUsers() {
  const allUsers = []
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      break
    }

    if (!data.users || data.users.length === 0) {
      break
    }

    allUsers.push(...data.users)
    
    if (data.users.length < perPage) {
      break
    }

    page++
  }

  return allUsers
}

async function main() {
  console.log('🔍 Buscando usuários sem autenticação...\n')

  const usersWithoutAuth = await prisma.user.findMany({
    where: {
      supabaseUid: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  })

  console.log(`📊 Encontrados ${usersWithoutAuth.length} usuários para corrigir\n`)

  if (usersWithoutAuth.length === 0) {
    console.log('✅ Nenhum usuário precisa de correção!')
    await prisma.$disconnect()
    return
  }

  console.log('🔍 Buscando TODOS os usuários no Supabase Auth...')
  const authUsers = await getAllSupabaseUsers()
  console.log(`📊 ${authUsers.length} usuários encontrados no Supabase Auth\n`)

  const password = 'Acesso@2025'
  let fixed = 0
  let created = 0
  let errors = 0

  for (const user of usersWithoutAuth) {
    try {
      console.log(`\n👤 Processando: ${user.email}`)

      // Normalizar email para comparação
      const normalizedEmail = user.email.toLowerCase().trim()

      // Buscar usuário no Supabase Auth
      const existingAuthUser = authUsers.find(
        u => u.email?.toLowerCase().trim() === normalizedEmail
      )

      let supabaseUid: string

      if (existingAuthUser) {
        console.log(`  ✅ Encontrado no Supabase Auth (ID: ${existingAuthUser.id})`)
        supabaseUid = existingAuthUser.id

        // Resetar senha
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          supabaseUid,
          { password }
        )

        if (updateError) {
          console.log('  ⚠️  Erro ao resetar senha:', updateError.message)
        } else {
          console.log('  ✅ Senha resetada')
        }

        fixed++
      } else {
        console.log('  ➕ NÃO encontrado, criando no Supabase Auth...')

        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password,
          email_confirm: true,
          user_metadata: { name: user.name }
        })

        if (createError || !authData?.user) {
          console.log('  ❌ Erro ao criar:', createError?.message)
          errors++
          continue
        }

        supabaseUid = authData.user.id
        console.log('  ✅ Criado no Supabase Auth')
        created++
      }

      // Atualizar no Prisma
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUid }
      })

      console.log('  ✅ Vinculado no banco de dados')

    } catch (error) {
      console.log('  ❌ Erro:', error)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMO:')
  console.log(`  ✅ Usuários vinculados (já existiam): ${fixed}`)
  console.log(`  ➕ Usuários criados: ${created}`)
  console.log(`  ❌ Erros: ${errors}`)
  console.log(`  📧 Senha padrão: ${password}`)
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main()
