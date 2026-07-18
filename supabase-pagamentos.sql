-- =====================================================
-- TABELA DE PAGAMENTOS - Controle de assinaturas
-- =====================================================

CREATE TABLE pagamentos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome_cliente TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  plano TEXT NOT NULL, -- 'teste' ou 'completo'
  valor DECIMAL(10,2) NOT NULL,
  metodo_pagamento TEXT DEFAULT 'pix', -- 'pix', 'boleto', 'cartao'
  status TEXT DEFAULT 'pendente', -- 'pendente', 'aprovado', 'recusado'
  comprovante_url TEXT, -- URL do comprovante se houver
  observacoes TEXT,
  data_pagamento DATE,
  data_expiracao DATE, -- quando o plano expira
  aprovado_por UUID REFERENCES auth.users(id), -- admin que aprovou
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_pagamentos_user ON pagamentos(user_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_plano ON pagamentos(plano);
CREATE INDEX idx_pagamentos_created ON pagamentos(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Users podem ver próprios pagamentos
CREATE POLICY "Users podem ver próprios pagamentos"
  ON pagamentos FOR SELECT
  USING (auth.uid() = user_id);

-- Users podem inserir próprios pagamentos (solicitar)
CREATE POLICY "Users podem inserir próprios pagamentos"
  ON pagamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Apenas admins podem atualizar pagamentos (aprovar/recusar)
-- Você precisará criar uma tabela de admins ou usar uma coluna na tabela users

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR PLANO APÓS PAGAMENTO APROVADO
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_plano_usuario()
RETURNS TRIGGER AS $$
BEGIN
  -- Se pagamento foi aprovado, atualiza o plano do usuário
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    UPDATE users
    SET 
      plano = NEW.plano,
      data_expiracao = NEW.data_expiracao,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que executa a função quando pagamento é atualizado
CREATE TRIGGER trigger_atualizar_plano
  AFTER UPDATE ON pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_plano_usuario();

-- =====================================================
-- FUNÇÃO PARA CALCULAR DATA DE EXPIRAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_data_expiracao(
  plano_tipo TEXT,
  data_inicio DATE DEFAULT CURRENT_DATE
)
RETURNS DATE AS $$
BEGIN
  CASE plano_tipo
    WHEN 'teste' THEN
      RETURN data_inicio + INTERVAL '7 days';
    WHEN 'completo' THEN
      RETURN data_inicio + INTERVAL '30 days';
    ELSE
      RETURN data_inicio + INTERVAL '7 days';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEW PARA LISTAR PAGAMENTOS PENDENTES (para admins)
-- =====================================================

CREATE OR REPLACE VIEW pagamentos_pendentes AS
SELECT 
  p.id,
  p.user_id,
  p.nome_cliente,
  p.email_cliente,
  p.telefone_cliente,
  p.plano,
  p.valor,
  p.status,
  p.comprovante_url,
  p.observacoes,
  p.created_at,
  u.negocio as nome_negocio
FROM pagamentos p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.status = 'pendente'
ORDER BY p.created_at DESC;

-- =====================================================
-- Exemplo de uso após criar pagamento:
-- =====================================================
-- INSERT INTO pagamentos (
--   user_id, 
--   nome_cliente, 
--   email_cliente, 
--   telefone_cliente,
--   plano, 
--   valor,
--   data_expiracao
-- ) VALUES (
--   auth.uid(),
--   'João Silva',
--   'joao@email.com',
--   '11999999999',
--   'completo',
--   29.00,
--   calcular_data_expiracao('completo')
-- );

-- =====================================================
-- PRONTO! Sistema de pagamentos configurado! ✅
-- =====================================================
