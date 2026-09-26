-- ================================================================
-- SETUP: Foto de perfil (avatar) do usuário
-- Execute este script no SQL Editor do Supabase
-- ================================================================

-- 1. Adiciona coluna foto_url na tabela users (se não existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Cria o bucket 'avatars' para armazenar as fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Política: usuário autenticado pode fazer upload do próprio avatar
CREATE POLICY "Usuário pode fazer upload do avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 4. Política: qualquer um pode visualizar avatares (público)
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 5. Política: usuário pode atualizar/deletar o próprio avatar
CREATE POLICY "Usuário pode atualizar o avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Usuário pode deletar o avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
