-- =====================================================
-- PARCELYX - CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE
-- =====================================================

-- 1. TABELA DE USUÁRIOS (dados extras além do auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  negocio TEXT NOT NULL,
  telefone TEXT,
  cpf_cnpj TEXT,
  chave_pix TEXT,
  tipo_chave_pix TEXT DEFAULT 'E-mail',
  saldo_caixa DECIMAL(10,2) DEFAULT 0,
  plano TEXT DEFAULT 'teste',
  data_expiracao DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE CLIENTES
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

-- 3. TABELA DE PARCELAMENTOS
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

-- 4. TABELA DE PARCELAS
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

-- =====================================================
-- ÍNDICES PARA MELHORAR A PERFORMANCE
-- =====================================================

CREATE INDEX idx_clientes_user ON clientes(user_id);
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_parcelamentos_user ON parcelamentos(user_id);
CREATE INDEX idx_parcelamentos_status ON parcelamentos(status);
CREATE INDEX idx_parcelas_user ON parcelas(user_id);
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_vencimento ON parcelas(vencimento);

-- =====================================================
-- RLS (ROW LEVEL SECURITY) - SEGURANÇA DOS DADOS
-- Cada usuário só vê e edita seus próprios dados
-- =====================================================

-- Ativa RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

-- POLICIES PARA USERS
CREATE POLICY "Users podem ver próprios dados"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users podem atualizar próprios dados"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users podem inserir próprios dados"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- POLICIES PARA CLIENTES
CREATE POLICY "Users podem ver próprios clientes"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users podem inserir próprios clientes"
  ON clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users podem atualizar próprios clientes"
  ON clientes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users podem deletar próprios clientes"
  ON clientes FOR DELETE
  USING (auth.uid() = user_id);

-- POLICIES PARA PARCELAMENTOS
CREATE POLICY "Users podem ver próprios parcelamentos"
  ON parcelamentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users podem inserir próprios parcelamentos"
  ON parcelamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users podem atualizar próprios parcelamentos"
  ON parcelamentos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users podem deletar próprios parcelamentos"
  ON parcelamentos FOR DELETE
  USING (auth.uid() = user_id);

-- POLICIES PARA PARCELAS
CREATE POLICY "Users podem ver próprias parcelas"
  ON parcelas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users podem inserir próprias parcelas"
  ON parcelas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users podem atualizar próprias parcelas"
  ON parcelas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users podem deletar próprias parcelas"
  ON parcelas FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PRONTO! Banco configurado com sucesso! ✅
-- =====================================================
