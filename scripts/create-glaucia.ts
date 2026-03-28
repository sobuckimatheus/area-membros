import { PrismaClient } from '@prisma/client'
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
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      return [key.trim(), value]
    })
)

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

const prisma = new PrismaClient()
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  try {
    const email = 'glauciacarbonari@gmail.com'
    const name = 'Glaucia'
    const password = Math.random().toString(36).slice(-10) + 'A1!'

    console.log('🔍 Buscando tenant...')
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
      console.error('❌ Nenhum tenant encontrado')
      return
    }
    console.log('✅ Tenant:', tenant.name)

    console.log('\n🔍 Buscando curso "Oração profética"...')
    const course = await prisma.course.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          { title: { contains: 'Oração', mode: 'insensitive' } },
          { title: { contains: 'profética', mode: 'insensitive' } },
          { title: { contains: 'oracao', mode: 'insensitive' } },
        ]
      }
    })

    if (!course) {
      console.error('❌ Curso "Oração profética" não encontrado')
      console.log('\n📚 Cursos disponíveis:')
      const allCourses = await prisma.course.findMany({
        where: { tenantId: tenant.id },
        select: { title: true, slug: true }
      })
      allCourses.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.title} (${c.slug})`)
      })
      return
    }

    console.log('✅ Curso encontrado:', course.title)

    console.log('\n👤 Criando usuário no Supabase Auth...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário no Supabase Auth:', authError)
      return
    }

    console.log('✅ Usuário criado no Supabase Auth')
    console.log('   UID:', authUser.user.id)

    console.log('\n💾 Criando usuário no banco de dados...')
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name,
        supabaseUid: authUser.user.id,
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: new Date(),
      }
    })

    console.log('✅ Usuário criado no banco de dados')
    console.log('   ID:', user.id)

    console.log('\n📚 Matriculando no curso...')
    const enrollment = await prisma.enrollment.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        courseId: course.id,
        status: 'ACTIVE',
        source: 'manual',
      }
    })

    console.log('✅ Matrícula criada!')

    console.log('\n' + '='.repeat(60))
    console.log('✅ USUÁRIO CRIADO COM SUCESSO!')
    console.log('='.repeat(60))
    console.log('\n📧 Credenciais de acesso:')
    console.log('Email:', email)
    console.log('Senha:', password)
    console.log('\n📚 Curso:', course.title)
    console.log('Status: Matrícula ATIVA')
    console.log('\n⚠️  IMPORTANTE: Salve a senha, ela não ficará armazenada!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
