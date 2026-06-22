# 🚀 Configuração do Vercel - Parcelyx

## ⚠️ AÇÃO NECESSÁRIA: Configurar Variáveis de Ambiente

O erro que você está vendo acontece porque as variáveis de ambiente não estão configuradas no Vercel.

---

## 📋 Passo a Passo

### 1. Acesse as Configurações do Projeto no Vercel

1. Vá para: https://vercel.com/
2. Selecione seu projeto **Parcelyx**
3. Clique em **Settings** (Configurações)
4. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)

### 2. Adicione as Seguintes Variáveis

Clique em **Add New** e adicione uma por uma:

#### Variável 1: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://rflwwbzqfpivezcnhbum.supabase.co`
- **Environment:** Marque todos (Production, Preview, Development)

#### Variável 2: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbHd3YnpxZnBpdmV6Y25oYnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Mjg0MzAsImV4cCI6MjA5NzMwNDQzMH0.NZyqEyACBGlB7Ckywa0Cci4d4AFq2eQdDycx1OfRoo0`
- **Environment:** Marque todos (Production, Preview, Development)

#### Variável 3: VITE_PIX_KEY
- **Name:** `VITE_PIX_KEY`
- **Value:** `f0f99a8d-bf9d-4efe-9822-1b2f6655d908`
- **Environment:** Marque todos (Production, Preview, Development)

#### Variável 4: VITE_PIX_NAME
- **Name:** `VITE_PIX_NAME`
- **Value:** `Wallace Santos Dias do Nascimento`
- **Environment:** Marque todos (Production, Preview, Development)

#### Variável 5: VITE_PIX_BANK
- **Name:** `VITE_PIX_BANK`
- **Value:** `Santander`
- **Environment:** Marque todos (Production, Preview, Development)

### 3. Redeploy do Projeto

Após adicionar todas as variáveis:

1. Vá para a aba **Deployments**
2. Clique nos três pontos do último deploy
3. Clique em **Redeploy**
4. Confirme o redeploy

**OU simplesmente faça um novo push no Git que o Vercel vai fazer deploy automático.**

---

## ✅ Verificação

Após o redeploy:

1. Acesse seu site: https://parcelyx.vercel.app
2. Abra o Console do navegador (F12)
3. Não deve mais aparecer o erro de credenciais não configuradas
4. O sistema deve funcionar normalmente

---

## 🔒 Segurança

**IMPORTANTE:** Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore` para proteger suas credenciais.

As variáveis de ambiente no Vercel são seguras e não ficam expostas no código-fonte público.

---

## 📞 Precisa de Ajuda?

Se após configurar ainda houver problemas:

1. Verifique se todas as 5 variáveis foram adicionadas corretamente
2. Confirme que marcou todos os ambientes (Production, Preview, Development)
3. Certifique-se de ter feito o redeploy após adicionar as variáveis
4. Limpe o cache do navegador (Ctrl + Shift + R)

---

**Última atualização:** 2026-06-19
