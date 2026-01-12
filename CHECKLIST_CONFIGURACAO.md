# ✅ Checklist de Configuração

Use este checklist para verificar se tudo está configurado corretamente.

---

## 📋 Passo 1: Supabase Storage

### Criar Bucket
- [ ] Acessei https://app.supabase.com
- [ ] Selecionei o projeto correto
- [ ] Cliquei em "Storage" no menu lateral
- [ ] Cliquei em "Create a new bucket"
- [ ] Nome do bucket: `course-images` ✓
- [ ] Marquei "Public bucket" ✓
- [ ] Cliquei em "Create bucket" ✓

### Configurar Políticas
- [ ] Cliquei em "SQL Editor" no menu lateral
- [ ] Cliquei em "New query"
- [ ] Copiei todo o conteúdo de `supabase-storage-policies.sql`
- [ ] Colei no SQL Editor
- [ ] Cliquei em "Run"
- [ ] Apareceu "Success. No rows returned" ✓

### Verificar Políticas Criadas
- [ ] Voltei para "Storage" → "course-images"
- [ ] Cliquei na aba "Policies"
- [ ] Vejo 4 políticas listadas ✓

---

## 🔑 Passo 2: Service Role Key

### Obter a Chave
- [ ] Cliquei em "Settings" no menu lateral
- [ ] Cliquei em "API"
- [ ] Encontrei a seção "Project API keys"
- [ ] Copiei a chave "service_role" (NÃO a "anon") ✓

### Adicionar no .env.local
- [ ] Abri o arquivo `.env.local` na raiz do projeto
- [ ] Adicionei a linha: `SUPABASE_SERVICE_ROLE_KEY=...`
- [ ] Colei a chave copiada
- [ ] Salvei o arquivo ✓

---

## 🚀 Passo 3: Reiniciar Servidor

- [ ] Parei o servidor (Ctrl + C no terminal)
- [ ] Executei `npm run dev` novamente
- [ ] O servidor reiniciou sem erros ✓

---

## 🧪 Passo 4: Testar Upload

### Teste Básico
- [ ] Acessei http://localhost:3000/admin/courses/new
- [ ] Rolei até "Imagem do Curso"
- [ ] Cliquei em "Fazer Upload"
- [ ] Selecionei uma imagem (JPG/PNG, menos de 5MB)
- [ ] Aguardei o upload
- [ ] O preview da imagem apareceu ✓

### Verificar no Supabase
- [ ] Voltei ao Supabase
- [ ] Storage → course-images
- [ ] Vejo a pasta com ID do tenant ✓
- [ ] Vejo a imagem que fiz upload ✓

---

## 🎯 Funcionalidades Prontas para Usar

### Cursos
- [ ] Posso criar novo curso
- [ ] Posso fazer upload de imagem do curso
- [ ] Posso editar curso existente
- [ ] Posso publicar/despublicar curso

### Módulos
- [ ] Posso adicionar módulo ao curso
- [ ] Posso editar módulo
- [ ] Posso excluir módulo

### Aulas
- [ ] Posso adicionar aula ao módulo
- [ ] Posso editar aula
- [ ] Posso adicionar URL de vídeo
- [ ] Posso publicar/despublicar aula
- [ ] Posso excluir aula
- [ ] Vejo preview do vídeo (se for YouTube/Vimeo)

### Produtos Kirvano
- [ ] Posso criar mapeamento Produto → Curso
- [ ] Posso ver lista de mapeamentos
- [ ] Webhook cria matrícula automaticamente quando produto é comprado

---

## ❌ Problemas Comuns e Soluções

### Upload retorna erro "Unauthorized"
**Solução:**
- [ ] Verifiquei se estou logado como ADMIN
- [ ] Verifiquei se o bucket está marcado como "Public"
- [ ] Executei o script SQL de políticas novamente

### Upload retorna erro genérico
**Solução:**
- [ ] Verifiquei se adicionei SUPABASE_SERVICE_ROLE_KEY no .env.local
- [ ] Reiniciei o servidor depois de adicionar a chave
- [ ] Verifiquei se a imagem tem menos de 5MB

### Não consigo criar curso
**Solução:**
- [ ] Verifiquei se estou logado
- [ ] Verifiquei se tenho role ADMIN
- [ ] Verifiquei o console do navegador (F12) para erros

### Não vejo o menu Admin
**Solução:**
- [ ] Verifiquei meu email no banco de dados
- [ ] Executei: `UPDATE users SET role = 'ADMIN' WHERE email = 'meu@email.com';`
- [ ] Fiz logout e login novamente

---

## 📞 Arquivos de Ajuda

Se precisar de ajuda detalhada, consulte:

- 📖 **GUIA_CONFIGURACAO_SUPABASE.md** - Guia passo a passo com explicações
- 📖 **SUPABASE_STORAGE_SETUP.md** - Documentação técnica completa
- 📖 **RESUMO_IMPLEMENTACAO.md** - Visão geral de tudo que foi implementado
- 💾 **supabase-storage-policies.sql** - Script SQL das políticas

---

## ✨ Tudo Pronto!

Se marcou todos os itens acima, sua plataforma está **100% funcional**! 🎉

Você já pode:
- ✅ Criar cursos com imagem
- ✅ Organizar em módulos
- ✅ Adicionar aulas com vídeos
- ✅ Publicar/despublicar conteúdo
- ✅ Mapear produtos da Kirvano
- ✅ Receber matrículas automáticas via webhook

**Próximo passo:** Criar o frontend para os alunos visualizarem os cursos! 🚀
