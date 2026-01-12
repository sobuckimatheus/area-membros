# ⚡ Quick Start - Plataforma de Área de Membros

Guia rápido para rodar o projeto em **5 minutos**.

## 🔥 Passo a Passo

### 1. Configure o Supabase (2 min)

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito
2. Vá em **Settings → API** e copie:
   - Project URL
   - anon/public key
3. Vá em **Settings → Database** e copie a Connection String

### 2. Configure as variáveis de ambiente (1 min)

```bash
cd /Users/macbookpro/Downloads/members-area-platform
cp .env.example .env
```

Edite o `.env` e preencha no MÍNIMO estas variáveis:

```env
# Database
DATABASE_URL="sua-connection-string-aqui"
DIRECT_URL="sua-connection-string-aqui"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"

# Auth
NEXTAUTH_SECRET="qualquer-string-aleatoria-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Instale dependências e configure o banco (2 min)

```bash
# Se ainda não instalou
npm install

# Criar tabelas no banco
npm run db:push

# Gerar Prisma Client
npm run db:generate
```

### 4. Rode o projeto

```bash
npm run dev
```

Pronto! Acesse [http://localhost:3000](http://localhost:3000) 🎉

## 🎯 Próximos Passos

### Criar um Tenant (Escola) de Teste

Você pode usar o Prisma Studio para criar dados manualmente:

```bash
npm run db:studio
```

Ou criar via código (próxima implementação).

### Testar o Sistema

1. **Home**: http://localhost:3000
2. **Dashboard** (ainda não implementado): http://localhost:3000/dashboard
3. **Prisma Studio**: http://localhost:5555

## 🐛 Problemas Comuns

### Erro de conexão com banco

- Verifique se copiou a connection string correta do Supabase
- Certifique-se de que incluiu a senha na string de conexão

### Erro "Module not found"

```bash
npm install
npm run db:generate
```

### Porta 3000 já em uso

```bash
# Rode em outra porta
PORT=3001 npm run dev
```

## 📚 Documentação Completa

- [README.md](./README.md) - Documentação completa
- [SCHEMA_DOCUMENTATION.md](./SCHEMA_DOCUMENTATION.md) - Schema do banco
- [PRD](./PRODUCT_REQUIREMENTS.md) - Requisitos do produto

## 🚀 Features Implementadas

- ✅ Next.js 15 com App Router
- ✅ TypeScript configurado
- ✅ Tailwind CSS + Shadcn/ui
- ✅ Prisma ORM com schema completo (25+ models)
- ✅ Supabase Auth configurado
- ✅ Multi-tenant architecture
- ✅ Estrutura de pastas organizada

## 🔨 Em Desenvolvimento

- [ ] Sistema de autenticação (login/registro)
- [ ] Dashboard do aluno
- [ ] Upload e gestão de cursos
- [ ] Player de vídeo
- [ ] Webhooks das plataformas
- [ ] Painel administrativo

---

Dúvidas? Consulte o [README.md](./README.md) completo!
