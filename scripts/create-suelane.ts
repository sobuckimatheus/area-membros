import prisma from '../lib/prisma'
import { createClient } from '@supabase/supabase-js'

const email = 'suelanneroque2014@hotmail.com'
const name = 'Suelane'
const tempPassword = 'Acesso@2025'
const tenantId = 'cmjp57hhf0000v62p524yzlzl'
const freeCourseId = 'cmjy59gxc0005u9q5r5pwsmhd'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError) {
    console.log('Erro Supabase:', authError.message)
    return
  }

  const user = await prisma.user.create({
    data: {
      tenantId,
      email,
      name,
      supabaseUid: authData.user.id,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })

  await prisma.enrollment.create({
    data: {
      tenantId,
      userId: user.id,
      courseId: freeCourseId,
      status: 'ACTIVE',
      progress: 0,
      enrolledAt: new Date(),
      source: 'manual',
    },
  })

  console.log('Usuario criado:', email)
  console.log('Senha:', tempPassword)
  console.log('Curso gratuito liberado')
}

main().catch(console.error).finally(() => prisma.$disconnect())
