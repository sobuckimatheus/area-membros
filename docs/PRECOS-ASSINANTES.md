# Sistema de Preços para Assinantes

Sistema que oferece preços especiais para usuários com assinatura ativa da área de membros.

## Como Funciona

### 1. Verificação de Assinatura
Quando um usuário acessa as páginas de cursos, o sistema verifica automaticamente se ele possui uma assinatura ativa:

```typescript
const isSubscriber = await hasActiveSubscription(user.id)
```

A verificação considera:
- Status da assinatura: `ACTIVE`
- Data de expiração: `currentPeriodEnd >= hoje`

### 2. Exibição de Preços

#### Para Assinantes:
- Se o curso tiver `subscriberPrice` configurado:
  - Mostra o preço especial em destaque
  - Mostra o preço normal riscado
  - Exibe um badge "✨ Preço para assinantes"
  - Botão direciona para `subscriberCheckoutUrl`

#### Para Não Assinantes:
- Mostra o preço normal
- Se houver `compareAtPrice`, mostra riscado como "de"
- Botão direciona para `checkoutUrl` normal

### 3. Checkout Diferenciado

O sistema usa URLs de checkout diferentes para cada grupo:
- **Assinantes**: `subscriberCheckoutUrl` (link especial na Kirvano)
- **Não assinantes**: `checkoutUrl` (link normal)

## Configuração

### Passo 1: Criar Produtos Especiais na Kirvano

Para cada curso, você precisa criar **2 produtos** na Kirvano:

1. **Produto Normal**
   - Preço: R$ 29.90 (exemplo)
   - Link: https://pay.kirvano.com/produto-normal

2. **Produto para Assinantes**
   - Preço: R$ 19.90 (exemplo)
   - Link: https://pay.kirvano.com/produto-assinantes

### Passo 2: Configurar Preços no Banco

Execute o script para definir os preços especiais:

```bash
npx tsx scripts/set-subscriber-prices.ts
```

Antes de executar, edite o arquivo `scripts/set-subscriber-prices.ts` e configure:

```typescript
const subscriberPrices: Record<string, { subscriberPrice: number; subscriberCheckoutUrl: string }> = {
  'Nome do Curso': {
    subscriberPrice: 19.90,
    subscriberCheckoutUrl: 'https://pay.kirvano.com/SEU_LINK_AQUI',
  },
}
```

### Passo 3: Configuração Manual (Opcional)

Você também pode configurar diretamente no painel admin em **Cursos** → **Editar Curso**:

- **Preço Normal**: R$ 29.90
- **URL Checkout Normal**: Link do produto normal
- **Preço Assinante**: R$ 19.90
- **URL Checkout Assinante**: Link do produto para assinantes

## Campos no Banco de Dados

```prisma
model Course {
  // Preço normal
  price           Decimal?
  compareAtPrice  Decimal?
  checkoutUrl     String?

  // Preço para assinantes
  subscriberPrice       Decimal?
  subscriberCheckoutUrl String?
}
```

## Exemplo de Valores

| Curso | Preço Normal | Preço Assinante | Desconto |
|-------|--------------|-----------------|----------|
| Oração Profética | R$ 29,90 | R$ 19,90 | 33% |
| Sem Amarras | R$ 29,90 | R$ 19,90 | 33% |
| Coração Curado | R$ 29,90 | R$ 19,90 | 33% |
| Alma Gêmea | R$ 97,00 | R$ 67,00 | 31% |
| Criança Interior | R$ 29,90 | R$ 19,90 | 33% |
| Método Seja Vista | R$ 497,00 | R$ 397,00 | 20% |

## Páginas Atualizadas

O sistema de preços para assinantes está implementado em:
- ✅ `/courses` - Explorar Cursos
- ✅ `/dashboard` - Dashboard Principal
- ✅ `/my-courses` - Meus Cursos (se aplicável)

## Como Criar Assinaturas

Assinaturas são criadas automaticamente via webhook quando o usuário compra um plano de assinatura na Kirvano. Veja `docs/SINCRONIZACAO-COMPRAS.md` para mais detalhes.

Ou você pode criar manualmente no banco:

```typescript
await prisma.subscription.create({
  data: {
    tenantId: 'tenant-id',
    userId: 'user-id',
    planName: 'Assinatura Mensal',
    planInterval: 'monthly',
    amount: 97.00,
    status: 'ACTIVE',
    gateway: 'KIRVANO',
    gatewayId: 'sub-xxx',
    startedAt: new Date(),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
  },
})
```

## Importante

⚠️ **Lembre-se de criar produtos diferentes na Kirvano** para assinantes e não-assinantes, cada um com seu preço específico.

⚠️ **Configure os links corretos** nos campos `checkoutUrl` e `subscriberCheckoutUrl` para garantir que cada grupo seja direcionado para o produto correto.

⚠️ **Teste a experiência** tanto como assinante quanto como não-assinante para garantir que os preços e links estão corretos.
