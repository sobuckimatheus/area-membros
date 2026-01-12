# 🔐 Guia de Autenticação - Plataforma de Membros

## ✅ O que foi implementado

Sistema completo de autenticação com cadastro gratuito, login e controle de acesso aos cursos baseado em matrículas (enrollments).

---

## 📋 Páginas Criadas

### 1. **Página de Login** - `/auth/login`
- Formulário com email e senha
- Integração com Supabase Auth
- Redirect automático para dashboard após login
- Link para página de registro

**Acesse**: http://localhost:3000/auth/login

### 2. **Página de Registro** - `/auth/register`
- Formulário com nome, email e senha
- Cadastro 100% gratuito
- Criação automática de conta no Supabase Auth
- Sincronização automática com banco Prisma
- Redirect automático para dashboard após cadastro

**Acesse**: http://localhost:3000/auth/register

### 3. **Dashboard do Aluno** - `/dashboard`
- Mostra cursos que o usuário tem acesso (matrículas ativas)
- Barra de progresso por curso
- Estatísticas (cursos ativos, concluídos, progresso médio)
- Botão de logout
- **Protegido**: redireciona para login se não autenticado

**Acesse**: http://localhost:3000/dashboard

---

## 🔑 Como Funciona

### Fluxo de Cadastro:

1. **Usuário** acessa `/auth/register`
2. Preenche: nome, email e senha (mín. 6 caracteres)
3. Clica em "Criar conta gratuitamente"
4. **Sistema** cria conta no **Supabase Auth**
5. **Sistema** cria registro no **banco Prisma** (tabela `users`)
   - Vincula ao tenant `demo`
   - Define role como `STUDENT`
   - Armazena `supabaseUid` para sincronização
6. **Redirect** automático para `/dashboard`

### Fluxo de Login:

1. **Usuário** acessa `/auth/login`
2. Preenche: email e senha
3. Clica em "Entrar"
4. **Sistema** valida credenciais no **Supabase Auth**
5. **Redirect** automático para `/dashboard`

### Controle de Acesso aos Cursos:

- **Cursos são bloqueados** por padrão
- **Acesso liberado** apenas se o usuário tiver uma **matrícula ativa** (tabela `enrollments`)
- **Matrículas são criadas via**:
  - ✅ **Webhook** quando o usuário paga por um curso (próxima implementação)
  - ✅ **Manualmente** pelo admin via Prisma Studio
  - ✅ **Automaticamente** via integração com plataformas de pagamento

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`:
```prisma
- id (ID único)
- tenantId (vínculo com tenant/escola)
- email (email do usuário)
- name (nome completo)
- supabaseUid (ID do Supabase Auth - para sincronização)
- role (STUDENT, ADMIN, INSTRUCTOR, etc)
- status (ACTIVE, INACTIVE, SUSPENDED)
```

### Tabela `enrollments`:
```prisma
- id (ID único)
- userId (qual usuário)
- courseId (qual curso)
- status (ACTIVE, EXPIRED, REVOKED, SUSPENDED)
- progress (0-100% - percentual de conclusão)
- enrolledAt (data de matrícula)
- expiresAt (data de expiração - se aplicável)
- source (webhook, manual, purchase)
```

---

## 🧪 Como Testar

### Opção 1: Criar um novo usuário

1. Acesse: http://localhost:3000/auth/register
2. Preencha:
   - Nome: `João Silva`
   - Email: `joao@teste.com`
   - Senha: `123456`
3. Clique em "Criar conta gratuitamente"
4. Você será redirecionado para `/dashboard`
5. **Verá**: "Nenhum curso encontrado" (pois não tem matrículas ainda)

### Opção 2: Adicionar matrícula manualmente

1. Abra o Prisma Studio: `npm run db:studio`
2. Vá na tabela **users** e copie o `id` do usuário criado
3. Vá na tabela **courses** e copie o `id` do curso "JavaScript Completo"
4. Vá na tabela **enrollments** e clique em "Add record"
5. Preencha:
   - `tenantId`: copie da tabela `tenants` (tenant demo)
   - `userId`: ID do usuário
   - `courseId`: ID do curso
   - `status`: ACTIVE
   - `progress`: 0
6. Salve e recarregue `/dashboard`
7. **Verá**: O curso aparece na listagem!

---

## 🔗 Integração com Webhooks (Próximo Passo)

Quando um usuário **comprar um curso** em uma plataforma externa (Hotmart, Eduzz, etc):

1. Plataforma envia **webhook** para a aplicação
2. Sistema verifica o **produto** comprado via `ProductMapping`
3. Sistema busca ou cria o **usuário** no banco (pelo email)
4. Sistema cria uma **matrícula** (`Enrollment`) vinculando usuário ao curso
5. Usuário recebe **email de boas-vindas** (próxima implementação)
6. Ao fazer login, o curso estará **liberado** no dashboard

---

## 📁 Arquivos Criados

### Componentes UI:
- `components/ui/input.tsx` - Campo de texto
- `components/ui/label.tsx` - Label de formulário
- `components/ui/card.tsx` - Card container

### Páginas:
- `app/auth/login/page.tsx` - Página de login
- `app/auth/register/page.tsx` - Página de registro
- `app/dashboard/page.tsx` - Dashboard do aluno

### Lógica de Autenticação:
- `lib/actions/auth.ts` - Server actions (login, signup, signout, getCurrentUser)
- `hooks/useAuth.ts` - Hook React para gerenciar estado de autenticação

---

## 🎯 Funcionalidades Implementadas

✅ **Cadastro gratuito** - Qualquer pessoa pode se registrar
✅ **Login com email/senha** - Autenticação via Supabase
✅ **Sincronização Supabase ↔ Prisma** - Dados duplicados para flexibilidade
✅ **Dashboard protegido** - Redireciona para login se não autenticado
✅ **Listagem de cursos** - Mostra apenas cursos com matrícula ativa
✅ **Progresso por curso** - Barra visual de conclusão
✅ **Estatísticas** - Cursos ativos, concluídos, progresso médio
✅ **Logout** - Deslogar da aplicação

---

## 🚀 Próximas Implementações

### Sprint Atual (Webhooks):
- [ ] Criar API route `/api/webhooks/hotmart`
- [ ] Criar API route `/api/webhooks/eduzz`
- [ ] Implementar lógica de criação automática de matrícula
- [ ] Enviar email de boas-vindas ao novo aluno

### Sprint Futura (Player de Vídeo):
- [ ] Criar página de curso `/course/[slug]`
- [ ] Implementar player Video.js
- [ ] Tracking de progresso de vídeo
- [ ] Marcar aula como assistida
- [ ] Sistema de comentários

---

## 🐛 Solução de Problemas

### "Nenhum curso encontrado" no dashboard
**Causa**: O usuário não tem matrículas ativas.
**Solução**: Adicione uma matrícula manualmente via Prisma Studio (veja "Como Testar - Opção 2")

### Erro ao fazer login
**Causa**: Email ou senha incorretos.
**Solução**: Verifique as credenciais ou crie uma nova conta em `/auth/register`

### Redirecionado para login mesmo após cadastro
**Causa**: Erro na sincronização Supabase → Prisma.
**Solução**: Verifique os logs do console e a tabela `users` no Prisma Studio

---

## 📞 Comandos Úteis

```bash
# Ver usuários no banco
npm run db:studio
# Abra: http://localhost:5555 → Tabela "users"

# Ver servidor rodando
npm run dev
# Acesse: http://localhost:3000

# Testar autenticação
# 1. Registre em: http://localhost:3000/auth/register
# 2. Faça login em: http://localhost:3000/auth/login
# 3. Veja dashboard em: http://localhost:3000/dashboard
```

---

**Autenticação implementada e funcionando! 🎉**

Próximo passo: Implementar webhooks para liberação automática de cursos.
