-- ==========================================
-- SCRIPT PARA SINCRONIZAR SEU USUÁRIO
-- ==========================================
--
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gqnfleikshwijumqfnwg/editor
-- 2. Clique em "SQL Editor" no menu lateral
-- 3. Clique em "+ New query"
-- 4. Cole TODO este script
-- 5. APENAS MUDE O NOME se quiser (linha 25)
-- 6. Clique em "Run" (ou pressione Ctrl+Enter)
--
-- ==========================================

-- Criar o tenant principal
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
VALUES (
  'diana-tenant-2026',
  'Diana Mascarello',
  'diana-mascarello',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Criar/atualizar seu usuário ADMIN
INSERT INTO "User" (
  id,
  "supabaseUid",
  email,
  name,
  role,
  "tenantId",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'a691e46f-6ada-44a3-b459-fabbc3f92955',  -- Seu ID do Supabase
  'teste@teste4.com',                       -- Seu email
  'Diana Mascarello',                       -- ← MUDE AQUI se quiser outro nome
  'ADMIN',                                  -- Você será ADMIN
  'diana-tenant-2026',
  NOW(),
  NOW()
)
ON CONFLICT ("supabaseUid")
DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Mostrar o resultado
SELECT
  u.id,
  u."supabaseUid",
  u.email,
  u.name,
  u.role,
  t.name as tenant_name,
  u."createdAt"
FROM "User" u
JOIN "Tenant" t ON u."tenantId" = t.id
WHERE u."supabaseUid" = 'a691e46f-6ada-44a3-b459-fabbc3f92955';
