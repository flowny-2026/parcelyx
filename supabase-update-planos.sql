-- =====================================================
-- ATUALIZAÇÃO: ADICIONAR CAMPOS DE PLANO NA TABELA USERS
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para adicionar
-- os campos de controle de plano na tabela users existente

-- Adiciona coluna de plano
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'teste';

-- Adiciona coluna de data de expiração
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS data_expiracao DATE;

-- Adiciona coluna de email (duplicado do auth para facilitar queries)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Atualiza usuários existentes para ter 7 dias de teste
UPDATE users 
SET plano = 'teste', 
    data_expiracao = CURRENT_DATE + INTERVAL '7 days'
WHERE plano IS NULL;

-- Pronto! Agora a tabela users tem controle de planos ✅
