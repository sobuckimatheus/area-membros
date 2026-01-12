# 🔍 Como Encontrar o ID do Produto na Kirvano

## 📋 Método 1: Pela URL do Produto (Mais Fácil)

1. **Acesse a Kirvano:** https://kirvano.com (faça login)

2. **Vá em Produtos:**
   - Menu lateral → **Produtos** ou **Meus Produtos**

3. **Clique no produto** que deseja mapear

4. **Copie o ID da URL:**
   ```
   https://kirvano.com/produtos/[ESTE-É-O-ID]

   Exemplo:
   https://kirvano.com/produtos/caf14aec-2b24-43e5-b9e5-8a833776ae20
                                   └─────────────────────────────────┘
                                          Este é o ID do produto
   ```

5. **Cole o ID** no campo "ID do Produto na Kirvano" na sua plataforma

---

## 📋 Método 2: Nas Configurações do Produto

1. Acesse a Kirvano

2. Vá em **Produtos** → Clique no produto

3. Entre em **Configurações** ou **Detalhes**

4. Procure por:
   - "ID do Produto"
   - "Product ID"
   - "UUID"
   - Campo que mostra um código no formato: `caf14aec-2b24-43e5-b9e5-8a833776ae20`

5. Copie e cole na sua plataforma

---

## 📋 Método 3: Pelos Webhooks (Recomendado)

**Este é o método mais confiável!**

### Passo 1: Fazer uma Compra de Teste

1. Configure o webhook na Kirvano (se ainda não configurou):
   - URL: `https://seu-dominio.com/api/webhooks/kirvano`
   - Ou use ngrok para testes locais

2. **Faça uma compra de teste** do produto na Kirvano (modo sandbox)

### Passo 2: Ver o Webhook Recebido

1. Na sua plataforma, vá em: **Admin → Webhooks**

2. Você verá o webhook recebido com todos os detalhes

3. **Clique para expandir o payload** (carga útil)

4. Procure pela seção **"products":**
   ```json
   {
     "event": "purchase.approved",
     "data": {
       "products": [
         {
           "id": "caf14aec-2b24-43e5-b9e5-8a833776ae20",  ← ESTE É O ID!
           "name": "Oração Profética do Futuro Marido",
           "price": 197.00
         }
       ]
     }
   }
   ```

5. **Copie o ID** que aparece em `products[0].id`

6. Cole no mapeamento de produtos

---

## 🎯 Formato do ID

O ID do produto na Kirvano é um **UUID** (identificador único universal) no formato:

```
caf14aec-2b24-43e5-b9e5-8a833776ae20
```

**Características:**
- ✅ Tem 36 caracteres
- ✅ Contém letras (a-f) e números (0-9)
- ✅ Separado por hífens (-) em 5 grupos
- ✅ Formato: `8-4-4-4-12` caracteres

**Exemplos válidos:**
```
caf14aec-2b24-43e5-b9e5-8a833776ae20
123e4567-e89b-12d3-a456-426614174000
a1b2c3d4-e5f6-7890-1234-567890abcdef
```

**NÃO é um ID válido:**
```
❌ 12345 (muito curto)
❌ produto-oracao (nome, não ID)
❌ PRD001 (código interno)
```

---

## 🔗 Fluxo Completo

```
1. KIRVANO
   └─ Produto: "Oração Profética"
      └─ ID: caf14aec-2b24-43e5-b9e5-8a833776ae20

2. SUA PLATAFORMA
   └─ Admin → Produtos → Novo Mapeamento
      ├─ ID do Produto: caf14aec-2b24-43e5-b9e5-8a833776ae20
      └─ Cursos Vinculados: [✓] Oração Profética

3. RESULTADO
   Quando alguém comprar o produto na Kirvano:
   → Webhook enviado automaticamente
   → Sistema encontra o mapeamento
   → Aluno matriculado no(s) curso(s) vinculado(s)
```

---

## ⚠️ Problemas Comuns

### "Não encontrei o ID na URL"
**Solução:** Use o Método 3 (Webhooks). Faça uma compra de teste e veja o webhook.

### "O ID tem formato diferente"
**Solução:** Verifique se você está copiando o ID correto. Deve ser um UUID com hífens.

### "Mapeei mas não está funcionando"
**Soluções:**
1. Verifique se o ID está exatamente igual (sem espaços no início/fim)
2. Vá em Admin → Webhooks e veja se os webhooks estão chegando
3. Verifique se o webhook mostra o mesmo ID do produto
4. Confirme que o curso está vinculado ao mapeamento

### "Webhook não chega"
**Soluções:**
1. Verifique a URL do webhook na Kirvano
2. Se estiver em localhost, use ngrok
3. Verifique se a URL está correta: `/api/webhooks/kirvano`

---

## 📞 Dica Pro

**Melhor prática:**

1. Faça uma compra de teste de cada produto
2. Vá em Admin → Webhooks
3. Veja todos os IDs que chegaram
4. Crie os mapeamentos com esses IDs
5. ✅ Garantia de que está 100% correto!

---

## 📸 Onde Usar o ID

Na sua plataforma, ao criar mapeamento:

```
┌─────────────────────────────────────────────┐
│ Novo Mapeamento de Produto                 │
├─────────────────────────────────────────────┤
│                                             │
│ ID do Produto na Kirvano *                 │
│ ┌─────────────────────────────────────────┐ │
│ │ caf14aec-2b24-43e5-b9e5-8a833776ae20  │ │ ← COLE AQUI
│ └─────────────────────────────────────────┘ │
│                                             │
│ Nome do Produto (opcional)                  │
│ ┌─────────────────────────────────────────┐ │
│ │ Oração Profética                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Cursos Vinculados *                         │
│ ☑ Oração Profética do Futuro Marido        │
│ ☐ Outro Curso                               │
│                                             │
│ [Criar Mapeamento]                          │
└─────────────────────────────────────────────┘
```

---

**Pronto! Agora você sabe exatamente onde encontrar o ID do produto na Kirvano!** 🎉
