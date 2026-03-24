import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setPassword() {
  const email = 'marygouveia@uol.com.br';
  const supabaseUid = 'a3370d13-5f3a-4486-9402-f8220f76066d';
  const newPassword = 'Acesso@2025';

  console.log('🔑 Definindo senha para:', email);

  const { data, error } = await supabase.auth.admin.updateUserById(
    supabaseUid,
    { password: newPassword }
  );

  if (error) {
    console.error('❌ Erro ao definir senha:', error);
    return;
  }

  console.log('✅ Senha definida com sucesso!');
  console.log('\n📧 Email:', email);
  console.log('🔑 Senha:', newPassword);
  console.log('\n💡 A usuária já pode fazer login com essas credenciais');
}

setPassword().catch(console.error);
