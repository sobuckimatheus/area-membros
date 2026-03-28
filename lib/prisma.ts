import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Middleware para garantir que usuários sejam criados no Supabase Auth
  client.$use(async (params, next) => {
    // Interceptar apenas criações de usuário
    if (params.model === 'User' && params.action === 'create') {
      const data = params.args.data

      // Se já tem supabaseUid, deixa passar (ex: já foi criado externamente)
      if (data.supabaseUid) {
        return next(params)
      }

      // Verificar se temos as credenciais do Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('⚠️  Supabase não configurado, pulando criação de auth')
        return next(params)
      }

      try {
        console.log('🔐 [Middleware] Criando usuário no Supabase Auth:', data.email)

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Gerar senha padrão se não foi fornecida
        const password = 'Acesso@2025'

        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          password,
          email_confirm: true,
          user_metadata: {
            name: data.name
          }
        })

        if (authError) {
          // Se o usuário já existe no Supabase Auth, buscar o ID dele
          if (authError.message?.includes('already registered') || authError.message?.includes('already been registered')) {
            console.log('⚠️  [Middleware] Usuário já existe no Supabase Auth, buscando...')

            const { data: listData } = await supabase.auth.admin.listUsers()
            const existingUser = listData?.users?.find(
              u => u.email?.toLowerCase() === data.email.toLowerCase()
            )

            if (existingUser) {
              console.log('✅ [Middleware] Usuário encontrado no Supabase Auth:', existingUser.id)

              // Adicionar o supabaseUid ao data antes de criar no Prisma
              params.args.data = {
                ...data,
                supabaseUid: existingUser.id
              }

              return next(params)
            }
          }

          // Se for outro erro, bloquear a criação
          console.error('❌ [Middleware] Falha ao criar usuário no Supabase Auth:', authError.message)
          throw new Error(`Não foi possível criar autenticação para ${data.email}: ${authError.message}`)
        }

        if (!authData?.user) {
          throw new Error(`Não foi possível criar autenticação para ${data.email}: Resposta vazia`)
        }

        console.log('✅ [Middleware] Usuário criado no Supabase Auth:', authData.user.id)

        // Adicionar o supabaseUid ao data antes de criar no Prisma
        params.args.data = {
          ...data,
          supabaseUid: authData.user.id
        }

        return next(params)
      } catch (error) {
        console.error('❌ [Middleware] Erro ao criar usuário:', error)
        throw error
      }
    }

    return next(params)
  })

  return client
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
