# 🎓 Plataforma de Área de Membros

Plataforma SaaS completa de área de membros para infoprodutos, com design inspirado em Netflix, multi-tenant e integração com 20+ plataformas de venda.

## 🚀 Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Banco de Dados**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend
- **Video Player**: Video.js

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- npm ou yarn

## ⚙️ Instalação

### 1. Clone ou acesse o projeto

```bash
cd /Users/macbookpro/Downloads/members-area-platform
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie um projeto
2. Copie as credenciais do projeto (URL e ANON KEY)
3. Copie o `.env.example` para `.env`:

```bash
cp .env.example .env
```

4. Preencha as variáveis de ambiente no `.env`:

```env
# Supabase Database URLs (encontre em: Settings > Database > Connection String)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Auth (encontre em: Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[GERE-UM-SECRET-ALEATÓRIO]"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configure o Banco de Dados

Execute as migrations do Prisma:

```bash
# Gerar o Prisma Client
npm run db:generate

# Criar as tabelas no banco
npm run db:push

# Ou criar uma migration
npm run db:migrate
```

### 5. (Opcional) Popule o banco com dados de exemplo

```bash
npm run db:seed
```

### 6. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
members-area-platform/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   ├── auth/                # Páginas de autenticação
│   ├── dashboard/           # Dashboard do aluno
│   ├── layout.tsx           # Layout root
│   ├── page.tsx             # Home page
│   └── globals.css          # Estilos globais
├── components/              # Componentes React
│   ├── ui/                  # Componentes UI (Shadcn)
│   ├── layout/              # Layouts e navegação
│   ├── course/              # Componentes de curso
│   └── admin/               # Componentes admin
├── lib/                     # Bibliotecas e utilitários
│   ├── prisma.ts           # Prisma Client
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Funções utilitárias
├── prisma/                  # Prisma ORM
│   └── schema.prisma       # Schema do banco de dados
├── public/                  # Arquivos estáticos
├── types/                   # TypeScript types
└── hooks/                   # React hooks customizados
```

## 🗄️ Schema do Banco de Dados

O projeto inclui um schema Prisma completo com 25+ models:

### Principais entidades:

- **Tenant**: Multi-tenancy (escolas/organizações)
- **User**: Usuários do sistema (alunos, admins, instrutores)
- **Course**: Cursos
- **Module**: Módulos do curso
- **Lesson**: Aulas (vídeo, texto, PDF, quiz, etc)
- **Enrollment**: Matrículas
- **Integration**: Integrações com plataformas (Hotmart, Eduzz, etc)
- **WebhookLog**: Logs de webhooks
- **ProductMapping**: Mapeamento produto externo → curso
- **Certificate**: Certificados digitais
- **Purchase**: Compras
- **Subscription**: Assinaturas

Para detalhes completos, veja [SCHEMA_DOCUMENTATION.md](./SCHEMA_DOCUMENTATION.md)

## 🔗 Integrações Suportadas

### Fase 1 (MVP)
- ✅ Hotmart
- ✅ Eduzz
- ✅ Monetizze

### Fase 2
- Kiwify
- Kirvano
- Braip
- Perfect Pay
- Ticto
- Greenn
- AppMax
- Yampi

### Fase 3
- Teachable
- Thinkific
- Kajabi
- Stripe
- Mercado Pago
- PayPal

## 🎨 Customização

A plataforma suporta customização completa via painel admin:

- Cores (primária, secundária, accent)
- Logo e favicon
- Tipografia (50+ fontes Google Fonts)
- Layout (moderno, minimalista, clássico)
- Modo escuro/claro
- CSS customizado

## 📊 Prisma Studio

Para visualizar e editar dados no banco:

```bash
npm run db:studio
```

Acesse [http://localhost:5555](http://localhost:5555)

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa o linter
npm run db:generate  # Gera Prisma Client
npm run db:migrate   # Cria migration
npm run db:push      # Sincroniza schema com banco (dev)
npm run db:studio    # Abre Prisma Studio
npm run db:seed      # Popula banco com dados iniciais
```

## 🔐 Segurança

- ✅ Row Level Security (RLS) no Supabase
- ✅ Autenticação via Supabase Auth
- ✅ Senhas com hash bcrypt
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ Proteção contra XSS
- ✅ HTTPS obrigatório em produção
- ✅ Rate limiting em APIs

## 📝 Roadmap

- [x] Setup inicial do projeto
- [x] Schema Prisma completo
- [x] Configuração Supabase
- [ ] Sistema de autenticação
- [ ] Dashboard do aluno
- [ ] Player de vídeo
- [ ] Sistema de comentários
- [ ] Webhooks Hotmart/Eduzz
- [ ] Painel administrativo
- [ ] Geração de certificados
- [ ] Marketplace interno
- [ ] Customização visual
- [ ] Deploy

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento.

## 📄 Licença

Todos os direitos reservados.

## 📞 Suporte

Para dúvidas ou problemas, consulte a [documentação completa](./docs/).

---

**Desenvolvido com ❤️ usando Next.js e Supabase**
