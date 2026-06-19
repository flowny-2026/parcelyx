# 🚀 Deploy do Parcelyx

## Deploy na Vercel (Frontend)

### Opção 1: Via Interface Web (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New Project"
4. Importe o repositório `flowny-2026/parcelyx`
5. Clique em "Deploy" (sem configuração adicional)
6. Aguarde o deploy completar (1-2 minutos)
7. Acesse a URL fornecida (ex: `parcelyx.vercel.app`)

### Opção 2: Via CLI
```bash
npm i -g vercel
vercel login
vercel
```

---

## Configurar Supabase (Backend)

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login/cadastro
3. Clique em "New Project"
4. Preencha:
   - **Name:** Parcelyx
   - **Database Password:** (escolha uma senha forte)
   - **Region:** South America (São Paulo)
5. Aguarde ~2 minutos para o projeto ser criado

### 2. Criar Tabelas no Banco de Dados
Execute no **SQL Editor** do Supabase:

```sql
-- Tabela de usuários (auth já gerencia, mas vamos adicionar dados extras)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  negocio TEXT NOT NULL,
  telefone TEXT,
  cpf_cnpj TEXT,
  chave_pix TEXT,
  tipo_chave_pix TEXT,
  saldo_caixa DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cpf TEXT,
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de parcelamentos
CREATE TABLE parcelamentos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  cliente_id BIGINT REFERENCES clientes(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  entrada DECIMAL(10,2) DEFAULT 0,
  parcelas INT NOT NULL,
  juros DECIMAL(5,2) DEFAULT 0,
  vencimento INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  data_criacao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de parcelas (geradas automaticamente)
CREATE TABLE parcelas (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  parcelamento_id BIGINT REFERENCES parcelamentos(id) ON DELETE CASCADE,
  cliente_id BIGINT REFERENCES clientes(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  numero INT NOT NULL,
  total_parcelas INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_pagamento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clientes_user ON clientes(user_id);
CREATE INDEX idx_parcelamentos_user ON parcelamentos(user_id);
CREATE INDEX idx_parcelas_user ON parcelas(user_id);
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_vencimento ON parcelas(vencimento);

-- RLS (Row Level Security) - Cada usuário vê apenas seus dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own clientes" ON clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clientes" ON clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clientes" ON clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clientes" ON clientes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own parcelamentos" ON parcelamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own parcelamentos" ON parcelamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own parcelamentos" ON parcelamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own parcelamentos" ON parcelamentos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own parcelas" ON parcelas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own parcelas" ON parcelas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own parcelas" ON parcelas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own parcelas" ON parcelas FOR DELETE USING (auth.uid() = user_id);
```

### 3. Configurar Autenticação
1. No Supabase, vá em **Authentication > Providers**
2. Habilite **Email** (já vem habilitado por padrão)
3. Configure o **Email Templates** (opcional):
   - Personalize os emails de confirmação
   - Defina a URL de redirect para seu domínio Vercel

### 4. Pegar as Credenciais
No Supabase, vá em **Settings > API** e copie:
- `Project URL` (ex: https://xxxxx.supabase.co)
- `anon public` key (chave pública)

---

## 🔗 Próximos Passos
Após ter as credenciais do Supabase, vamos integrar no código JavaScript para substituir o localStorage por chamadas à API real.

**Quer que eu crie o código de integração com Supabase agora?**
