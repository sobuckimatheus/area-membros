-- ==========================================
-- SCRIPT PARA SINCRONIZAR USUÁRIO DO SUPABASE COM O BANCO DE DADOS
-- ==========================================
--
-- INSTRUÇÕES:
-- 1. Acesse seu projeto no Supabase
-- 2. Vá em "SQL Editor"
-- 3. Cole este script
-- 4. SUBSTITUA os valores entre <> com seus dados
-- 5. Execute o script
--
-- ==========================================

-- Primeiro, criar o tenant se não existir
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
VALUES (
  'default-tenant-id',  -- ID do tenant
  'Diana Mascarello',   -- Nome do tenant
  'diana-mascarello',   -- Slug do tenant
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Agora criar/atualizar o usuário
-- SUBSTITUA:
-- - <SUPABASE_USER_ID> pelo ID do usuário no Supabase Auth
-- - <EMAIL> pelo email do usuário
-- - <NOME> pelo nome do usuário

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
  gen_random_uuid(),                    -- Gera um ID único
  '<SUPABASE_USER_ID>',                 -- SUBSTITUA pelo ID do Supabase (ex: a691e46f-6ada-44a3-b459-fabbc3f92955)
  '<EMAIL>',                            -- SUBSTITUA pelo email (ex: teste@teste4.com)
  '<NOME>',                             -- SUBSTITUA pelo nome (ex: Diana)
  'ADMIN',                              -- Role: ADMIN ou STUDENT
  'default-tenant-id',                  -- ID do tenant criado acima
  NOW(),
  NOW()
)
ON CONFLICT ("supabaseUid")
DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Verificar se foi criado
SELECT
  u.id,
  u."supabaseUid",
  u.email,
  u.name,
  u.role,
  t.name as tenant_name
FROM "User" u
JOIN "Tenant" t ON u."tenantId" = t.id
WHERE u."supabaseUid" = '<SUPABASE_USER_ID>';  -- SUBSTITUA aqui também
