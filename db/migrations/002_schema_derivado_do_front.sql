-- Schema derivado do uso atual do frontend e APIs (Supabase/Postgres)
-- Estrutura focada em cadastros administrativos, financeiros, integrações e controles auxiliares

-- =============================
-- Tabelas administrativas
-- =============================
CREATE TABLE IF NOT EXISTS adm_empresa (
  id BIGSERIAL PRIMARY KEY,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  cnpj VARCHAR(18),
  cpf_cnpj VARCHAR(18),
  inscricao_estadual VARCHAR(20),
  inscricao_municipal VARCHAR(20),
  regime_tributario VARCHAR(50),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),
  site VARCHAR(200),
  endereco VARCHAR(200),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  logo_path VARCHAR(500),
  logo_url VARCHAR(500),
  observacoes TEXT,
  padrao BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_empresa_cnpj ON adm_empresa(cnpj);
CREATE INDEX IF NOT EXISTS idx_adm_empresa_padrao ON adm_empresa(padrao);

-- Telas e configurações de log unificadas
CREATE TABLE IF NOT EXISTS adm_telas (
  id BIGSERIAL PRIMARY KEY,
  codigo_tela VARCHAR(50) UNIQUE NOT NULL,
  nome_tela VARCHAR(200) NOT NULL,
  descricao TEXT,
  modulo VARCHAR(50) NOT NULL,
  caminho_tela VARCHAR(500),
  icone VARCHAR(50),
  ordem_exibicao INTEGER DEFAULT 999,
  exibir_menu BOOLEAN DEFAULT TRUE,
  exibir_favoritos BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  registrar_log BOOLEAN DEFAULT TRUE,
  registrar_visualizacao BOOLEAN DEFAULT FALSE,
  registrar_inclusao BOOLEAN DEFAULT TRUE,
  registrar_edicao BOOLEAN DEFAULT TRUE,
  registrar_exclusao BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adm_telas_modulo ON adm_telas(modulo);
CREATE INDEX IF NOT EXISTS idx_adm_telas_ordem ON adm_telas(ordem_exibicao);

-- Ações registradas no sistema
CREATE TABLE IF NOT EXISTS adm_log_acoes (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT,
  modulo VARCHAR(50),
  tela VARCHAR(200),
  acao VARCHAR(50),
  registro_id BIGINT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_log_modulo_tela ON adm_log_acoes(modulo, tela);
CREATE INDEX IF NOT EXISTS idx_log_registro ON adm_log_acoes(registro_id);

-- Configuração de log legada (ainda lida pelas rotas)
CREATE TABLE IF NOT EXISTS adm_configuracao_log (
  id BIGSERIAL PRIMARY KEY,
  modulo VARCHAR(50) NOT NULL,
  tela VARCHAR(200) NOT NULL,
  registrar_log BOOLEAN DEFAULT TRUE,
  registrar_visualizacao BOOLEAN DEFAULT FALSE,
  registrar_inclusao BOOLEAN DEFAULT TRUE,
  registrar_edicao BOOLEAN DEFAULT TRUE,
  registrar_exclusao BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conf_log_modulo_tela ON adm_configuracao_log(modulo, tela);

-- Departamentos vinculados à empresa e responsáveis
CREATE TABLE IF NOT EXISTS adm_departamentos (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  responsavel_id BIGINT,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  status VARCHAR(20) DEFAULT 'ATIVO',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_departamentos_empresa ON adm_departamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_departamentos_status ON adm_departamentos(status);

-- Funcionários com vínculo opcional ao departamento
CREATE TABLE IF NOT EXISTS adm_funcionarios (
  id BIGSERIAL PRIMARY KEY,
  codigo_unico VARCHAR(50),
  nome_completo VARCHAR(200) NOT NULL,
  cpf VARCHAR(20),
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(100),
  endereco VARCHAR(200),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  cargo VARCHAR(100),
  departamento_id BIGINT REFERENCES adm_departamentos(id),
  data_admissao DATE,
  data_demissao DATE,
  salario NUMERIC(15,2),
  status VARCHAR(20) DEFAULT 'ATIVO',
  observacoes TEXT,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON adm_funcionarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_departamento ON adm_funcionarios(departamento_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_status ON adm_funcionarios(status);

-- Produtos e serviços controlados
CREATE TABLE IF NOT EXISTS adm_produtos (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  unidade_medida VARCHAR(20),
  local_estoque VARCHAR(100),
  tipo VARCHAR(20) DEFAULT 'PRODUTO',
  finalidade VARCHAR(20) DEFAULT 'AMBOS',
  foto_path VARCHAR(500),
  qtd_minima_estoque NUMERIC(10,2) DEFAULT 0,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  status VARCHAR(20) DEFAULT 'ATIVO',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON adm_produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_status ON adm_produtos(status);

-- Layouts de importação genéricos
CREATE TABLE IF NOT EXISTS adm_layouts_importacao (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  tipo_arquivo VARCHAR(50),
  configuracao JSONB,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Favoritos de telas
CREATE TABLE IF NOT EXISTS adm_favoritos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  codigo_tela VARCHAR(50) NOT NULL,
  nome_tela VARCHAR(200) NOT NULL,
  caminho_tela VARCHAR(500) NOT NULL,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON adm_favoritos(usuario_id);

-- Configurações e histórico de backup
CREATE TABLE IF NOT EXISTS adm_configuracao_backup (
  id BIGSERIAL PRIMARY KEY,
  tipo_backup VARCHAR(30) NOT NULL,
  diretorio_local VARCHAR(500),
  google_drive_folder_id VARCHAR(200),
  google_drive_credentials TEXT,
  frequencia VARCHAR(20) NOT NULL,
  horario_execucao TIME,
  dia_semana INTEGER,
  dia_mes INTEGER,
  quantidade_manter INTEGER DEFAULT 7,
  backup_automatico BOOLEAN DEFAULT TRUE,
  ultimo_backup TIMESTAMPTZ,
  proximo_backup TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'ATIVO',
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_historico_backup (
  id BIGSERIAL PRIMARY KEY,
  tipo_backup VARCHAR(30),
  nome_arquivo VARCHAR(255) NOT NULL,
  tamanho_bytes BIGINT,
  caminho_completo VARCHAR(500),
  data_backup TIMESTAMPTZ NOT NULL,
  status VARCHAR(20),
  tempo_execucao INTEGER,
  mensagem TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hist_backup_data ON adm_historico_backup(data_backup);

-- =============================
-- Cadastros de parceiros
-- =============================
CREATE TABLE IF NOT EXISTS par_parceiros (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20),
  codigo_unico VARCHAR(50),
  tipo_pessoa VARCHAR(20) NOT NULL,
  tipo_parceiro VARCHAR(100) NOT NULL,
  cpf_cnpj VARCHAR(18),
  cnpj VARCHAR(18),
  cpf VARCHAR(18),
  rg_inscricao_estadual VARCHAR(20),
  inscricao_estadual VARCHAR(20),
  inscricao_municipal VARCHAR(20),
  nome VARCHAR(200),
  razao_social VARCHAR(200),
  nome_fantasia VARCHAR(200),
  nome_completo VARCHAR(200),
  data_nascimento DATE,
  data_fundacao DATE,
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),
  site VARCHAR(200),
  endereco VARCHAR(200),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  pais VARCHAR(50) DEFAULT 'BRASIL',
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  tipo_conta VARCHAR(30),
  pix_chave VARCHAR(120),
  pix_tipo VARCHAR(50),
  limite_credito NUMERIC(15,2),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ATIVO',
  ativo BOOLEAN,
  parceiro_criado BOOLEAN,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_parceiros_cpf_cnpj ON par_parceiros(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_parceiros_tipo ON par_parceiros(tipo_parceiro);
CREATE INDEX IF NOT EXISTS idx_parceiros_empresa ON par_parceiros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_status ON par_parceiros(status);

-- =============================
-- Cadastros financeiros
-- =============================
CREATE TABLE IF NOT EXISTS fin_bancos (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  numero_banco VARCHAR(10) NOT NULL,
  nome VARCHAR(200) NOT NULL,
  agencia VARCHAR(20),
  conta VARCHAR(30),
  tipo_conta VARCHAR(30),
  saldo_inicial NUMERIC(15,2) DEFAULT 0,
  saldo_atual NUMERIC(15,2) DEFAULT 0,
  gerente VARCHAR(200),
  telefone VARCHAR(20),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fin_bancos_nome ON fin_bancos(nome);

CREATE TABLE IF NOT EXISTS fin_formas_pagamento (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_formas_pagamento_tipo ON fin_formas_pagamento(tipo);

CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL DEFAULT '' ,
  descricao TEXT,
  tipo VARCHAR(20) NOT NULL DEFAULT 'A_VISTA',
  forma_pagamento_id BIGINT REFERENCES fin_formas_pagamento(id),
  quantidade_parcelas INTEGER DEFAULT 1,
  dias_primeira_parcela INTEGER DEFAULT 0,
  dias_entre_parcelas INTEGER DEFAULT 30,
  percentual_desconto NUMERIC(10,2) DEFAULT 0,
  percentual_acrescimo NUMERIC(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ATIVO',
  observacoes TEXT,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_condicoes_pagamento_status ON fin_condicoes_pagamento(status);
CREATE INDEX IF NOT EXISTS idx_condicoes_pagamento_forma ON fin_condicoes_pagamento(forma_pagamento_id);

-- Plano de contas
CREATE TABLE IF NOT EXISTS fin_plano_contas (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  natureza VARCHAR(20) NOT NULL,
  nivel INTEGER NOT NULL,
  conta_pai_id BIGINT REFERENCES fin_plano_contas(id),
  aceita_lancamento BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plano_contas_tipo ON fin_plano_contas(tipo);
CREATE INDEX IF NOT EXISTS idx_plano_contas_pai ON fin_plano_contas(conta_pai_id);

-- Tipos de DRE
CREATE TABLE IF NOT EXISTS fin_tipos_dre (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  natureza VARCHAR(20) NOT NULL,
  ordem INTEGER DEFAULT 0,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tipos_dre_natureza ON fin_tipos_dre(natureza);

-- Estrutura de DRE e vínculos
CREATE TABLE IF NOT EXISTS fin_estrutura_dre (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  tipo_dre_id BIGINT REFERENCES fin_tipos_dre(id),
  plano_contas_id BIGINT REFERENCES fin_plano_contas(id),
  natureza VARCHAR(20),
  nivel INTEGER DEFAULT 0,
  ordem INTEGER DEFAULT 0,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_estrutura_dre_tipo ON fin_estrutura_dre(tipo_dre_id);
CREATE INDEX IF NOT EXISTS idx_estrutura_dre_plano ON fin_estrutura_dre(plano_contas_id);

CREATE TABLE IF NOT EXISTS fin_estrutura_dre_vinculos (
  id BIGSERIAL PRIMARY KEY,
  estrutura_id BIGINT REFERENCES fin_estrutura_dre(id) ON DELETE CASCADE,
  plano_contas_id BIGINT REFERENCES fin_plano_contas(id),
  peso NUMERIC(10,2) DEFAULT 1,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vinculos_estrutura ON fin_estrutura_dre_vinculos(estrutura_id);
CREATE INDEX IF NOT EXISTS idx_vinculos_plano ON fin_estrutura_dre_vinculos(plano_contas_id);

-- Modelos de DRE
CREATE TABLE IF NOT EXISTS fin_modelos_dre (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =============================
-- Tabelas de preço
-- =============================
CREATE TABLE IF NOT EXISTS tab_tabelas_precos (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  status VARCHAR(20) DEFAULT 'ATIVO',
  data_inicio DATE,
  data_fim DATE,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tab_preco_empresa ON tab_tabelas_precos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tab_preco_status ON tab_tabelas_precos(status);

CREATE TABLE IF NOT EXISTS tab_tabelas_precos_parceiros (
  id BIGSERIAL PRIMARY KEY,
  tabela_preco_id BIGINT REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
  parceiro_id BIGINT REFERENCES par_parceiros(id) ON DELETE CASCADE,
  prioridade INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tabela_parceiro ON tab_tabelas_precos_parceiros(tabela_preco_id, parceiro_id);

CREATE TABLE IF NOT EXISTS tab_tabelas_precos_itens (
  id BIGSERIAL PRIMARY KEY,
  tabela_preco_id BIGINT REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
  produto_id BIGINT REFERENCES adm_produtos(id),
  preco NUMERIC(15,2) NOT NULL,
  preco_promocional NUMERIC(15,2),
  data_inicio DATE,
  data_fim DATE,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_itens_tabela ON tab_tabelas_precos_itens(tabela_preco_id);
CREATE INDEX IF NOT EXISTS idx_itens_produto ON tab_tabelas_precos_itens(produto_id);

-- =============================
-- Importações de NF-e
-- =============================
CREATE TABLE IF NOT EXISTS imp_nfe_xml (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  numero_nfe VARCHAR(50),
  serie VARCHAR(10),
  chave_acesso VARCHAR(50),
  fornecedor_cnpj VARCHAR(18),
  fornecedor_nome VARCHAR(200),
  data_emissao DATE,
  valor_total NUMERIC(15,2),
  valor_produtos NUMERIC(15,2),
  valor_impostos NUMERIC(15,2),
  parceiro_id BIGINT REFERENCES par_parceiros(id),
  parceiro_criado BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'IMPORTADO',
  xml_conteudo TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nfe_empresa ON imp_nfe_xml(empresa_id);
CREATE INDEX IF NOT EXISTS idx_nfe_parceiro ON imp_nfe_xml(parceiro_id);

CREATE TABLE IF NOT EXISTS imp_nfe_produtos (
  id BIGSERIAL PRIMARY KEY,
  nfe_id BIGINT REFERENCES imp_nfe_xml(id) ON DELETE CASCADE,
  codigo_produto VARCHAR(50),
  descricao TEXT,
  ncm VARCHAR(10),
  cfop VARCHAR(10),
  unidade VARCHAR(10),
  quantidade NUMERIC(15,4),
  valor_unitario NUMERIC(15,2),
  valor_total NUMERIC(15,2)
);
CREATE INDEX IF NOT EXISTS idx_nfe_produtos_nfe ON imp_nfe_produtos(nfe_id);

CREATE TABLE IF NOT EXISTS imp_nfe_impostos (
  id BIGSERIAL PRIMARY KEY,
  nfe_id BIGINT REFERENCES imp_nfe_xml(id) ON DELETE CASCADE,
  tipo_imposto VARCHAR(20),
  base_calculo NUMERIC(15,2),
  aliquota NUMERIC(10,4),
  valor NUMERIC(15,2)
);
CREATE INDEX IF NOT EXISTS idx_nfe_impostos_nfe ON imp_nfe_impostos(nfe_id);

-- =============================
-- Importação de extratos bancários
-- =============================
CREATE TABLE IF NOT EXISTS imp_layouts_extrato (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  banco VARCHAR(50),
  configuracao JSONB,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imp_extratos_bancarios (
  id BIGSERIAL PRIMARY KEY,
  layout_id BIGINT REFERENCES imp_layouts_extrato(id),
  banco VARCHAR(50),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  periodo_inicio DATE,
  periodo_fim DATE,
  saldo_inicial NUMERIC(15,2),
  saldo_final NUMERIC(15,2),
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_extratos_layout ON imp_extratos_bancarios(layout_id);
CREATE INDEX IF NOT EXISTS idx_extratos_empresa ON imp_extratos_bancarios(empresa_id);

CREATE TABLE IF NOT EXISTS imp_extrato_linhas (
  id BIGSERIAL PRIMARY KEY,
  extrato_id BIGINT REFERENCES imp_extratos_bancarios(id) ON DELETE CASCADE,
  data_lancamento DATE,
  historico TEXT,
  documento VARCHAR(50),
  valor NUMERIC(15,2),
  tipo VARCHAR(10),
  saldo NUMERIC(15,2)
);
CREATE INDEX IF NOT EXISTS idx_extrato_linhas_extrato ON imp_extrato_linhas(extrato_id);
CREATE INDEX IF NOT EXISTS idx_extrato_linhas_data ON imp_extrato_linhas(data_lancamento);

-- =============================
-- Indicadores, objetivos e metas
-- =============================
CREATE TABLE IF NOT EXISTS ind_indicadores (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  formula TEXT NOT NULL,
  unidade VARCHAR(20) DEFAULT 'VALOR',
  categoria VARCHAR(50),
  empresa_id BIGINT REFERENCES adm_empresa(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_indicadores_categoria ON ind_indicadores(categoria);

CREATE TABLE IF NOT EXISTS obj_metas_semanais (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  semana_referencia DATE NOT NULL,
  responsavel_id BIGINT REFERENCES adm_funcionarios(id),
  valor_meta NUMERIC(15,2),
  valor_alcancado NUMERIC(15,2),
  status VARCHAR(20) DEFAULT 'ABERTO',
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_metas_semanais_semana ON obj_metas_semanais(semana_referencia);

CREATE TABLE IF NOT EXISTS obj_objetivos_trimestrais (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  trimestre VARCHAR(20) NOT NULL,
  ano INTEGER NOT NULL,
  responsavel_id BIGINT REFERENCES adm_funcionarios(id),
  valor_meta NUMERIC(15,2),
  valor_alcancado NUMERIC(15,2),
  status VARCHAR(20) DEFAULT 'ABERTO',
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_obj_trimestrais_periodo ON obj_objetivos_trimestrais(trimestre, ano);

-- =============================
-- Movimentações placeholder (referenciadas nas rotas)
-- =============================
CREATE TABLE IF NOT EXISTS mov_vendas (
  id BIGSERIAL PRIMARY KEY,
  parceiro_id BIGINT REFERENCES par_parceiros(id),
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vendas_parceiro ON mov_vendas(parceiro_id);

CREATE TABLE IF NOT EXISTS mov_compras (
  id BIGSERIAL PRIMARY KEY,
  parceiro_id BIGINT REFERENCES par_parceiros(id),
  empresa_id BIGINT REFERENCES adm_empresa(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_compras_parceiro ON mov_compras(parceiro_id);
