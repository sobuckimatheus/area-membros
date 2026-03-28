import prisma from '../lib/prisma'
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]

async function main() {
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) { console.log('Usuario nao encontrado'); return }

  console.log('supabaseUid:', user.supabaseUid ?? 'NENHUM')
  console.log('status:', user.status)

  if (!user.supabaseUid) {
    console.log('PROBLEMA: usuario nao tem conta no Supabase Auth!')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supabase.auth.admin.getUserById(user.supabaseUid)
  if (error) {
    console.log('Erro Supabase:', error.message)
  } else {
    console.log('Supabase email:', data.user.email)
    console.log('Email confirmado:', data.user.email_confirmed_at ? 'sim' : 'nao')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
