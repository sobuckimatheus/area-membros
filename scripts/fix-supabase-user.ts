import prisma from '../lib/prisma'
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]
const tempPassword = 'Acesso@2025'

async function main() {
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) { console.log('Usuario nao encontrado'); return }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Criar usuário no Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: user.name },
  })

  if (error) {
    console.log('Erro ao criar no Supabase:', error.message)
    return
  }

  // Vincular supabaseUid no Prisma
  await prisma.user.update({
    where: { id: user.id },
    data: { supabaseUid: data.user.id },
  })

  console.log('Conta criada e vinculada!')
  console.log('Email:', email)
  console.log('Senha:', tempPassword)
  console.log('supabaseUid:', data.user.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
