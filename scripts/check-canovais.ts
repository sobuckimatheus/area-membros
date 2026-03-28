import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const email = 'canovais32@gmail.com'

  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          course: {
            select: { title: true }
          }
        }
      }
    }
  })

  if (!user) {
    console.log('❌ Usuário não encontrado no Prisma')
  } else {
    console.log('✅ Usuário encontrado no Prisma')
    console.log('Nome:', user.name)
    console.log('Email:', user.email)
    console.log('Status:', user.status)
    console.log('Supabase UID:', user.supabaseUid || '❌ AUSENTE')
    console.log('\nCursos ativos:')
    if (user.enrollments.length === 0) {
      console.log('  Nenhum curso')
    } else {
      user.enrollments.forEach(e => {
        console.log('  -', e.course.title)
      })
    }
  }

  // Verificar se existe no Supabase Auth
  console.log('\n🔍 Buscando no Supabase Auth...')
  const { data: listData } = await supabase.auth.admin.listUsers()
  const authUser = listData?.users?.find(u => u.email === email)

  if (authUser) {
    console.log('✅ Usuário encontrado no Supabase Auth')
    console.log('ID:', authUser.id)
    console.log('Email confirmado:', authUser.email_confirmed_at ? 'Sim' : 'Não')
  } else {
    console.log('❌ Usuário NÃO encontrado no Supabase Auth')
  }

  await prisma.$disconnect()
}

check()
