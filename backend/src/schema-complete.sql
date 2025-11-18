-- ============================================================================
-- SISTEMA ERP AUTOMOTIVO - CRISTALCAR
-- Schema otimizado para Turso/SQLite
-- Linguagem: pt-BR
-- Objetivo: manter apenas tabelas utilizadas pelas APIs e telas atuais,
--           centralizando cadastros e evitando duplicidades.
-- ============================================================================

-- ============================================================================
-- MÓDULO ADMINISTRATIVO (Prefixo: adm_)
-- ============================================================================

CREATE TABLE IF NOT EXISTS adm_empresa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    regime_tributario VARCHAR(50),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    site VARCHAR(200),
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    logo_url VARCHAR(500),
    padrao BOOLEAN DEFAULT 0,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adm_funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_unico VARCHAR(20) UNIQUE NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE,
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    salario DECIMAL(10,2),
    empresa_id INTEGER,
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

CREATE TABLE IF NOT EXISTS adm_usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_unico VARCHAR(20) UNIQUE NOT NULL,
    funcionario_id INTEGER,
    username VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    perfil VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ATIVO',
    ultimo_acesso DATETIME,
    tentativas_login INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES adm_funcionarios(id)
);

CREATE TABLE IF NOT EXISTS adm_permissoes_modulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    permissao_leitura BOOLEAN DEFAULT 1,
    permissao_escrita BOOLEAN DEFAULT 0,
    permissao_exclusao BOOLEAN DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS adm_telas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_tela VARCHAR(50) UNIQUE NOT NULL,
    nome_tela VARCHAR(200) NOT NULL,
    descricao TEXT,
    modulo VARCHAR(50) NOT NULL,
    caminho_tela VARCHAR(500) NOT NULL,
    icone VARCHAR(100),
    ordem_exibicao INTEGER DEFAULT 0,
    exibir_menu BOOLEAN DEFAULT 1,
    exibir_favoritos BOOLEAN DEFAULT 1,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adm_favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    codigo_tela VARCHAR(50) NOT NULL,
    nome_tela VARCHAR(200) NOT NULL,
    caminho_tela VARCHAR(500) NOT NULL,
    ordem INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, codigo_tela)
);

CREATE TABLE IF NOT EXISTS adm_departamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    responsavel_id INTEGER,
    empresa_id INTEGER,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsavel_id) REFERENCES adm_funcionarios(id),
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

CREATE TABLE IF NOT EXISTS adm_produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    unidade_medida VARCHAR(20),
    local_estoque VARCHAR(100),
    tipo VARCHAR(50),
    finalidade VARCHAR(100),
    foto_path VARCHAR(500),
    qtd_minima_estoque DECIMAL(15,3),
    empresa_id INTEGER,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

CREATE TABLE IF NOT EXISTS adm_layouts_importacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo_arquivo VARCHAR(30) NOT NULL,
    separador VARCHAR(5),
    encoding VARCHAR(20) DEFAULT 'UTF-8',
    linha_inicial INTEGER DEFAULT 1,
    possui_cabecalho BOOLEAN DEFAULT 1,
    mapeamento_colunas TEXT,
    regras_validacao TEXT,
    tratamento_erro VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adm_configuracao_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_backup VARCHAR(30) NOT NULL,
    diretorio_local VARCHAR(500),
    google_drive_folder_id VARCHAR(200),
    google_drive_credentials TEXT,
    frequencia VARCHAR(20) NOT NULL,
    horario_execucao TIME,
    dia_semana INTEGER,
    dia_mes INTEGER,
    quantidade_manter INTEGER DEFAULT 7,
    backup_automatico BOOLEAN DEFAULT 1,
    ultimo_backup DATETIME,
    proximo_backup DATETIME,
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adm_historico_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_backup VARCHAR(30),
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes INTEGER,
    caminho_completo VARCHAR(500),
    data_backup DATETIME NOT NULL,
    status VARCHAR(20),
    tempo_execucao INTEGER,
    mensagem TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adm_log_acessos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    acao VARCHAR(100) NOT NULL,
    modulo VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    detalhes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

CREATE TABLE IF NOT EXISTS adm_log_acoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    modulo VARCHAR(50),
    tela VARCHAR(100),
    acao VARCHAR(20),
    registro_id INTEGER,
    dados_anteriores TEXT,
    dados_novos TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

CREATE TABLE IF NOT EXISTS adm_configuracao_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_tela VARCHAR(50) UNIQUE NOT NULL,
    habilitado BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CADASTRO CENTRAL DE PARCEIROS (Prefixo: par_)
-- ============================================================================

CREATE TABLE IF NOT EXISTS par_parceiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- CLIENTE, FORNECEDOR, PARCEIRO
    cnpj_cpf VARCHAR(18) UNIQUE,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    nome_contato VARCHAR(200),
    email VARCHAR(100),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MÓDULO FINANCEIRO (Prefixo: fin_)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fin_plano_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_conta VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    nivel INTEGER NOT NULL,
    conta_pai_id INTEGER,
    compoe_dre BOOLEAN DEFAULT 1,
    tipo_gasto VARCHAR(50),
    utilizado_objetivo BOOLEAN DEFAULT 0,
    aceita_lancamento BOOLEAN DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ATIVO',
    empresa_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conta_pai_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

-- Tipos de Estrutura do DRE (padronizado em 2025-11-18)
DROP TABLE IF EXISTS fin_tipos_estrutura_dre; -- remove legado duplicado
CREATE TABLE IF NOT EXISTS fin_tipos_dre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50),
    descricao TEXT,
    editavel BOOLEAN DEFAULT 1,
    empresa_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

CREATE TABLE IF NOT EXISTS fin_estrutura_dre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo_linha VARCHAR(50) NOT NULL,
    nivel INTEGER NOT NULL,
    pai_id INTEGER,
    tipo_dre_id INTEGER,
    ordem INTEGER DEFAULT 0,
    formula TEXT,
    negativo BOOLEAN DEFAULT 0,
    editavel BOOLEAN DEFAULT 1,
    empresa_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_estrutura_id) REFERENCES fin_tipos_dre(id)
);

CREATE TABLE IF NOT EXISTS fin_dre_plano_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estrutura_id INTEGER NOT NULL,
    plano_conta_id INTEGER NOT NULL,
    tipo_vinculo VARCHAR(50) DEFAULT 'PADRAO',
    regra_rateio VARCHAR(50),
    formula TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estrutura_id) REFERENCES fin_estrutura_dre(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_conta_id) REFERENCES fin_plano_contas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fin_modelos_dre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_modelo VARCHAR(200) NOT NULL,
    tipo_modelo VARCHAR(50) NOT NULL,
    estrutura_tipo VARCHAR(50) NOT NULL,
    descricao TEXT,
    padrao BOOLEAN DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fin_bancos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_banco VARCHAR(20),
    nome_banco VARCHAR(200) NOT NULL,
    agencia VARCHAR(20),
    conta VARCHAR(20),
    tipo_conta VARCHAR(20) DEFAULT 'CORRENTE',
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    data_saldo_inicial DATE,
    plano_contas_id INTEGER,
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id)
);

CREATE TABLE IF NOT EXISTS fin_formas_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    gera_parcelas BOOLEAN DEFAULT 0,
    quantidade_parcelas INTEGER DEFAULT 1,
    intervalo_parcelas INTEGER DEFAULT 30,
    dias_primeira_parcela INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    primeira_parcela_dias INTEGER DEFAULT 0,
    quantidade_parcelas INTEGER DEFAULT 1,
    intervalo_parcelas INTEGER DEFAULT 30,
    desconto_percentual DECIMAL(5,2),
    multa_percentual DECIMAL(5,2),
    juros_mensal_percentual DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fin_regras_conciliacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_regra VARCHAR(200) NOT NULL,
    tipo_operacao VARCHAR(20) NOT NULL,
    padrao_busca VARCHAR(200) NOT NULL,
    tipo_correspondencia VARCHAR(20) DEFAULT 'CONTEM',
    plano_contas_id INTEGER NOT NULL,
    centro_custo_id INTEGER,
    prioridade INTEGER DEFAULT 100,
    ativo BOOLEAN DEFAULT 1,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (centro_custo_id) REFERENCES adm_departamentos(id)
);

-- ============================================================================
-- MÓDULO DE MOVIMENTAÇÃO FINANCEIRA (Prefixo: mov_)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mov_financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo VARCHAR(20) NOT NULL,
    data_movimento DATE NOT NULL,
    data_competencia DATE NOT NULL,
    plano_contas_id INTEGER NOT NULL,
    centro_custo_id INTEGER,
    banco_id INTEGER,
    forma_pagamento_id INTEGER,
    descricao VARCHAR(200) NOT NULL,
    documento VARCHAR(100),
    valor DECIMAL(15,2) NOT NULL,
    observacoes TEXT,
    conciliado BOOLEAN DEFAULT 0,
    data_conciliacao DATE,
    origem VARCHAR(50),
    origem_id INTEGER,
    usuario_id INTEGER,
    status VARCHAR(20) DEFAULT 'CONFIRMADO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (centro_custo_id) REFERENCES adm_departamentos(id),
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id),
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

CREATE TABLE IF NOT EXISTS mov_conciliacao_bancaria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    banco_id INTEGER NOT NULL,
    data_conciliacao DATE NOT NULL,
    saldo_extrato DECIMAL(15,2) NOT NULL,
    saldo_sistema DECIMAL(15,2) NOT NULL,
    diferenca DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    observacoes TEXT,
    usuario_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id),
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- CONTAS A RECEBER / PAGAR (Prefixos: fat_, com_)
-- Centralizados com par_parceiros e reaproveitados em relatórios.
-- ============================================================================

CREATE TABLE IF NOT EXISTS fat_cobrancas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    numero_documento VARCHAR(50),
    descricao VARCHAR(200),
    data_emissao DATE,
    data_vencimento DATE,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_saldo DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ABERTO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES par_parceiros(id)
);

CREATE TABLE IF NOT EXISTS fat_recebimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cobranca_id INTEGER NOT NULL,
    data_recebimento DATE NOT NULL,
    valor_recebido DECIMAL(15,2) NOT NULL,
    forma_pagamento_id INTEGER,
    banco_id INTEGER,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cobranca_id) REFERENCES fat_cobrancas(id) ON DELETE CASCADE,
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id),
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id)
);

CREATE TABLE IF NOT EXISTS com_pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fornecedor_id INTEGER NOT NULL,
    numero_documento VARCHAR(50),
    descricao VARCHAR(200),
    data_emissao DATE,
    data_vencimento DATE,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_saldo DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ABERTO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES par_parceiros(id)
);

CREATE TABLE IF NOT EXISTS com_baixas_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pagamento_id INTEGER NOT NULL,
    data_pagamento DATE NOT NULL,
    valor_pago DECIMAL(15,2) NOT NULL,
    forma_pagamento_id INTEGER,
    banco_id INTEGER,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pagamento_id) REFERENCES com_pagamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id),
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id)
);

CREATE VIEW IF NOT EXISTS fat_clientes AS
    SELECT * FROM par_parceiros WHERE tipo LIKE '%CLIENTE%';

CREATE VIEW IF NOT EXISTS com_fornecedores AS
    SELECT * FROM par_parceiros WHERE tipo LIKE '%FORNECEDOR%';

-- ============================================================================
-- TABELAS DE PREÇOS (Prefixo: tab_)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tab_tabelas_precos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio DATE,
    data_fim DATE,
    percentual_desconto DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tab_tabelas_precos_parceiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_preco_id INTEGER NOT NULL,
    parceiro_id INTEGER NOT NULL,
    prioridade INTEGER DEFAULT 100,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
    FOREIGN KEY (parceiro_id) REFERENCES par_parceiros(id) ON DELETE CASCADE,
    UNIQUE(tabela_preco_id, parceiro_id)
);

CREATE TABLE IF NOT EXISTS tab_tabelas_precos_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_preco_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    preco_venda DECIMAL(15,2),
    preco_custo DECIMAL(15,2),
    margem_lucro DECIMAL(5,2),
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES adm_produtos(id) ON DELETE CASCADE,
    UNIQUE(tabela_preco_id, produto_id)
);

CREATE TABLE IF NOT EXISTS tab_historico_alteracoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_preco_id INTEGER NOT NULL,
    usuario_id INTEGER,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id),
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- OBJETIVOS E INDICADORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS obj_objetivos_trimestrais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    empresa_id INTEGER,
    ano INTEGER NOT NULL,
    trimestre INTEGER NOT NULL,
    plano_conta_id INTEGER,
    tipo_conta VARCHAR(20) NOT NULL,
    valor_objetivo DECIMAL(15,2) NOT NULL,
    descricao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_conta_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

CREATE TABLE IF NOT EXISTS obj_metas_semanais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    empresa_id INTEGER,
    semana INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    descricao TEXT,
    meta_valor DECIMAL(15,2),
    realizado_valor DECIMAL(15,2),
    meta_quantidade INTEGER,
    realizado_quantidade INTEGER,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

CREATE TABLE IF NOT EXISTS ind_indicadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    formula TEXT,
    unidade VARCHAR(20),
    categoria VARCHAR(50),
    empresa_id INTEGER,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
);

CREATE TABLE IF NOT EXISTS ind_indicadores_valores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    indicador_id INTEGER NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    calculado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (indicador_id) REFERENCES ind_indicadores(id) ON DELETE CASCADE
);

-- ============================================================================
-- IMPORTAÇÃO DE DADOS (Prefixo: imp_)
-- ============================================================================

CREATE TABLE IF NOT EXISTS imp_layouts_extrato (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(30),
    formato VARCHAR(20),
    separador VARCHAR(5),
    col_data INTEGER,
    col_descricao INTEGER,
    col_valor INTEGER,
    col_tipo INTEGER,
    formato_data VARCHAR(20),
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS imp_extratos_bancarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE,
    empresa_id INTEGER,
    layout_id INTEGER,
    nome_arquivo VARCHAR(255),
    data_importacao DATETIME,
    total_linhas INTEGER,
    linhas_processadas INTEGER,
    linhas_erro INTEGER,
    status VARCHAR(20),
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (layout_id) REFERENCES imp_layouts_extrato(id)
);

CREATE TABLE IF NOT EXISTS imp_extrato_linhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    extrato_id INTEGER NOT NULL,
    linha_numero INTEGER,
    data_movimento DATE,
    descricao VARCHAR(500),
    valor DECIMAL(15,2),
    tipo VARCHAR(20),
    conciliado BOOLEAN DEFAULT 0,
    lancamento_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (extrato_id) REFERENCES imp_extratos_bancarios(id) ON DELETE CASCADE,
    FOREIGN KEY (lancamento_id) REFERENCES mov_financeiro(id)
);

CREATE TABLE IF NOT EXISTS imp_nfe_xml (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    empresa_id INTEGER,
    numero_nfe VARCHAR(50),
    serie VARCHAR(10),
    chave_acesso VARCHAR(50),
    fornecedor_cnpj VARCHAR(18),
    fornecedor_nome VARCHAR(200),
    data_emissao DATE,
    valor_total DECIMAL(15,2),
    valor_produtos DECIMAL(15,2),
    valor_impostos DECIMAL(15,2),
    parceiro_id INTEGER,
    parceiro_criado BOOLEAN DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IMPORTADO',
    xml_conteudo TEXT,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parceiro_id) REFERENCES par_parceiros(id)
);

CREATE TABLE IF NOT EXISTS imp_nfe_produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nfe_id INTEGER NOT NULL,
    codigo_produto VARCHAR(50),
    descricao TEXT,
    ncm VARCHAR(10),
    cfop VARCHAR(10),
    unidade VARCHAR(10),
    quantidade DECIMAL(15,4),
    valor_unitario DECIMAL(15,2),
    valor_total DECIMAL(15,2),
    FOREIGN KEY (nfe_id) REFERENCES imp_nfe_xml(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imp_nfe_impostos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nfe_id INTEGER NOT NULL,
    tipo_imposto VARCHAR(20),
    base_calculo DECIMAL(15,2),
    aliquota DECIMAL(10,4),
    valor DECIMAL(15,2),
    FOREIGN KEY (nfe_id) REFERENCES imp_nfe_xml(id) ON DELETE CASCADE
);

