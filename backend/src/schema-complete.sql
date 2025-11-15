-- ============================================================================
-- SISTEMA ERP CRISTALCAR
-- Schema Completo do Banco de Dados
-- Database: CristalCar (Schema: Database)
-- Cores da Empresa: Laranja (#FF8C00) e Cinza (#6B7280)
-- ============================================================================

-- ============================================================================
-- MÓDULO 01.01 - ADMINISTRATIVO
-- ============================================================================

-- Tabela de Dados da Empresa
CREATE TABLE IF NOT EXISTS adm_empresa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),

    -- Endereço
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),

    -- Imagem da empresa
    logo_path VARCHAR(500),
    logo_filename VARCHAR(255),
    logo_mimetype VARCHAR(100),

    -- Configurações
    regime_tributario VARCHAR(50), -- SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL
    data_abertura DATE,
    observacoes TEXT,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS adm_funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_unico VARCHAR(20) UNIQUE NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE,

    -- Contatos
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),

    -- Endereço
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),

    -- Dados Profissionais
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    salario DECIMAL(10,2),

    -- Horário de Trabalho
    horario_entrada TIME,
    horario_saida TIME,
    horario_almoco_inicio TIME,
    horario_almoco_fim TIME,
    dias_trabalho VARCHAR(100), -- SEG,TER,QUA,QUI,SEX,SAB,DOM

    -- Status e Observações
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO, DEMITIDO
    observacoes TEXT,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários do Sistema
CREATE TABLE IF NOT EXISTS adm_usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_unico VARCHAR(20) UNIQUE NOT NULL,
    funcionario_id INTEGER,
    username VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    perfil VARCHAR(50) NOT NULL, -- ADMINISTRADOR, GERENTE, FINANCEIRO, OPERACIONAL
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO, BLOQUEADO
    ultimo_acesso DATETIME,
    tentativas_login INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES adm_funcionarios(id)
);

-- Tabela de Permissões por Tela/Função
CREATE TABLE IF NOT EXISTS adm_permissoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    modulo VARCHAR(100) NOT NULL, -- Ex: ADMINISTRATIVO, FINANCEIRO, PARCEIROS
    tela VARCHAR(100) NOT NULL, -- Ex: CADASTRO_EMPRESA, FUNCIONARIOS, PLANO_CONTAS
    permissao_visualizar BOOLEAN DEFAULT 1,
    permissao_incluir BOOLEAN DEFAULT 0,
    permissao_editar BOOLEAN DEFAULT 0,
    permissao_excluir BOOLEAN DEFAULT 0,
    permissao_imprimir BOOLEAN DEFAULT 0,
    permissao_exportar BOOLEAN DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, modulo, tela)
);

-- Tabela de Layouts de Importação
CREATE TABLE IF NOT EXISTS adm_layouts_importacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_layout VARCHAR(100) NOT NULL,
    tipo_arquivo VARCHAR(50) NOT NULL, -- XML_NF, EXTRATO_OFX, EXTRATO_CSV, PLANILHA_EXCEL
    descricao TEXT,

    -- Configurações do Layout
    delimitador VARCHAR(10), -- Para CSV
    encoding VARCHAR(20) DEFAULT 'UTF-8',
    tem_cabecalho BOOLEAN DEFAULT 1,
    linha_inicio_dados INTEGER DEFAULT 1,

    -- Mapeamento de Campos (JSON)
    mapeamento_campos TEXT, -- JSON com {campo_origem: campo_destino}

    -- Validações e Transformações
    regras_validacao TEXT, -- JSON com regras de validação
    regras_transformacao TEXT, -- JSON com regras de transformação

    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configuração de Backup
CREATE TABLE IF NOT EXISTS adm_configuracao_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ativo BOOLEAN DEFAULT 0,
    tipo_backup VARCHAR(50) DEFAULT 'GOOGLE_DRIVE', -- GOOGLE_DRIVE, LOCAL, FTP

    -- Configurações Google Drive
    google_drive_folder_id VARCHAR(200),
    google_drive_credentials TEXT, -- JSON com credenciais OAuth

    -- Configurações de Periodicidade
    frequencia VARCHAR(20) DEFAULT 'DIARIA', -- DIARIA, SEMANAL, MENSAL
    hora_execucao TIME DEFAULT '02:00:00',
    dia_semana INTEGER, -- 0-6 para backup semanal
    dia_mes INTEGER, -- 1-31 para backup mensal

    -- Retenção
    manter_ultimos INTEGER DEFAULT 30, -- Quantidade de backups a manter

    -- Notificações
    email_notificacao VARCHAR(200),
    notificar_sucesso BOOLEAN DEFAULT 0,
    notificar_erro BOOLEAN DEFAULT 1,

    ultimo_backup DATETIME,
    proximo_backup DATETIME,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Backups
CREATE TABLE IF NOT EXISTS adm_historico_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    configuracao_id INTEGER NOT NULL,
    data_backup DATETIME NOT NULL,
    tamanho_arquivo_bytes BIGINT,
    local_arquivo VARCHAR(500),
    status VARCHAR(20) NOT NULL, -- SUCESSO, ERRO
    mensagem_erro TEXT,
    tempo_execucao_segundos INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (configuracao_id) REFERENCES adm_configuracao_backup(id)
);

-- Tabela de Configuração de Registro de Log por Tela
CREATE TABLE IF NOT EXISTS adm_configuracao_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modulo VARCHAR(100) NOT NULL,
    tela VARCHAR(100) NOT NULL,
    registrar_log BOOLEAN DEFAULT 1,
    registrar_visualizacao BOOLEAN DEFAULT 0,
    registrar_inclusao BOOLEAN DEFAULT 1,
    registrar_edicao BOOLEAN DEFAULT 1,
    registrar_exclusao BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(modulo, tela)
);

-- Tabela de Log de Ações
CREATE TABLE IF NOT EXISTS adm_log_acoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    modulo VARCHAR(100) NOT NULL,
    tela VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL, -- VISUALIZAR, INCLUIR, EDITAR, EXCLUIR, IMPRIMIR, EXPORTAR
    registro_id INTEGER, -- ID do registro afetado
    dados_anteriores TEXT, -- JSON com dados antes da alteração
    dados_novos TEXT, -- JSON com dados após a alteração
    ip_address VARCHAR(45),
    user_agent TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- MÓDULO 01.02 - MODELOS DE PLANO
-- ============================================================================

-- Tabela de Plano de Contas (Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS fin_plano_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_conta VARCHAR(50) UNIQUE NOT NULL, -- Ex: 1.1.1.01.001
    descricao VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- RECEITA, DESPESA
    nivel INTEGER NOT NULL CHECK(nivel BETWEEN 1 AND 9), -- 1 a 9 níveis
    conta_pai_id INTEGER, -- Para hierarquia em árvore

    -- Configurações DRE
    compoe_dre BOOLEAN DEFAULT 1,
    tipo_gasto VARCHAR(20), -- FIXO, VARIAVEL (apenas para DESPESA)

    -- Configurações de Lançamento
    aceita_lancamento BOOLEAN DEFAULT 1, -- Contas sintéticas (totalizadoras) não aceitam
    utilizado_objetivo BOOLEAN DEFAULT 0, -- Usa em objetivos/metas

    -- Status
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO
    observacoes TEXT,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conta_pai_id) REFERENCES fin_plano_contas(id)
);

-- Tabela de Estrutura do DRE (Demonstração de Resultado)
CREATE TABLE IF NOT EXISTS fin_estrutura_dre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    nivel INTEGER NOT NULL, -- Nível hierárquico visual
    tipo VARCHAR(50) NOT NULL, -- RECEITA_BRUTA, DEDUCOES, RECEITA_LIQUIDA, CPV, etc
    ordem_exibicao INTEGER NOT NULL,

    -- Configurações de Cálculo
    eh_totalizadora BOOLEAN DEFAULT 0, -- Se recebe valores ou apenas totaliza
    formula VARCHAR(500), -- Fórmula de cálculo (ex: {RECEITA_BRUTA} - {DEDUCOES})

    -- Formatação Visual
    exibir_negativo BOOLEAN DEFAULT 0,
    negrito BOOLEAN DEFAULT 0,
    italico BOOLEAN DEFAULT 0,
    cor_texto VARCHAR(20), -- Para destaque

    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vinculação DRE x Plano de Contas
CREATE TABLE IF NOT EXISTS fin_dre_plano_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estrutura_dre_id INTEGER NOT NULL,
    plano_contas_id INTEGER NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estrutura_dre_id) REFERENCES fin_estrutura_dre(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id) ON DELETE CASCADE,
    UNIQUE(estrutura_dre_id, plano_contas_id)
);

-- ============================================================================
-- MÓDULO 01.03 - FINANCEIRO
-- ============================================================================

-- Tabela de Formas de Pagamento
CREATE TABLE IF NOT EXISTS fin_formas_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL, -- DINHEIRO, PIX, CARTAO_CREDITO, CARTAO_DEBITO, BOLETO, TRANSFERENCIA, CHEQUE

    -- Taxas e Prazos
    taxa_percentual DECIMAL(5,2) DEFAULT 0,
    taxa_fixa DECIMAL(10,2) DEFAULT 0,
    dias_recebimento INTEGER DEFAULT 0, -- Prazo médio para recebimento

    -- Integração Bancária
    gera_movimento_bancario BOOLEAN DEFAULT 1,

    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Condições de Pagamento
CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- A_VISTA, A_PRAZO, PARCELADO

    -- Configurações de Prazo
    quantidade_parcelas INTEGER DEFAULT 1,
    dias_primeira_parcela INTEGER DEFAULT 0,
    dias_entre_parcelas INTEGER DEFAULT 30,
    prazo_medio INTEGER DEFAULT 0, -- Calculado automaticamente

    -- Descontos/Acréscimos
    percentual_desconto DECIMAL(5,2) DEFAULT 0,
    percentual_acrescimo DECIMAL(5,2) DEFAULT 0,

    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Parcelas da Condição de Pagamento
CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento_parcelas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    condicao_pagamento_id INTEGER NOT NULL,
    numero_parcela INTEGER NOT NULL,
    dias_vencimento INTEGER NOT NULL,
    percentual_valor DECIMAL(5,2) NOT NULL, -- % do valor total
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condicao_pagamento_id) REFERENCES fin_condicoes_pagamento(id) ON DELETE CASCADE,
    UNIQUE(condicao_pagamento_id, numero_parcela)
);

-- Tabela de Bancos
CREATE TABLE IF NOT EXISTS fin_bancos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_banco VARCHAR(10) NOT NULL, -- Código FEBRABAN
    nome_banco VARCHAR(100) NOT NULL,
    agencia VARCHAR(20),
    conta VARCHAR(30),
    digito_conta VARCHAR(2),
    tipo_conta VARCHAR(30), -- CORRENTE, POUPANCA, INVESTIMENTO

    -- Saldos
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    data_saldo_inicial DATE,

    -- Configurações
    layout_extrato_id INTEGER, -- Referência para layout de importação
    plano_contas_id INTEGER, -- Conta contábil vinculada

    -- Gerente e Contatos
    gerente_nome VARCHAR(100),
    gerente_telefone VARCHAR(20),
    gerente_email VARCHAR(100),

    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (layout_extrato_id) REFERENCES adm_layouts_importacao(id),
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id)
);

-- Tabela de Tipos de Registro para Conciliação Bancária
CREATE TABLE IF NOT EXISTS fin_tipos_registro_conciliacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    banco_id INTEGER NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    tipo_movimento VARCHAR(20) NOT NULL, -- CREDITO, DEBITO

    -- Vinculação Automática
    plano_contas_id INTEGER, -- Conta padrão para este tipo
    forma_pagamento_id INTEGER, -- Forma de pagamento padrão

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id),
    UNIQUE(banco_id, codigo)
);

-- Tabela de Regras de Conciliação (De-Para)
CREATE TABLE IF NOT EXISTS fin_regras_conciliacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    banco_id INTEGER NOT NULL,
    tipo_registro_id INTEGER NOT NULL,
    prioridade INTEGER DEFAULT 0, -- Ordem de aplicação das regras

    -- Condições (múltiplas condições = AND)
    campo_origem VARCHAR(50) NOT NULL, -- HISTORICO, DOCUMENTO, VALOR
    operador VARCHAR(20) NOT NULL, -- CONTEM, IGUAL, COMECA_COM, TERMINA_COM, MAIOR_QUE, MENOR_QUE
    valor_comparacao VARCHAR(200) NOT NULL,

    -- Ação de Conciliação
    plano_contas_destino_id INTEGER,
    forma_pagamento_destino_id INTEGER,
    centro_custo_destino_id INTEGER,

    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_registro_id) REFERENCES fin_tipos_registro_conciliacao(id),
    FOREIGN KEY (plano_contas_destino_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (forma_pagamento_destino_id) REFERENCES fin_formas_pagamento(id)
);

-- Tabela de Centro de Custo
CREATE TABLE IF NOT EXISTS fin_centro_custo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    responsavel_id INTEGER, -- Funcionário responsável
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsavel_id) REFERENCES adm_funcionarios(id)
);

-- ============================================================================
-- MÓDULO 01.04 - PARCEIROS (Clientes e Fornecedores Unificados)
-- ============================================================================

-- Tabela Unificada de Parceiros
CREATE TABLE IF NOT EXISTS par_parceiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_unico VARCHAR(20) UNIQUE NOT NULL,

    -- Tipo de Parceiro
    tipo_parceiro VARCHAR(20) NOT NULL, -- CLIENTE, FORNECEDOR, AMBOS
    tipo_pessoa VARCHAR(20) NOT NULL, -- FISICA, JURIDICA

    -- Dados Pessoa Jurídica
    cnpj VARCHAR(18),
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),

    -- Dados Pessoa Física
    cpf VARCHAR(14),
    nome_completo VARCHAR(200),
    rg VARCHAR(20),
    data_nascimento DATE,

    -- Contatos Principais
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),

    -- Endereço Principal
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),

    -- Configurações Comerciais
    limite_credito DECIMAL(15,2) DEFAULT 0,
    condicao_pagamento_padrao_id INTEGER,
    forma_pagamento_padrao_id INTEGER,
    tabela_preco_id INTEGER, -- Tabela de preço específica

    -- Dados Bancários
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(20), -- CORRENTE, POUPANCA
    pix_chave VARCHAR(200),
    pix_tipo VARCHAR(20), -- CPF, CNPJ, EMAIL, TELEFONE, ALEATORIA

    -- Status e Observações
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO, BLOQUEADO
    observacoes TEXT,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condicao_pagamento_padrao_id) REFERENCES fin_condicoes_pagamento(id),
    FOREIGN KEY (forma_pagamento_padrao_id) REFERENCES fin_formas_pagamento(id)
);

-- Tabela de Contatos dos Parceiros
CREATE TABLE IF NOT EXISTS par_contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parceiro_id INTEGER NOT NULL,
    nome VARCHAR(200) NOT NULL,
    cargo VARCHAR(100),
    departamento VARCHAR(100),

    -- Contatos
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    whatsapp VARCHAR(20),

    -- Preferências de Contato
    eh_principal BOOLEAN DEFAULT 0,
    recebe_nf BOOLEAN DEFAULT 0,
    recebe_boleto BOOLEAN DEFAULT 0,
    recebe_marketing BOOLEAN DEFAULT 0,

    observacoes TEXT,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parceiro_id) REFERENCES par_parceiros(id) ON DELETE CASCADE
);

-- ============================================================================
-- MÓDULO 01.05 - CADASTRO DE TABELAS DE PREÇOS
-- ============================================================================

-- Tabela de Tabelas de Preços
CREATE TABLE IF NOT EXISTS tab_tabelas_precos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome_tabela VARCHAR(100) NOT NULL,
    tipo_tabela VARCHAR(20) NOT NULL, -- VENDA, COMPRA

    -- Vigência
    data_inicio_vigencia DATE NOT NULL,
    data_fim_vigencia DATE,
    ativa BOOLEAN DEFAULT 1,

    -- Exclusividade
    eh_exclusiva BOOLEAN DEFAULT 0, -- Se é exclusiva de algum parceiro
    parceiro_exclusivo_id INTEGER, -- Parceiro exclusivo

    -- Política de Preços
    permite_desconto BOOLEAN DEFAULT 1,
    desconto_maximo_percentual DECIMAL(5,2) DEFAULT 0,

    -- Acréscimo por Condição de Pagamento
    aplica_acrescimo_prazo BOOLEAN DEFAULT 0,
    percentual_acrescimo_prazo DECIMAL(5,2) DEFAULT 0,
    condicao_pagamento_base_id INTEGER, -- Condição sem acréscimo

    -- Histórico de Alterações
    manter_historico BOOLEAN DEFAULT 1,

    -- Layout de Importação
    layout_importacao_id INTEGER,

    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parceiro_exclusivo_id) REFERENCES par_parceiros(id),
    FOREIGN KEY (condicao_pagamento_base_id) REFERENCES fin_condicoes_pagamento(id),
    FOREIGN KEY (layout_importacao_id) REFERENCES adm_layouts_importacao(id)
);

-- Tabela de Histórico de Alterações de Tabelas de Preços
CREATE TABLE IF NOT EXISTS tab_tabelas_historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_preco_id INTEGER NOT NULL,
    versao INTEGER NOT NULL,
    data_alteracao DATETIME NOT NULL,
    usuario_id INTEGER,
    tipo_alteracao VARCHAR(50) NOT NULL, -- CRIACAO, ATUALIZACAO_PRECO, ATUALIZACAO_DESCONTO, DESATIVACAO
    descricao_alteracao TEXT,
    dados_anteriores TEXT, -- JSON com dados antes da alteração
    dados_novos TEXT, -- JSON com dados após alteração
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- TABELAS AUXILIARES EXISTENTES (Mantidas do schema anterior)
-- ============================================================================

-- Movimentação Financeira
CREATE TABLE IF NOT EXISTS mov_financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo VARCHAR(20) NOT NULL, -- ENTRADA, SAIDA
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
    origem VARCHAR(50), -- MANUAL, IMPORTACAO_XML, FATURAMENTO, COMPRAS
    origem_id INTEGER,
    usuario_id INTEGER,
    status VARCHAR(20) DEFAULT 'CONFIRMADO', -- PENDENTE, CONFIRMADO, CANCELADO
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (centro_custo_id) REFERENCES fin_centro_custo(id),
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id),
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices Administrativo
CREATE INDEX IF NOT EXISTS idx_adm_funcionarios_cpf ON adm_funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_adm_funcionarios_status ON adm_funcionarios(status);
CREATE INDEX IF NOT EXISTS idx_adm_usuarios_username ON adm_usuarios(username);
CREATE INDEX IF NOT EXISTS idx_adm_usuarios_email ON adm_usuarios(email);
CREATE INDEX IF NOT EXISTS idx_adm_permissoes_usuario ON adm_permissoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_adm_log_acoes_usuario ON adm_log_acoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_adm_log_acoes_modulo_tela ON adm_log_acoes(modulo, tela);

-- Índices Financeiro
CREATE INDEX IF NOT EXISTS idx_fin_plano_contas_codigo ON fin_plano_contas(codigo_conta);
CREATE INDEX IF NOT EXISTS idx_fin_plano_contas_tipo ON fin_plano_contas(tipo);
CREATE INDEX IF NOT EXISTS idx_fin_plano_contas_pai ON fin_plano_contas(conta_pai_id);
CREATE INDEX IF NOT EXISTS idx_fin_plano_contas_nivel ON fin_plano_contas(nivel);
CREATE INDEX IF NOT EXISTS idx_fin_bancos_status ON fin_bancos(status);
CREATE INDEX IF NOT EXISTS idx_fin_tipos_registro_banco ON fin_tipos_registro_conciliacao(banco_id);
CREATE INDEX IF NOT EXISTS idx_fin_regras_conciliacao_banco ON fin_regras_conciliacao(banco_id);

-- Índices Parceiros
CREATE INDEX IF NOT EXISTS idx_par_parceiros_cpf ON par_parceiros(cpf);
CREATE INDEX IF NOT EXISTS idx_par_parceiros_cnpj ON par_parceiros(cnpj);
CREATE INDEX IF NOT EXISTS idx_par_parceiros_tipo ON par_parceiros(tipo_parceiro);
CREATE INDEX IF NOT EXISTS idx_par_parceiros_status ON par_parceiros(status);
CREATE INDEX IF NOT EXISTS idx_par_contatos_parceiro ON par_contatos(parceiro_id);

-- Índices Tabelas de Preços
CREATE INDEX IF NOT EXISTS idx_tab_precos_codigo ON tab_tabelas_precos(codigo);
CREATE INDEX IF NOT EXISTS idx_tab_precos_vigencia ON tab_tabelas_precos(data_inicio_vigencia, data_fim_vigencia);
CREATE INDEX IF NOT EXISTS idx_tab_precos_parceiro ON tab_tabelas_precos(parceiro_exclusivo_id);
CREATE INDEX IF NOT EXISTS idx_tab_historico_tabela ON tab_tabelas_historico(tabela_preco_id);

-- Índices Movimentação
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_data ON mov_financeiro(data_movimento);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_tipo ON mov_financeiro(tipo);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_plano ON mov_financeiro(plano_contas_id);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_status ON mov_financeiro(status);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_competencia ON mov_financeiro(data_competencia);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_banco ON mov_financeiro(banco_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para atualizar timestamp de funcionários
CREATE TRIGGER IF NOT EXISTS trg_atualiza_timestamp_funcionarios
AFTER UPDATE ON adm_funcionarios
BEGIN
    UPDATE adm_funcionarios SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para atualizar timestamp de usuários
CREATE TRIGGER IF NOT EXISTS trg_atualiza_timestamp_usuarios
AFTER UPDATE ON adm_usuarios
BEGIN
    UPDATE adm_usuarios SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para atualizar timestamp de plano de contas
CREATE TRIGGER IF NOT EXISTS trg_atualiza_timestamp_plano_contas
AFTER UPDATE ON fin_plano_contas
BEGIN
    UPDATE fin_plano_contas SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para atualizar timestamp de parceiros
CREATE TRIGGER IF NOT EXISTS trg_atualiza_timestamp_parceiros
AFTER UPDATE ON par_parceiros
BEGIN
    UPDATE par_parceiros SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para marcar funcionário como INATIVO quando há data de demissão
CREATE TRIGGER IF NOT EXISTS trg_funcionario_demissao
AFTER UPDATE OF data_demissao ON adm_funcionarios
WHEN NEW.data_demissao IS NOT NULL AND OLD.data_demissao IS NULL
BEGIN
    UPDATE adm_funcionarios SET status = 'DEMITIDO' WHERE id = NEW.id;
END;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View de Hierarquia do Plano de Contas
CREATE VIEW IF NOT EXISTS vw_plano_contas_hierarquia AS
WITH RECURSIVE hierarquia AS (
    -- Nível 1
    SELECT
        id,
        codigo_conta,
        descricao,
        tipo,
        nivel,
        conta_pai_id,
        aceita_lancamento,
        status,
        CAST(codigo_conta AS TEXT) AS caminho,
        descricao AS descricao_completa
    FROM fin_plano_contas
    WHERE conta_pai_id IS NULL

    UNION ALL

    -- Níveis subsequentes
    SELECT
        p.id,
        p.codigo_conta,
        p.descricao,
        p.tipo,
        p.nivel,
        p.conta_pai_id,
        p.aceita_lancamento,
        p.status,
        h.caminho || ' > ' || p.codigo_conta AS caminho,
        h.descricao_completa || ' > ' || p.descricao AS descricao_completa
    FROM fin_plano_contas p
    INNER JOIN hierarquia h ON p.conta_pai_id = h.id
)
SELECT * FROM hierarquia
ORDER BY caminho;

-- View de Parceiros Ativos (Clientes)
CREATE VIEW IF NOT EXISTS vw_clientes_ativos AS
SELECT
    id,
    codigo_unico,
    COALESCE(nome_fantasia, nome_completo) AS nome,
    COALESCE(cnpj, cpf) AS documento,
    tipo_pessoa,
    telefone,
    celular,
    email,
    cidade,
    estado,
    status
FROM par_parceiros
WHERE tipo_parceiro IN ('CLIENTE', 'AMBOS')
AND status = 'ATIVO'
ORDER BY nome;

-- View de Parceiros Ativos (Fornecedores)
CREATE VIEW IF NOT EXISTS vw_fornecedores_ativos AS
SELECT
    id,
    codigo_unico,
    COALESCE(nome_fantasia, nome_completo) AS nome,
    COALESCE(cnpj, cpf) AS documento,
    tipo_pessoa,
    telefone,
    celular,
    email,
    cidade,
    estado,
    status
FROM par_parceiros
WHERE tipo_parceiro IN ('FORNECEDOR', 'AMBOS')
AND status = 'ATIVO'
ORDER BY nome;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
