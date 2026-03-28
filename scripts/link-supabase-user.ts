import prisma from '../lib/prisma'
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]
const tempPassword = 'Acesso@2025'

async function main() {
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) { console.log('Usuario nao encontrado no Prisma'); return }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Buscar em todas as páginas
  let page = 1
  let found = null
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !data.users.length) break
    found = data.users.find(u => u.email === email)
    if (found) break
    if (data.users.length < 1000) break
    page++
  }

  if (!found) {
    console.log('Nao encontrado no Supabase Auth - tentando criar...')
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email, password: tempPassword, email_confirm: true,
      user_metadata: { name: user.name },
    })
    if (createErr) { console.log('Erro ao criar:', createErr.message); return }
    found = created.user
    console.log('Criado no Supabase:', found.id)
  } else {
    console.log('Encontrado no Supabase:', found.id)
    await supabase.auth.admin.updateUserById(found.id, { password: tempPassword, email_confirm: true })
  }

  await prisma.user.update({ where: { id: user.id }, data: { supabaseUid: found.id } })
  console.log('Vinculado! Email:', email, '| Senha:', tempPassword)
}

main().catch(console.error).finally(() => prisma.$disconnect())
