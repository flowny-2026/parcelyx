-- =====================================================
-- MIGRAÇÃO: Popula tabela users com usuários do auth
-- =====================================================
-- Execute este script no SQL Editor do Supabase para
-- migrar os usuários que já existem no auth.users
-- mas ainda não têm dados na tabela users

-- Insere usuários do auth.users na tabela users
-- (apenas os que ainda não existem)
INSERT INTO users (id, email, nome, negocio, telefone, plano, data_expiracao, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nome', split_part(au.email, '@', 1)) as nome,
  COALESCE(au.raw_user_meta_data->>'negocio', 'Sem negócio') as negocio,
  COALESCE(au.raw_user_meta_data->>'telefone', '') as telefone,
  'teste' as plano,
  (CURRENT_DATE + INTERVAL '7 days')::date as data_expiracao,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = au.id
);

-- Verifica quantos usuários foram migrados
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN plano = 'teste' THEN 1 END) as trial,
  COUNT(CASE WHEN data_expiracao >= CURRENT_DATE THEN 1 END) as ativos
FROM users;
