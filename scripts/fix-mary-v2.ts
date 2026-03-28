import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMary() {
  const email = 'marygouveia@uol.com.br';

  console.log('🔍 Buscando usuária no Prisma...');
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    console.log('❌ Usuária não encontrada no Prisma');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Usuária encontrada no Prisma:', user.name);

  // Estratégia 1: Tentar enviar email de recuperação (isso vai funcionar se o usuário existir)
  console.log('\n📧 Tentando enviar email de recuperação de senha...');
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
  });

  if (resetError) {
    console.error('❌ Erro ao enviar email de recuperação:', resetError);
  } else {
    console.log('✅ Email de recuperação enviado com sucesso!');
    console.log('   Isso significa que o usuário existe no Supabase Auth');
    console.log('   Peça para a usuária verificar o email e criar uma nova senha');
  }

  // Estratégia 2: Buscar em TODOS os usuários (incluindo paginação)
  console.log('\n🔍 Buscando usuária em TODOS os registros do Supabase...');
  let page = 1;
  let found = false;
  let allUsers = [];

  while (!found) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: 1000
    });

    if (error) {
      console.error('❌ Erro ao listar usuários:', error);
      break;
    }

    allUsers.push(...data.users);

    const foundUser = data.users.find(u =>
      u.email?.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      console.log('✅ ENCONTRADA! Página:', page);
      console.log('   Supabase UID:', foundUser.id);
      console.log('   Email:', foundUser.email);
      console.log('   Criada em:', foundUser.created_at);
      console.log('   Email confirmado:', foundUser.email_confirmed_at ? 'Sim' : 'Não');

      if (user.supabaseUid !== foundUser.id) {
        console.log('\n🔗 Vinculando no Prisma...');
        await prisma.user.update({
          where: { id: user.id },
          data: { supabaseUid: foundUser.id }
        });
        console.log('✅ Vinculação feita com sucesso!');
      } else {
        console.log('✅ Já está vinculada corretamente!');
      }

      found = true;
      break;
    }

    // Se retornou menos que o perPage, não tem mais páginas
    if (data.users.length < 1000) {
      break;
    }

    page++;
    console.log(`   Verificando página ${page}...`);
  }

  if (!found) {
    console.log('❌ Não encontrada na listagem completa');
    console.log(`   Total de usuários verificados: ${allUsers.length}`);
    console.log('\n💡 O usuário existe (erro email_exists), mas não aparece na lista.');
    console.log('   Possíveis causas:');
    console.log('   - Usuário deletado (soft delete)');
    console.log('   - Problema de sincronização do Supabase');
    console.log('   - Email em formato diferente');
    console.log('\n🎯 SOLUÇÃO: Se o email de recuperação foi enviado, peça para a usuária');
    console.log('   verificar o email e criar uma nova senha. Isso deve reativar a conta.');
  }

  console.log('\n✅ Processo concluído!');
  await prisma.$disconnect();
}

fixMary().catch(console.error);
