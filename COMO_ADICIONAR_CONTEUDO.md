# 📖 Como Adicionar Conteúdo (Vídeos) aos Cursos

## 🎯 Estrutura do Curso

```
CURSO (ex: "Oração Profética do Futuro Marido")
│
├─ MÓDULO 1 (ex: "Introdução à Oração")
│  ├─ AULA 1.1 ← AQUI FICA O VÍDEO
│  ├─ AULA 1.2 ← AQUI FICA O VÍDEO
│  └─ AULA 1.3 ← AQUI FICA O VÍDEO
│
├─ MÓDULO 2 (ex: "Oração Profética Avançada")
│  ├─ AULA 2.1 ← AQUI FICA O VÍDEO
│  └─ AULA 2.2 ← AQUI FICA O VÍDEO
│
└─ MÓDULO 3
   └─ AULA 3.1 ← AQUI FICA O VÍDEO
```

---

## 📝 Passo a Passo Completo

### 1️⃣ Criar o Curso
1. Vá em **Admin → Cursos → Novo Curso**
2. Preencha:
   - Título
   - Descrição
   - Imagem (upload)
   - Instrutor
3. Clique em **Criar Curso**
4. ✅ Curso criado como RASCUNHO

---

### 2️⃣ Adicionar Módulo
1. **Clique no curso** que acabou de criar
2. Clique em **"Adicionar Módulo"** ou **"Adicionar Primeiro Módulo"**
3. Preencha:
   - Título do módulo (ex: "Introdução")
   - Descrição (opcional)
4. Clique em **Criar Módulo**
5. ✅ Módulo criado

---

### 3️⃣ Adicionar Aula com Vídeo (AQUI!)

Agora você precisa adicionar as AULAS dentro do módulo:

1. **Na página do curso, clique em "Editar"** no módulo que criou

   ```
   Você verá:
   ┌─────────────────────────────────┐
   │ MÓDULO 1                        │
   │ Introdução                      │
   │                        [Editar] │ ← CLIQUE AQUI
   └─────────────────────────────────┘
   ```

2. **Clique em "Adicionar Aula"** ou **"Adicionar Primeira Aula"**

3. **Preencha os dados da aula:**

   - **Título da Aula*** (obrigatório)
     - Ex: "Fundamentos da Oração Profética"

   - **Descrição Curta**
     - Ex: "Nesta aula você aprenderá os fundamentos"

   - **URL do Vídeo** ← AQUI VOCÊ COLA O LINK DO VÍDEO
     - YouTube: `https://www.youtube.com/watch?v=ABC123`
     - Vimeo: `https://vimeo.com/123456789`
     - Outro: URL direta do vídeo `.mp4`

   - **Duração** (em minutos)
     - Ex: 45

   - **Conteúdo da Aula**
     - Texto de apoio, transcrição, materiais complementares
     - Suporta Markdown

   - **☑️ Publicar aula imediatamente**
     - Marque se quiser que fique visível
     - Ou deixe desmarcado para ficar como rascunho

4. Clique em **Criar Aula**
5. ✅ Aula criada com vídeo!

---

### 4️⃣ Adicionar Mais Aulas

Repita o passo 3 para cada aula que quiser adicionar ao módulo.

Cada módulo pode ter quantas aulas você quiser!

---

### 5️⃣ Adicionar Mais Módulos

1. Volte para a página do curso
2. Clique em **"Adicionar Módulo"** novamente
3. Repita os passos 2 e 3

---

### 6️⃣ Publicar o Curso

Quando terminar de adicionar todos os módulos e aulas:

1. Volte para a página do curso
2. Clique em **"Publicar"** (botão no topo)
3. ✅ Curso fica visível para os alunos matriculados!

---

## 🎥 Onde Fica o Vídeo?

**O VÍDEO FICA NA AULA, NÃO NO MÓDULO!**

```
❌ ERRADO: Adicionar vídeo no módulo
✅ CERTO:  Adicionar vídeo na aula (dentro do módulo)
```

---

## 🔄 Fluxo Visual Completo

```
1. ADMIN → CURSOS → NOVO CURSO
   ↓
2. Preencher dados e criar curso
   ↓
3. Clicar no curso criado
   ↓
4. Adicionar Módulo → Criar
   ↓
5. Clicar em "Editar" no módulo
   ↓
6. Adicionar Aula → Preencher URL do vídeo → Criar
   ↓
7. Voltar e adicionar mais aulas
   ↓
8. Voltar ao curso e publicar
```

---

## 📌 Exemplo Prático

**Curso:** Oração Profética do Futuro Marido

**Módulo 1:** Fundamentos
- ✅ Aula 1.1: Introdução à Oração (vídeo 15min)
- ✅ Aula 1.2: Como Orar pelo Futuro (vídeo 25min)
- ✅ Aula 1.3: Declarações Proféticas (vídeo 30min)

**Módulo 2:** Prática
- ✅ Aula 2.1: Exercício Prático 1 (vídeo 20min)
- ✅ Aula 2.2: Exercício Prático 2 (vídeo 18min)

**Módulo 3:** Conclusão
- ✅ Aula 3.1: Próximos Passos (vídeo 10min)

---

## 🎬 Tipos de Vídeo Suportados

### YouTube
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
```

### Vimeo
```
https://vimeo.com/123456789
```

### URL Direta (MP4, etc)
```
https://seu-servidor.com/videos/aula1.mp4
```

---

## ❓ Dúvidas Comuns

### "Onde adiciono o vídeo?"
👉 Na **AULA**, não no módulo. Módulo é só uma pasta organizadora.

### "Não vejo opção de adicionar vídeo no módulo"
👉 Correto! Vídeo vai na aula. Edite o módulo e adicione aulas.

### "Como organizo o conteúdo?"
👉 Use módulos para organizar grupos de aulas. Ex:
- Módulo 1: Teoria → 3 aulas
- Módulo 2: Prática → 5 aulas
- Módulo 3: Avançado → 4 aulas

### "Posso ter módulo sem aula?"
👉 Sim, mas não faz sentido. Módulo sem aula fica vazio.

### "Posso adicionar arquivo PDF/material?"
👉 Por enquanto, coloque o link do arquivo no campo "Conteúdo da Aula" ou na descrição.

---

## ✅ Checklist

- [ ] Curso criado
- [ ] Módulo(s) adicionado(s) ao curso
- [ ] Para cada módulo:
  - [ ] Editei o módulo (cliquei em "Editar")
  - [ ] Adicionei aulas
  - [ ] Colei URL do vídeo em cada aula
  - [ ] Publiquei as aulas (ou deixei como rascunho)
- [ ] Publiquei o curso (botão "Publicar" no topo)

---

**Agora você pode adicionar todo o conteúdo do curso!** 🎉
