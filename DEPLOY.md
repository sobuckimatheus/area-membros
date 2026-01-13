# Deploy no Vercel

Este guia explica como fazer o deploy da plataforma Members Area no Vercel.

## Pré-requisitos

1. Conta no Vercel (https://vercel.com)
2. Banco de dados PostgreSQL configurado (Supabase)
3. Conta Supabase com Authentication configurado

## Passos para Deploy

### 1. Conectar o Repositório

1. Acesse https://vercel.com/new
2. Selecione o repositório: `sobuckimatheus/area-membros`
3. Clique em "Import"

### 2. Configurar Variáveis de Ambiente (⚠️ IMPORTANTE - FAÇA ANTES DO DEPLOY!)

**ATENÇÃO**: Configure TODAS as variáveis de ambiente ANTES de clicar em "Deploy", caso contrário o build falhará!

Na tela de import do Vercel, expanda a seção "Environment Variables" e adicione:

| Variável | Valor | Onde Obter |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://...` | Supabase > Settings > Database > Connection String (modo "Session pooler") |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase > Settings > API > anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase > Settings > API > service_role key ⚠️ |
| `NEXT_PUBLIC_APP_URL` | `https://seu-app.vercel.app` | URL do seu deploy (pode ajustar depois) |

**Passo a passo para obter as credenciais do Supabase:**

1. **Database URL**:
   - Acesse seu projeto no Supabase
   - Vá em `Settings` > `Database`
   - Em "Connection string", selecione o modo **"Session pooler"**
   - Copie a string (formato: `postgresql://postgres.[ref]:[password]@...`)
   - ⚠️ **Substitua `[password]` pela senha do seu banco**

2. **Supabase Keys**:
   - Vá em `Settings` > `API`
   - Copie a **URL** (Project URL)
   - Copie a **anon key** (chave pública)
   - Copie a **service_role key** (⚠️ NUNCA compartilhe esta chave!)

3. **App URL**:
   - Inicialmente use qualquer URL (ex: `https://temp.vercel.app`)
   - Após o deploy, volte em Settings > Environment Variables e atualize com a URL real

### 3. Configurações de Build

O Vercel irá detectar automaticamente as configurações do `vercel.json`:

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build e deploy (geralmente 2-5 minutos)
3. Após o deploy, seu app estará disponível em: `https://seu-app.vercel.app`

## Configurações Importantes

### Build Command

O comando de build inclui:
- `prisma generate`: Gera o Prisma Client
- `next build`: Compila a aplicação Next.js

### Variáveis de Ambiente

⚠️ **IMPORTANTE**: Nunca commite as variáveis de ambiente no repositório!

Todas as variáveis devem ser configuradas no painel do Vercel:
- Settings > Environment Variables

### Database Migrations

As migrações do Prisma precisam ser executadas manualmente:

```bash
# Executar localmente (ou via CI/CD)
npx prisma db push
```

**Ou** use o Prisma Migrate:

```bash
npx prisma migrate deploy
```

## Problemas Comuns

### Build Error: "Cannot find module '@prisma/client'"

**Solução**: Certifique-se de que `prisma generate` está no buildCommand.

### Database Connection Error

**Solução**:
1. Verifique se a DATABASE_URL está correta
2. Certifique-se de que o banco está acessível publicamente
3. Verifique as credenciais do Supabase

### "Module not found" errors

**Solução**: Limpe o cache do Vercel:
1. Vá em Settings > General
2. Clique em "Clear Build Cache"
3. Faça um novo deploy

## Deploy Automático

O Vercel faz deploy automático quando você faz push para a branch `main`:

```bash
git push origin main
```

Cada push irá:
1. Criar um preview deployment
2. Executar os testes
3. Fazer deploy em produção (se aprovado)

## Domínio Customizado

Para adicionar um domínio customizado:

1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure os DNS conforme as instruções

## Monitoramento

Acesse as seguintes áreas no painel do Vercel:

- **Deployments**: Ver histórico de deploys
- **Analytics**: Métricas de uso
- **Logs**: Logs em tempo real
- **Speed Insights**: Performance da aplicação

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Prisma: https://www.prisma.io/docs
- Documentação Supabase: https://supabase.com/docs
