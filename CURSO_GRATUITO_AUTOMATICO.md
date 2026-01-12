# Curso Gratuito Automático

Este sistema matricula automaticamente todos os usuários (novos e existentes) em um curso gratuito.

## 🎯 Como Funciona

### 1. Para Novos Usuários
Quando um novo usuário se cadastra, ele é **automaticamente matriculado** no curso gratuito.

### 2. Para Usuários Existentes
Você pode executar um script que matricula todos os usuários existentes no curso gratuito.

---

## 📋 Passo a Passo

### **Passo 1: Criar o Curso Gratuito**

1. Acesse o painel admin: `/admin/courses`
2. Clique em **"Novo Curso"**
3. Preencha os dados:
   - **Título**: `Aulas Gratuitas` (ou qualquer nome)
   - **Slug**: `aulas-gratuitas` (IMPORTANTE: use exatamente este slug)
   - Preencha os outros campos normalmente
4. Adicione módulos e aulas ao curso
5. **Publique o curso** (botão "Publicar" no canto superior)

> ⚠️ **IMPORTANTE**: O slug precisa ser exatamente `aulas-gratuitas`

### **Passo 2: Matricular Usuários Existentes**

Execute o comando:

```bash
npm run enroll:free-course
```

Este script irá:
- ✅ Buscar o curso com slug `aulas-gratuitas`
- ✅ Matricular todos os alunos que ainda não estão matriculados
- ✅ Pular alunos que já estão matriculados
- ✅ Mostrar um relatório completo

**Exemplo de saída:**
```
🚀 Iniciando matrícula automática no curso gratuito...

📋 Processando tenant: Demo
✅ Curso encontrado: Aulas Gratuitas
👥 Total de alunos: 5
  ✓ João Silva matriculado
  ✓ Maria Santos matriculado
  ✓ Pedro Oliveira matriculado

📊 Resumo para Demo:
   ✅ Novos matriculados: 3
   ℹ️  Já matriculados: 2

🎉 Processo concluído!
```

---

## 🔄 Quando Usar

### Execute o script quando:
- ✅ Criar o curso gratuito pela primeira vez
- ✅ Quiser garantir que todos os usuários têm acesso
- ✅ Depois de importar usuários de outro sistema

### Não precisa executar para:
- ❌ Novos usuários (já são matriculados automaticamente)
- ❌ Usuários que já executaram o script antes

---

## 🎬 Resultado

Depois de configurar, todos os usuários verão o curso gratuito em:
- `/dashboard` (Meus Cursos)
- `/courses` (Todos os Cursos)

E poderão assistir todas as aulas desse curso gratuitamente!

---

## 🛠️ Solução de Problemas

### "Curso não encontrado"
- Verifique se o slug do curso é exatamente `aulas-gratuitas`
- Verifique se o curso está **PUBLICADO** (status = PUBLISHED)

### "Nenhum usuário matriculado"
- Verifique se existem usuários com role = STUDENT
- Execute `npm run db:studio` para ver os dados no banco

### "Usuários não veem o curso"
- Verifique se a matrícula foi criada (enrollment com status ACTIVE)
- Faça logout e login novamente
- Limpe o cache do navegador (Ctrl+Shift+R)

---

## 📝 Notas Técnicas

**Arquivo de configuração**: `lib/actions/auth.ts`
**Script de matrícula**: `scripts/enroll-free-course.ts`
**Comando**: `npm run enroll:free-course`

O sistema busca o curso pelo slug `aulas-gratuitas`. Se quiser usar outro slug, edite:
1. `lib/actions/auth.ts` (linha ~99)
2. `scripts/enroll-free-course.ts` (linha ~20)
