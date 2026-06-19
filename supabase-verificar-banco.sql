-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO DO BANCO DE DADOS
-- =====================================================
-- Execute este SQL para garantir que tudo está correto

-- 1. Adiciona coluna EMAIL se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Adiciona coluna PLANO se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'teste';

-- 3. Adiciona coluna DATA_EXPIRACAO se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_expiracao DATE;

-- 4. Atualiza usuários existentes que não tem plano
UPDATE users 
SET plano = 'teste', 
    data_expiracao = CURRENT_DATE + INTERVAL '7 days'
WHERE plano IS NULL;

-- 5. Verifica se as tabelas existem
SELECT 
    'users' as tabela, 
    COUNT(*) as total_registros 
FROM users
UNION ALL
SELECT 
    'clientes' as tabela, 
    COUNT(*) as total_registros 
FROM clientes
UNION ALL
SELECT 
    'parcelamentos' as tabela, 
    COUNT(*) as total_registros 
FROM parcelamentos
UNION ALL
SELECT 
    'parcelas' as tabela, 
    COUNT(*) as total_registros 
FROM parcelas;

-- =====================================================
-- PRONTO! Execute este SQL e me mostre o resultado ✅
-- =====================================================
