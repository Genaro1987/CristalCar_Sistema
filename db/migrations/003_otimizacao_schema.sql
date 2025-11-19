-- Migration 003: Otimização de Schema
-- Remove campos duplicados e otimiza estrutura para Supabase
-- Data: 2025-11-19

-- ========================================
-- PARTE 1: Consolidação da tabela adm_empresa
-- ========================================
-- Remove campos duplicados em adm_empresa
-- Mantém: cnpj (remove cpf_cnpj), website (remove site), logo_url (remove logo_path)

-- Remove colunas duplicadas
ALTER TABLE adm_empresa DROP COLUMN IF EXISTS cpf_cnpj;
ALTER TABLE adm_empresa DROP COLUMN IF EXISTS site;
ALTER TABLE adm_empresa DROP COLUMN IF EXISTS logo_path;

-- Atualiza comentários para clareza
COMMENT ON COLUMN adm_empresa.cnpj IS 'CNPJ da empresa (único)';
COMMENT ON COLUMN adm_empresa.website IS 'Website da empresa';
COMMENT ON COLUMN adm_empresa.logo_url IS 'URL do logo da empresa';

-- ========================================
-- PARTE 2: Consolidação da tabela par_parceiros
-- ========================================
-- Esta é a tabela com mais duplicações (16 campos)
-- Estratégia: manter campos consolidados e remover duplicatas

-- Remove colunas duplicadas de identificação
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS cpf;
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS cnpj;
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS rg_inscricao_estadual;

-- Remove colunas duplicadas de nome
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS nome;
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS razao_social;
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS nome_fantasia;

-- Remove colunas duplicadas de contato/endereço
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS site;

-- Remove colunas duplicadas de status
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS ativo;
ALTER TABLE par_parceiros DROP COLUMN IF EXISTS parceiro_criado;

-- Atualiza comentários para os campos mantidos
COMMENT ON COLUMN par_parceiros.cpf_cnpj IS 'CPF (se PF) ou CNPJ (se PJ) - campo único de identificação fiscal';
COMMENT ON COLUMN par_parceiros.inscricao_estadual IS 'Inscrição Estadual do parceiro';
COMMENT ON COLUMN par_parceiros.nome_completo IS 'Nome completo (PF) ou Razão Social (PJ)';
COMMENT ON COLUMN par_parceiros.website IS 'Website do parceiro';
COMMENT ON COLUMN par_parceiros.status IS 'Status do parceiro (ATIVO, INATIVO, etc)';

-- ========================================
-- PARTE 3: Consolidação de tabelas de log
-- ========================================
-- Remove tabela adm_configuracao_log (funcionalidade já em adm_telas)
DROP TABLE IF EXISTS adm_configuracao_log;

COMMENT ON TABLE adm_telas IS 'Registro de telas do sistema com configuração de logs unificada';

-- ========================================
-- PARTE 4: Otimização de índices
-- ========================================
-- Remove índices antigos de campos removidos e cria novos otimizados

-- Índices para par_parceiros
DROP INDEX IF EXISTS idx_parceiros_cpf_cnpj;
CREATE UNIQUE INDEX IF NOT EXISTS idx_parceiros_cpf_cnpj_unique
  ON par_parceiros(cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_parceiros_tipo_status
  ON par_parceiros(tipo_parceiro, status);

CREATE INDEX IF NOT EXISTS idx_parceiros_empresa_status
  ON par_parceiros(empresa_id, status);

-- Índices para adm_empresa
DROP INDEX IF EXISTS idx_adm_empresa_cnpj;
CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_empresa_cnpj_unique
  ON adm_empresa(cnpj) WHERE cnpj IS NOT NULL;

-- ========================================
-- PARTE 5: Triggers para atualização automática
-- ========================================

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica trigger nas tabelas principais
DROP TRIGGER IF EXISTS set_timestamp_adm_empresa ON adm_empresa;
CREATE TRIGGER set_timestamp_adm_empresa
  BEFORE UPDATE ON adm_empresa
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_par_parceiros ON par_parceiros;
CREATE TRIGGER set_timestamp_par_parceiros
  BEFORE UPDATE ON par_parceiros
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_adm_funcionarios ON adm_funcionarios;
CREATE TRIGGER set_timestamp_adm_funcionarios
  BEFORE UPDATE ON adm_funcionarios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_adm_produtos ON adm_produtos;
CREATE TRIGGER set_timestamp_adm_produtos
  BEFORE UPDATE ON adm_produtos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ========================================
-- PARTE 6: Views para compatibilidade (opcional)
-- ========================================
-- Cria views com nomes antigos para manter compatibilidade temporária
-- Remova estas views quando todo código for atualizado

-- View para suportar código legado que usa 'site' em vez de 'website'
CREATE OR REPLACE VIEW v_adm_empresa_compatibilidade AS
SELECT
  id,
  razao_social,
  nome_fantasia,
  cnpj,
  cnpj as cpf_cnpj, -- compatibilidade
  inscricao_estadual,
  inscricao_municipal,
  regime_tributario,
  telefone,
  celular,
  email,
  website,
  website as site, -- compatibilidade
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  logo_url,
  logo_url as logo_path, -- compatibilidade
  observacoes,
  padrao,
  criado_em,
  atualizado_em
FROM adm_empresa;

-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- Verifica se não há dados NULL nos campos críticos
DO $$
BEGIN
  -- Verifica empresas sem razão social
  IF EXISTS (SELECT 1 FROM adm_empresa WHERE razao_social IS NULL OR razao_social = '') THEN
    RAISE WARNING 'Existem empresas sem razão social!';
  END IF;

  -- Verifica parceiros sem identificação
  IF EXISTS (SELECT 1 FROM par_parceiros WHERE nome_completo IS NULL OR nome_completo = '') THEN
    RAISE WARNING 'Existem parceiros sem nome!';
  END IF;
END $$;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 concluída com sucesso!';
  RAISE NOTICE 'Campos duplicados removidos.';
  RAISE NOTICE 'Índices otimizados criados.';
  RAISE NOTICE 'Triggers de timestamp configurados.';
END $$;
