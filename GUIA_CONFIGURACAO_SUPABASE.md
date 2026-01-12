# 📋 Guia Passo a Passo: Configuração do Supabase Storage

Siga este guia para configurar o upload de imagens dos cursos.

---

## 🎯 Passo 1: Criar o Bucket

### 1.1 Acessar o Supabase
1. Abra o navegador e acesse: https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto da plataforma de cursos

### 1.2 Criar o Bucket
1. No menu lateral esquerdo, clique em **"Storage"**
2. Clique no botão **"Create a new bucket"** (ou "New bucket")
3. Preencha o formulário:
   - **Name:** `course-images` (exatamente assim, sem espaços)
   - **Public bucket:** ✅ **MARQUE esta opção** (importante para que as imagens sejam acessíveis)
4. Clique em **"Create bucket"**

✅ Bucket criado! Você deve ver o bucket `course-images` na lista.

---

## 🔐 Passo 2: Configurar Políticas de Acesso (RLS)

### 2.1 Acessar o SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (ou botão "+")

### 2.2 Executar o Script SQL
1. Abra o arquivo `supabase-storage-policies.sql` (está na raiz do projeto)
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione Ctrl/Cmd + Enter)

✅ Se aparecer "Success. No rows returned", está correto!

### 2.3 Verificar as Políticas
1. Volte para **"Storage"** no menu lateral
2. Clique no bucket **"course-images"**
3. Clique na aba **"Policies"**
4. Você deve ver 4 políticas criadas:
   - ✅ Allow admins to upload course images (INSERT)
   - ✅ Public access to course images (SELECT)
   - ✅ Allow admins to update course images (UPDATE)
   - ✅ Allow admins to delete course images (DELETE)

---

## 🔑 Passo 3: Adicionar a Service Role Key

### 3.1 Obter a Service Role Key
1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Role até a seção **"Project API keys"**
4. Encontre a chave **"service_role"** (NÃO a "anon" key!)
5. Clique no ícone de **"Reveal"** ou **"Copy"** ao lado da service_role
6. Copie a chave (é uma string longa começando com "eyJ...")

⚠️ **ATENÇÃO:** Esta chave é SECRETA! Nunca compartilhe ou coloque em repositórios públicos!

### 3.2 Adicionar no Arquivo .env.local
1. Abra o arquivo `.env.local` na raiz do projeto
2. Adicione esta linha no final do arquivo:

```env
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
```

3. Substitua `sua_chave_aqui` pela chave que você copiou
4. Salve o arquivo

**Exemplo de como deve ficar:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://...
```

---

## 🚀 Passo 4: Reiniciar o Servidor

1. No terminal onde o Next.js está rodando, pressione **Ctrl + C** para parar
2. Execute novamente:
```bash
npm run dev
```

✅ O servidor vai reiniciar com a nova variável de ambiente!

---

## ✅ Passo 5: Testar o Upload

### 5.1 Testar na Interface
1. Acesse: http://localhost:3000/admin/courses/new
2. Role até a seção **"Imagem do Curso"**
3. Clique em **"Fazer Upload"**
4. Selecione uma imagem do seu computador (JPEG, PNG, WEBP ou GIF, máximo 5MB)
5. Aguarde o upload

✅ Se aparecer o preview da imagem, funcionou!

### 5.2 Verificar no Supabase
1. Volte ao painel do Supabase
2. Vá em **"Storage"** → **"course-images"**
3. Você deve ver uma pasta com o ID do seu tenant
4. Dentro dela, a imagem que você fez upload

---

## 🎉 Configuração Completa!

Agora você pode:
- ✅ Fazer upload de imagens ao criar cursos
- ✅ Fazer upload de imagens ao editar cursos
- ✅ As imagens são salvas automaticamente no Supabase Storage
- ✅ As URLs são públicas e acessíveis para exibição

---

## ❓ Problemas Comuns

### Erro: "Unauthorized" ao fazer upload
- ✔️ Verifique se você está logado como ADMIN
- ✔️ Verifique se as políticas foram criadas corretamente
- ✔️ Verifique se o bucket está marcado como "Public"

### Erro: "Erro ao fazer upload da imagem"
- ✔️ Verifique se a SUPABASE_SERVICE_ROLE_KEY está no .env.local
- ✔️ Reinicie o servidor Next.js após adicionar a chave
- ✔️ Verifique se a imagem tem menos de 5MB

### Não vejo o bucket
- ✔️ Verifique se você está no projeto correto
- ✔️ Tente recarregar a página do Supabase

### As políticas não foram criadas
- ✔️ Verifique se copiou TODO o conteúdo do arquivo SQL
- ✔️ Verifique se a tabela "users" existe no seu banco
- ✔️ Execute as políticas uma por vez se necessário

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema:
1. Verifique o console do navegador (F12) para ver erros
2. Verifique o terminal do Next.js para ver logs
3. Revise cada passo deste guia
