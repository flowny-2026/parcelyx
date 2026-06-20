# 🔒 Guia de Segurança - Parcelyx

## ⚠️ IMPORTANTE: Rotação de Credenciais Necessária

**AÇÃO URGENTE REQUERIDA:**

As credenciais do Supabase e a chave PIX estavam expostas no código-fonte público. Embora tenham sido movidas para variáveis de ambiente, é **CRÍTICO** rotacionar todas as chaves:

### 1. Rotacionar Chaves do Supabase

1. Acesse: https://app.supabase.com/project/rflwwbzqfpivezcnhbum/settings/api
2. Role até "Project API keys"
3. Clique em "Reset" na chave `anon` public
4. Copie a nova chave
5. Atualize o arquivo `.env`:
   ```
   VITE_SUPABASE_ANON_KEY=nova_chave_aqui
   ```

### 2. Configurar Row Level Security (RLS)

**CRÍTICO:** Habilite RLS em todas as tabelas do Supabase:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem seus próprios dados
CREATE POLICY "Users can only see their own data"
  ON users FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can only see their own clients"
  ON clientes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own parcelamentos"
  ON parcelamentos FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own parcelas"
  ON parcelas FOR ALL
  USING (auth.uid() = user_id);
```

### 3. Verificar Chave PIX

Se a chave PIX `f0f99a8d-bf9d-4efe-9822-1b2f6655d908` ainda está ativa:
- Considere criar uma nova chave PIX exclusiva para o negócio
- Atualize no `.env`:
  ```
  VITE_PIX_KEY=nova_chave_pix_aqui
  ```

---

## 📋 Checklist de Segurança

### Configuração Inicial

- [x] Criar arquivo `.env` com credenciais
- [x] Adicionar `.env` ao `.gitignore`
- [x] Criar `.env.example` sem valores sensíveis
- [ ] Rotacionar chave Supabase
- [ ] Configurar RLS no Supabase
- [ ] Rotacionar chave PIX (se necessário)

### Deploy no Vercel

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione as variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PIX_KEY`
   - `VITE_PIX_NAME`
   - `VITE_PIX_BANK`
3. Faça redeploy do projeto

### Verificações de Segurança

- [x] Credenciais removidas do código-fonte
- [x] Bypass de autenticação admin removido
- [x] Validação de variáveis de ambiente implementada
- [ ] RLS habilitado em todas as tabelas
- [ ] Testes de segurança executados
- [ ] Logs de produção limpos

---

## 🚨 Vulnerabilidades Corrigidas

### 1. Bypass de Autenticação Admin (CRÍTICO)
**Antes:**
```javascript
if (loginEmail === 'admin@parcelyx.com') {
  navigate('/admin') // SEM SENHA!
  return
}
```

**Depois:**
```javascript
// Admin deve autenticar normalmente via Supabase
const { data, error } = await signIn(loginEmail, loginSenha)
if (error) {
  setErro('E-mail ou senha incorretos.')
  return
}
```

### 2. Credenciais Expostas (CRÍTICO)
**Antes:**
```javascript
const SUPABASE_URL = 'https://rflwwbzqfpivezcnhbum.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGci...' // Exposto
```

**Depois:**
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 3. Informações Bancárias Expostas (MÉDIO)
**Antes:**
```javascript
const pixKey = 'f0f99a8d-bf9d-4efe-9822-1b2f6655d908' // Hardcoded
```

**Depois:**
```javascript
const pixKey = import.meta.env.VITE_PIX_KEY
```

### 4. Bug na Geração de Parcelas (MÉDIO)
**Antes:**
```javascript
d.setMonth(d.getMonth() + i)  // Pode pular meses!
d.setDate(parcelamento.vencimento)
```

**Depois:**
```javascript
d.setDate(parcelamento.vencimento)  // Primeiro o dia
d.setMonth(d.getMonth() + i)        // Depois o mês
if (d.getDate() !== parcelamento.vencimento) {
  d.setDate(0) // Ajusta se necessário
}
```

---

## 🔐 Boas Práticas Implementadas

1. **Variáveis de Ambiente:** Todas as credenciais em `.env`
2. **Validação:** Verifica se variáveis estão configuradas
3. **Autenticação:** Removido bypass inseguro
4. **Separação:** `.env.example` para documentação

---

## 📞 Suporte

Se tiver dúvidas sobre segurança:
- Documentação Supabase: https://supabase.com/docs/guides/auth
- Guia de RLS: https://supabase.com/docs/guides/auth/row-level-security

---

**Última atualização:** 2026-06-19  
**Status:** Correções aplicadas - Rotação de chaves pendente
