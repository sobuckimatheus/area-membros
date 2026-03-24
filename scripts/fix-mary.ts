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
  console.log('   ID:', user.id);
  console.log('   Supabase ID:', user.supabaseUid || 'Não vinculado');

  // Verificar se já existe no Supabase Auth
  console.log('\n🔍 Verificando no Supabase Auth...');

  // Buscar usuário no Supabase Auth
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Erro ao listar usuários do Supabase:', listError);
    await prisma.$disconnect();
    return;
  }

  const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    console.log('✅ Usuária existe no Supabase Auth!');
    console.log('   Supabase UID:', existingUser.id);

    if (user.supabaseUid !== existingUser.id) {
      console.log('\n🔗 Vinculando usuária no Prisma...');
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUid: existingUser.id }
      });
      console.log('✅ Vinculação feita com sucesso!');
    } else {
      console.log('✅ Já está vinculada corretamente!');
    }
  } else {
    console.log('❌ Usuária NÃO existe no Supabase Auth');
    console.log('\n🔨 Criando usuária no Supabase Auth...');

    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        full_name: user.name
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuária no Supabase:', createError);
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Usuária criada no Supabase Auth!');
    console.log('   Supabase UID:', newUser.user.id);
    console.log('   Senha temporária:', tempPassword);

    console.log('\n🔗 Vinculando no Prisma...');
    await prisma.user.update({
      where: { id: user.id },
      data: { supabaseUid: newUser.user.id }
    });

    console.log('✅ Vinculação feita com sucesso!');
    console.log('\n📧 Enviando email de redefinição de senha...');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    });

    if (resetError) {
      console.error('⚠️  Erro ao enviar email:', resetError);
      console.log('💡 Mas a usuária foi criada! Senha temporária:', tempPassword);
    } else {
      console.log('✅ Email de redefinição enviado!');
    }
  }

  console.log('\n✅ Processo concluído!');
  await prisma.$disconnect();
}

fixMary().catch(console.error);
