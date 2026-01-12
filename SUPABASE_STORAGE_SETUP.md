# Configuração do Supabase Storage

Para que o upload de imagens dos cursos funcione, você precisa criar um bucket no Supabase Storage.

## Passo 1: Criar o Bucket

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique em **Create a new bucket**
5. Configure o bucket:
   - **Name:** `course-images`
   - **Public bucket:** ✅ Marque esta opção (para permitir acesso público às imagens)
   - Clique em **Create bucket**

## Passo 2: Configurar Políticas de Acesso (RLS)

Após criar o bucket, você precisa configurar as políticas de acesso:

### Política 1: Upload (INSERT)
Permite que admins façam upload de imagens

```sql
-- Nome: Allow admins to upload course images
-- Allowed operation: INSERT
-- Target roles: authenticated

-- Policy:
CREATE POLICY "Allow admins to upload course images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-images' AND
  auth.uid() IN (
    SELECT supabaseUid FROM users WHERE role = 'ADMIN'
  )
);
```

### Política 2: Leitura Pública (SELECT)
Permite que qualquer pessoa visualize as imagens

```sql
-- Nome: Public access to course images
-- Allowed operation: SELECT
-- Target roles: public

-- Policy:
CREATE POLICY "Public access to course images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');
```

### Política 3: Atualização (UPDATE)
Permite que admins atualizem imagens

```sql
-- Nome: Allow admins to update course images
-- Allowed operation: UPDATE
-- Target roles: authenticated

-- Policy:
CREATE POLICY "Allow admins to update course images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-images' AND
  auth.uid() IN (
    SELECT supabaseUid FROM users WHERE role = 'ADMIN'
  )
);
```

### Política 4: Exclusão (DELETE)
Permite que admins excluam imagens

```sql
-- Nome: Allow admins to delete course images
-- Allowed operation: DELETE
-- Target roles: authenticated

-- Policy:
CREATE POLICY "Allow admins to delete course images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-images' AND
  auth.uid() IN (
    SELECT supabaseUid FROM users WHERE role = 'ADMIN'
  )
);
```

## Passo 3: Adicionar a Service Role Key

No arquivo `.env.local`, adicione a variável de ambiente para a Service Role Key:

```env
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

Você pode encontrar a Service Role Key em:
1. Painel do Supabase
2. **Settings** → **API**
3. **Project API keys** → **service_role** (secret)

⚠️ **IMPORTANTE:** A Service Role Key é uma chave secreta. NUNCA a exponha no código client-side ou em repositórios públicos.

## Passo 4: Reiniciar o Servidor

Após adicionar a variável de ambiente, reinicie o servidor Next.js:

```bash
npm run dev
```

## Testando

1. Acesse a página de criação/edição de curso
2. Clique em "Fazer Upload"
3. Selecione uma imagem (JPEG, PNG, WEBP ou GIF, máximo 5MB)
4. A imagem deve ser enviada e aparecer no preview
5. Ao salvar o curso, a URL da imagem será salva no campo `thumbnailUrl`

## Estrutura de Pastas

As imagens serão organizadas por tenant:
```
course-images/
  ├── {tenantId}/
  │   ├── {timestamp}-{random}.jpg
  │   ├── {timestamp}-{random}.png
  │   └── ...
```

Isso garante que cada tenant tenha suas próprias imagens isoladas.
