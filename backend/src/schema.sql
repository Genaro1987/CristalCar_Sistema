-- ============================================================================
-- SISTEMA ERP AUTOMOTIVO - CRISTALCAR
-- Schema de Banco de Dados - SQLite/Turso
-- Cores da Empresa: Laranja e Cinza
-- ============================================================================

-- ============================================================================
-- MÓDULO ADMINISTRATIVO (Prefixo: adm_)
-- ============================================================================

-- Tabela de Dados da Empresa
CREATE TABLE IF NOT EXISTS adm_empresa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    regime_tributario VARCHAR(50), -- SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL
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
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Layouts de Importação
CREATE TABLE IF NOT EXISTS adm_layouts_importacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo_arquivo VARCHAR(30) NOT NULL, -- CSV, TXT, EXCEL, XML, OFX
    separador VARCHAR(5), -- Para CSV/TXT
    encoding VARCHAR(20) DEFAULT 'UTF-8',
    linha_inicial INTEGER DEFAULT 1,
    possui_cabecalho BOOLEAN DEFAULT 1,
    mapeamento_colunas TEXT, -- JSON com mapeamento
    regras_validacao TEXT, -- JSON com regras
    tratamento_erro VARCHAR(50), -- IGNORAR, PARAR, REGISTRAR
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configuração de Backup
CREATE TABLE IF NOT EXISTS adm_configuracao_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_backup VARCHAR(30) NOT NULL, -- LOCAL, GOOGLE_DRIVE, AMBOS
    diretorio_local VARCHAR(500),
    google_drive_folder_id VARCHAR(200),
    google_drive_credentials TEXT,
    frequencia VARCHAR(20) NOT NULL, -- DIARIA, SEMANAL, MENSAL
    horario_execucao TIME,
    dia_semana INTEGER, -- 0=Domingo, 1=Segunda, etc
    dia_mes INTEGER, -- 1-31
    quantidade_manter INTEGER DEFAULT 7, -- Quantos backups manter
    backup_automatico BOOLEAN DEFAULT 1,
    ultimo_backup DATETIME,
    proximo_backup DATETIME,
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Backups
CREATE TABLE IF NOT EXISTS adm_historico_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_backup VARCHAR(30), -- LOCAL, GOOGLE_DRIVE
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes INTEGER,
    caminho_completo VARCHAR(500),
    data_backup DATETIME NOT NULL,
    status VARCHAR(20), -- SUCESSO, ERRO, PARCIAL
    tempo_execucao INTEGER, -- Em segundos
    mensagem TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Favoritos do Usuário
CREATE TABLE IF NOT EXISTS adm_favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    codigo_tela VARCHAR(20) NOT NULL,
    nome_tela VARCHAR(200) NOT NULL,
    caminho_tela VARCHAR(500) NOT NULL,
    ordem INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, codigo_tela)
);

-- Tabela de Funcionários
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

-- Tabela de Permissões de Módulos
CREATE TABLE IF NOT EXISTS adm_permissoes_modulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    modulo VARCHAR(50) NOT NULL, -- ADMINISTRATIVO, FINANCEIRO, FATURAMENTO, COMPRAS, RELATORIOS
    permissao_leitura BOOLEAN DEFAULT 1,
    permissao_escrita BOOLEAN DEFAULT 0,
    permissao_exclusao BOOLEAN DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id) ON DELETE CASCADE
);

-- Tabela de Telas do Sistema
CREATE TABLE IF NOT EXISTS adm_telas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_tela VARCHAR(50) UNIQUE NOT NULL,
    nome_tela VARCHAR(200) NOT NULL,
    descricao TEXT,
    modulo VARCHAR(50) NOT NULL, -- ADMINISTRATIVO, FINANCEIRO, FATURAMENTO, COMPRAS, RELATORIOS, PARCEIROS, OBJETIVOS
    caminho_tela VARCHAR(500) NOT NULL,
    icone VARCHAR(100), -- Nome do ícone (ex: 'Building', 'Users', 'ChartBar')
    ordem_exibicao INTEGER DEFAULT 0,
    exibir_menu BOOLEAN DEFAULT 1,
    exibir_favoritos BOOLEAN DEFAULT 1,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Log de Acessos
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

-- ============================================================================
-- MÓDULO FINANCEIRO - CADASTROS (Prefixo: fin_)
-- ============================================================================

-- Tabela de Plano de Contas
CREATE TABLE IF NOT EXISTS fin_plano_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_conta VARCHAR(50) UNIQUE NOT NULL, -- Ex: 1.1.1.01
    descricao VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- RECEITA, DESPESA
    nivel INTEGER NOT NULL, -- 1 a 9
    conta_pai_id INTEGER, -- Para hierarquia
    considera_resultado BOOLEAN DEFAULT 1,
    tipo_gasto VARCHAR(20), -- FIXO, VARIAVEL (apenas para DESPESA)
    utilizado_objetivo BOOLEAN DEFAULT 0,
    aceita_lancamento BOOLEAN DEFAULT 1, -- Contas sintéticas não aceitam lançamento
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conta_pai_id) REFERENCES fin_plano_contas(id)
);

-- Tabela de Estrutura do DRE
CREATE TABLE IF NOT EXISTS fin_estrutura_dre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    nivel INTEGER NOT NULL, -- Nível hierárquico
    tipo VARCHAR(50) NOT NULL, -- RECEITA_BRUTA, DEDUCOES, RECEITA_LIQUIDA, CPV, LUCRO_BRUTO, DESPESAS_OPERACIONAIS, etc
    ordem_exibicao INTEGER NOT NULL,
    formula VARCHAR(200), -- Para cálculos (ex: RECEITA_BRUTA - DEDUCOES)
    exibir_negativo BOOLEAN DEFAULT 0,
    negrito BOOLEAN DEFAULT 0,
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
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id) ON DELETE CASCADE
);

-- Tabela de Bancos
CREATE TABLE IF NOT EXISTS fin_bancos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_banco VARCHAR(10) NOT NULL,
    nome_banco VARCHAR(100) NOT NULL,
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(30), -- CORRENTE, POUPANCA, INVESTIMENTO
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    data_saldo_inicial DATE,
    plano_contas_id INTEGER, -- Conta contábil vinculada
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id)
);

-- Tabela de Formas de Pagamento
CREATE TABLE IF NOT EXISTS fin_formas_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL, -- DINHEIRO, PIX, CARTAO_CREDITO, CARTAO_DEBITO, BOLETO, TRANSFERENCIA, CHEQUE, OUTROS
    taxa_percentual DECIMAL(5,2) DEFAULT 0,
    taxa_fixa DECIMAL(10,2) DEFAULT 0,
    gera_movimento_bancario BOOLEAN DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Condições de Pagamento
CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL, -- A_VISTA, A_PRAZO, PARCELADO
    forma_pagamento_id INTEGER NOT NULL,
    quantidade_parcelas INTEGER DEFAULT 1,
    dias_primeira_parcela INTEGER DEFAULT 0,
    dias_entre_parcelas INTEGER DEFAULT 30,
    percentual_desconto DECIMAL(5,2) DEFAULT 0,
    percentual_acrescimo DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id)
);

-- Tabela de Configuração OFX por Banco
CREATE TABLE IF NOT EXISTS fin_config_ofx_bancos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    banco_id INTEGER NOT NULL UNIQUE,
    campo_data VARCHAR(50) DEFAULT 'DTPOSTED',
    campo_valor VARCHAR(50) DEFAULT 'TRNAMT',
    campo_documento VARCHAR(50) DEFAULT 'CHECKNUM',
    campo_descricao VARCHAR(50) DEFAULT 'MEMO',
    campo_tipo VARCHAR(50) DEFAULT 'TRNTYPE',
    campo_id_transacao VARCHAR(50) DEFAULT 'FITID',
    usar_dtuser BOOLEAN DEFAULT 0,
    separador_decimal VARCHAR(5) DEFAULT ',',
    formato_data VARCHAR(20) DEFAULT 'YYYYMMDD',
    ignorar_duplicatas BOOLEAN DEFAULT 1,
    dias_retroativos INTEGER DEFAULT 90,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id) ON DELETE CASCADE
);

-- Tabela de Regras de Conciliação Bancária
CREATE TABLE IF NOT EXISTS fin_regras_conciliacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo_operacao VARCHAR(20) NOT NULL, -- CREDITO, DEBITO, AMBOS
    padrao_busca VARCHAR(200) NOT NULL, -- Texto ou regex para buscar na descrição
    tipo_correspondencia VARCHAR(20) DEFAULT 'CONTEM', -- CONTEM, IGUAL, INICIA, TERMINA, REGEX
    plano_contas_id INTEGER NOT NULL,
    centro_custo_id INTEGER,
    prioridade INTEGER DEFAULT 100, -- Maior = mais prioridade
    ativo BOOLEAN DEFAULT 1,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (centro_custo_id) REFERENCES fin_centro_custo(id)
);

-- Tabela de Centro de Custo
CREATE TABLE IF NOT EXISTS fin_centro_custo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MÓDULO DE MOVIMENTAÇÃO FINANCEIRA (Prefixo: mov_)
-- ============================================================================

-- Tabela de Movimentações Financeiras (Caixa)
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
    documento VARCHAR(100), -- Número do documento (NF, recibo, etc)
    valor DECIMAL(15,2) NOT NULL,
    observacoes TEXT,
    conciliado BOOLEAN DEFAULT 0,
    data_conciliacao DATE,
    origem VARCHAR(50), -- MANUAL, IMPORTACAO_XML, FATURAMENTO, COMPRAS
    origem_id INTEGER, -- ID da origem (fat_cobrancas, com_pagamentos)
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

-- Tabela de Conciliação Bancária
CREATE TABLE IF NOT EXISTS mov_conciliacao_bancaria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    banco_id INTEGER NOT NULL,
    data_conciliacao DATE NOT NULL,
    saldo_extrato DECIMAL(15,2) NOT NULL,
    saldo_sistema DECIMAL(15,2) NOT NULL,
    diferenca DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, CONCILIADO, DIVERGENTE
    observacoes TEXT,
    usuario_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id),
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- MÓDULO DE FATURAMENTO - CONTAS A RECEBER (Prefixo: fat_)
-- ============================================================================

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS fat_clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_pessoa VARCHAR(20) NOT NULL, -- FISICA, JURIDICA
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    nome VARCHAR(200), -- Para pessoa física
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notas Fiscais de Venda
CREATE TABLE IF NOT EXISTS fat_notas_fiscais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_nf VARCHAR(20) NOT NULL,
    serie VARCHAR(10),
    chave_acesso VARCHAR(44) UNIQUE,
    cliente_id INTEGER NOT NULL,
    data_emissao DATE NOT NULL,
    data_entrada_saida DATE,
    tipo_operacao VARCHAR(20) DEFAULT 'SAIDA',
    valor_produtos DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_frete DECIMAL(15,2) DEFAULT 0,
    valor_seguro DECIMAL(15,2) DEFAULT 0,
    outras_despesas DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_icms DECIMAL(15,2) DEFAULT 0,
    valor_ipi DECIMAL(15,2) DEFAULT 0,
    valor_pis DECIMAL(15,2) DEFAULT 0,
    valor_cofins DECIMAL(15,2) DEFAULT 0,
    xml_content TEXT, -- Conteúdo do XML armazenado
    origem VARCHAR(30) DEFAULT 'MANUAL', -- MANUAL, IMPORTACAO_XML
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES fat_clientes(id)
);

-- Tabela de Cobranças (Contas a Receber)
CREATE TABLE IF NOT EXISTS fat_cobrancas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nota_fiscal_id INTEGER,
    cliente_id INTEGER NOT NULL,
    numero_documento VARCHAR(50),
    descricao VARCHAR(200) NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_competencia DATE NOT NULL,
    valor_original DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_juros DECIMAL(15,2) DEFAULT 0,
    valor_multa DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    valor_saldo DECIMAL(15,2) NOT NULL,
    plano_contas_id INTEGER NOT NULL,
    centro_custo_id INTEGER,
    forma_pagamento_id INTEGER,
    status VARCHAR(30) DEFAULT 'ABERTO', -- ABERTO, PAGO_PARCIAL, PAGO, VENCIDO, CANCELADO
    data_pagamento DATE,
    origem VARCHAR(30) DEFAULT 'MANUAL', -- MANUAL, IMPORTACAO_NF
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nota_fiscal_id) REFERENCES fat_notas_fiscais(id),
    FOREIGN KEY (cliente_id) REFERENCES fat_clientes(id),
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (centro_custo_id) REFERENCES fin_centro_custo(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id)
);

-- Tabela de Recebimentos (Baixas das Cobranças)
CREATE TABLE IF NOT EXISTS fat_recebimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cobranca_id INTEGER NOT NULL,
    mov_financeiro_id INTEGER, -- Vincula com movimentação financeira
    data_recebimento DATE NOT NULL,
    valor_recebido DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_juros DECIMAL(15,2) DEFAULT 0,
    valor_multa DECIMAL(15,2) DEFAULT 0,
    forma_pagamento_id INTEGER,
    banco_id INTEGER,
    observacoes TEXT,
    usuario_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cobranca_id) REFERENCES fat_cobrancas(id) ON DELETE CASCADE,
    FOREIGN KEY (mov_financeiro_id) REFERENCES mov_financeiro(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id),
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id),
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- MÓDULO DE COMPRAS - CONTAS A PAGAR (Prefixo: com_)
-- ============================================================================

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS com_fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_pessoa VARCHAR(20) NOT NULL, -- FISICA, JURIDICA
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    nome VARCHAR(200), -- Para pessoa física
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    tipo_fornecedor VARCHAR(50), -- PRODUTOS, SERVICOS, AMBOS
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notas Fiscais de Compra
CREATE TABLE IF NOT EXISTS com_notas_fiscais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_nf VARCHAR(20) NOT NULL,
    serie VARCHAR(10),
    chave_acesso VARCHAR(44) UNIQUE,
    fornecedor_id INTEGER NOT NULL,
    data_emissao DATE NOT NULL,
    data_entrada_saida DATE,
    tipo_operacao VARCHAR(20) DEFAULT 'ENTRADA',
    valor_produtos DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_frete DECIMAL(15,2) DEFAULT 0,
    valor_seguro DECIMAL(15,2) DEFAULT 0,
    outras_despesas DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_icms DECIMAL(15,2) DEFAULT 0,
    valor_ipi DECIMAL(15,2) DEFAULT 0,
    valor_pis DECIMAL(15,2) DEFAULT 0,
    valor_cofins DECIMAL(15,2) DEFAULT 0,
    xml_content TEXT, -- Conteúdo do XML armazenado
    origem VARCHAR(30) DEFAULT 'MANUAL', -- MANUAL, IMPORTACAO_XML, EMAIL, API_SEFAZ
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES com_fornecedores(id)
);

-- Tabela de Pagamentos (Contas a Pagar)
CREATE TABLE IF NOT EXISTS com_pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nota_fiscal_id INTEGER,
    fornecedor_id INTEGER NOT NULL,
    numero_documento VARCHAR(50),
    descricao VARCHAR(200) NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_competencia DATE NOT NULL,
    valor_original DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_juros DECIMAL(15,2) DEFAULT 0,
    valor_multa DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    valor_saldo DECIMAL(15,2) NOT NULL,
    plano_contas_id INTEGER NOT NULL,
    centro_custo_id INTEGER,
    forma_pagamento_id INTEGER,
    status VARCHAR(30) DEFAULT 'ABERTO', -- ABERTO, PAGO_PARCIAL, PAGO, VENCIDO, CANCELADO
    data_pagamento DATE,
    origem VARCHAR(30) DEFAULT 'MANUAL', -- MANUAL, IMPORTACAO_NF
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nota_fiscal_id) REFERENCES com_notas_fiscais(id),
    FOREIGN KEY (fornecedor_id) REFERENCES com_fornecedores(id),
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    FOREIGN KEY (centro_custo_id) REFERENCES fin_centro_custo(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id)
);

-- Tabela de Baixas de Pagamentos
CREATE TABLE IF NOT EXISTS com_baixas_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pagamento_id INTEGER NOT NULL,
    mov_financeiro_id INTEGER, -- Vincula com movimentação financeira
    data_pagamento DATE NOT NULL,
    valor_pago DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_juros DECIMAL(15,2) DEFAULT 0,
    valor_multa DECIMAL(15,2) DEFAULT 0,
    forma_pagamento_id INTEGER,
    banco_id INTEGER,
    observacoes TEXT,
    usuario_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pagamento_id) REFERENCES com_pagamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (mov_financeiro_id) REFERENCES mov_financeiro(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id),
    FOREIGN KEY (banco_id) REFERENCES fin_bancos(id),
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- MÓDULO DE PARCEIROS (Prefixo: par_) - Cadastro Unificado
-- ============================================================================

-- Tabela de Parceiros (Unifica Clientes, Fornecedores, etc)
CREATE TABLE IF NOT EXISTS par_parceiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_unico VARCHAR(20) UNIQUE NOT NULL,
    tipo_parceiro VARCHAR(100) NOT NULL, -- CLIENTE, FORNECEDOR, TRANSPORTADORA, PRESTADOR_SERVICO, FUNCIONARIO, OUTRO (pode ter múltiplos separados por vírgula)
    tipo_pessoa VARCHAR(20) NOT NULL, -- FISICA, JURIDICA
    -- Documentos - PJ
    cnpj VARCHAR(18),
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    -- Documentos - PF
    cpf VARCHAR(14),
    nome_completo VARCHAR(200),
    rg VARCHAR(20),
    data_nascimento DATE,
    -- Contatos
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
    -- Informações Comerciais
    limite_credito DECIMAL(15,2) DEFAULT 0,
    condicao_pagamento_padrao_id INTEGER,
    forma_pagamento_padrao_id INTEGER,
    tabela_preco_id INTEGER,
    -- Informações Bancárias
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(20), -- CORRENTE, POUPANCA
    pix_chave VARCHAR(200),
    pix_tipo VARCHAR(20), -- CPF, CNPJ, EMAIL, TELEFONE, ALEATORIA
    -- Controle
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condicao_pagamento_padrao_id) REFERENCES fin_condicoes_pagamento(id),
    FOREIGN KEY (forma_pagamento_padrao_id) REFERENCES fin_formas_pagamento(id),
    FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id)
);

-- ============================================================================
-- MÓDULO DE TABELAS DE PREÇOS (Prefixo: tab_)
-- ============================================================================

-- Tabela de Tabelas de Preços
CREATE TABLE IF NOT EXISTS tab_tabelas_precos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo_ajuste VARCHAR(20) NOT NULL, -- PERCENTUAL, FIXO, SUBSTITUIR
    valor_ajuste DECIMAL(15,2) NOT NULL, -- Valor do ajuste (% ou R$)
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT 1,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vinculação de Tabelas de Preços com Parceiros
CREATE TABLE IF NOT EXISTS tab_tabelas_precos_parceiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_preco_id INTEGER NOT NULL,
    parceiro_id INTEGER NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
    FOREIGN KEY (parceiro_id) REFERENCES par_parceiros(id) ON DELETE CASCADE,
    UNIQUE(tabela_preco_id, parceiro_id)
);

-- Tabela de Histórico de Alterações de Tabelas de Preços
CREATE TABLE IF NOT EXISTS tab_historico_alteracoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_preco_id INTEGER NOT NULL,
    usuario_id INTEGER,
    tipo_alteracao VARCHAR(20) NOT NULL, -- CRIACAO, EDICAO, EXCLUSAO, ATIVACAO, DESATIVACAO
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- ============================================================================
-- MÓDULO DE IMPORTAÇÃO (Prefixo: imp_)
-- ============================================================================

-- Tabela de Importações de Arquivos
CREATE TABLE IF NOT EXISTS imp_arquivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_arquivo VARCHAR(30) NOT NULL, -- XML_VENDA, XML_COMPRA, PLANILHA, OFX
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes INTEGER,
    origem VARCHAR(50), -- MANUAL, EMAIL, API_SEFAZ
    status VARCHAR(30) DEFAULT 'PENDENTE', -- PENDENTE, PROCESSANDO, SUCESSO, ERRO
    total_registros INTEGER DEFAULT 0,
    registros_importados INTEGER DEFAULT 0,
    registros_erro INTEGER DEFAULT 0,
    mensagem_erro TEXT,
    detalhes_processamento TEXT,
    usuario_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    processado_em DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES adm_usuarios(id)
);

-- Tabela de Log de Importação
CREATE TABLE IF NOT EXISTS imp_log_detalhes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    importacao_id INTEGER NOT NULL,
    linha_registro INTEGER,
    tipo_registro VARCHAR(50),
    status VARCHAR(20), -- SUCESSO, ERRO, AVISO
    mensagem TEXT,
    dados_originais TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (importacao_id) REFERENCES imp_arquivos(id) ON DELETE CASCADE
);

-- ============================================================================
-- MÓDULO DE OBJETIVOS E METAS (Prefixo: obj_)
-- ============================================================================

-- Tabela de Objetivos Trimestrais
CREATE TABLE IF NOT EXISTS obj_objetivos_trimestrais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plano_contas_id INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    trimestre INTEGER NOT NULL, -- 1, 2, 3, 4
    meta_trimestral DECIMAL(15,2) NOT NULL,
    realizado_trimestral DECIMAL(15,2) DEFAULT 0,
    percentual_atingido DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_contas_id) REFERENCES fin_plano_contas(id),
    UNIQUE(plano_contas_id, ano, trimestre)
);

-- Tabela de Metas Semanais (distribuição do trimestre)
CREATE TABLE IF NOT EXISTS obj_metas_semanais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    objetivo_trimestral_id INTEGER NOT NULL,
    numero_semana INTEGER NOT NULL, -- 1 a 13 (semanas do trimestre)
    data_inicio_semana DATE NOT NULL,
    data_fim_semana DATE NOT NULL,
    meta_semanal DECIMAL(15,2) NOT NULL,
    realizado_semanal DECIMAL(15,2) DEFAULT 0,
    percentual_atingido DECIMAL(5,2) DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (objetivo_trimestral_id) REFERENCES obj_objetivos_trimestrais(id) ON DELETE CASCADE
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices Módulo Administrativo
CREATE INDEX IF NOT EXISTS idx_adm_funcionarios_cpf ON adm_funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_adm_funcionarios_status ON adm_funcionarios(status);
CREATE INDEX IF NOT EXISTS idx_adm_usuarios_username ON adm_usuarios(username);
CREATE INDEX IF NOT EXISTS idx_adm_usuarios_email ON adm_usuarios(email);

-- Índices Módulo Financeiro
CREATE INDEX IF NOT EXISTS idx_fin_plano_contas_codigo ON fin_plano_contas(codigo_conta);
CREATE INDEX IF NOT EXISTS idx_fin_plano_contas_tipo ON fin_plano_contas(tipo);
CREATE INDEX IF NOT EXISTS idx_fin_plano_contas_pai ON fin_plano_contas(conta_pai_id);
CREATE INDEX IF NOT EXISTS idx_fin_bancos_status ON fin_bancos(status);

-- Índices Movimentação Financeira
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_data ON mov_financeiro(data_movimento);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_tipo ON mov_financeiro(tipo);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_plano ON mov_financeiro(plano_contas_id);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_status ON mov_financeiro(status);
CREATE INDEX IF NOT EXISTS idx_mov_financeiro_competencia ON mov_financeiro(data_competencia);

-- Índices Faturamento
CREATE INDEX IF NOT EXISTS idx_fat_clientes_cpf_cnpj ON fat_clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_fat_nf_chave ON fat_notas_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_fat_nf_cliente ON fat_notas_fiscais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fat_cobrancas_status ON fat_cobrancas(status);
CREATE INDEX IF NOT EXISTS idx_fat_cobrancas_vencimento ON fat_cobrancas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_fat_cobrancas_cliente ON fat_cobrancas(cliente_id);

-- Índices Compras
CREATE INDEX IF NOT EXISTS idx_com_fornecedores_cpf_cnpj ON com_fornecedores(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_com_nf_chave ON com_notas_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_com_nf_fornecedor ON com_notas_fiscais(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_com_pagamentos_status ON com_pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_com_pagamentos_vencimento ON com_pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_com_pagamentos_fornecedor ON com_pagamentos(fornecedor_id);

-- Índices Objetivos
CREATE INDEX IF NOT EXISTS idx_obj_trimestral_ano_tri ON obj_objetivos_trimestrais(ano, trimestre);
CREATE INDEX IF NOT EXISTS idx_obj_trimestral_conta ON obj_objetivos_trimestrais(plano_contas_id);

-- ============================================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ============================================================================

-- View de Fluxo de Caixa Consolidado
CREATE VIEW IF NOT EXISTS vw_fluxo_caixa AS
SELECT
    data_movimento,
    data_competencia,
    tipo,
    plano_contas_id,
    descricao,
    valor,
    banco_id,
    conciliado,
    status
FROM mov_financeiro
WHERE status = 'CONFIRMADO'
ORDER BY data_movimento DESC;

-- View de Contas a Receber em Aberto
CREATE VIEW IF NOT EXISTS vw_contas_receber_aberto AS
SELECT
    c.id,
    c.numero_documento,
    c.descricao,
    cl.nome_fantasia AS cliente,
    cl.cpf_cnpj,
    c.data_emissao,
    c.data_vencimento,
    c.valor_total,
    c.valor_pago,
    c.valor_saldo,
    c.status,
    CASE
        WHEN c.data_vencimento < DATE('now') AND c.status = 'ABERTO' THEN 'VENCIDO'
        ELSE c.status
    END AS status_atual,
    JULIANDAY('now') - JULIANDAY(c.data_vencimento) AS dias_vencido
FROM fat_cobrancas c
INNER JOIN fat_clientes cl ON c.cliente_id = cl.id
WHERE c.status IN ('ABERTO', 'PAGO_PARCIAL', 'VENCIDO')
ORDER BY c.data_vencimento ASC;

-- View de Contas a Pagar em Aberto
CREATE VIEW IF NOT EXISTS vw_contas_pagar_aberto AS
SELECT
    p.id,
    p.numero_documento,
    p.descricao,
    f.nome_fantasia AS fornecedor,
    f.cpf_cnpj,
    p.data_emissao,
    p.data_vencimento,
    p.valor_total,
    p.valor_pago,
    p.valor_saldo,
    p.status,
    CASE
        WHEN p.data_vencimento < DATE('now') AND p.status = 'ABERTO' THEN 'VENCIDO'
        ELSE p.status
    END AS status_atual,
    JULIANDAY('now') - JULIANDAY(p.data_vencimento) AS dias_vencido
FROM com_pagamentos p
INNER JOIN com_fornecedores f ON p.fornecedor_id = f.id
WHERE p.status IN ('ABERTO', 'PAGO_PARCIAL', 'VENCIDO')
ORDER BY p.data_vencimento ASC;

-- View de Saldo de Bancos
CREATE VIEW IF NOT EXISTS vw_saldo_bancos AS
SELECT
    b.id,
    b.codigo_banco,
    b.nome_banco,
    b.agencia,
    b.conta,
    b.tipo_conta,
    b.saldo_inicial,
    b.saldo_atual,
    COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.valor ELSE 0 END), 0) AS total_entradas,
    COALESCE(SUM(CASE WHEN m.tipo = 'SAIDA' THEN m.valor ELSE 0 END), 0) AS total_saidas,
    b.saldo_inicial +
    COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.valor ELSE -m.valor END), 0) AS saldo_calculado
FROM fin_bancos b
LEFT JOIN mov_financeiro m ON b.id = m.banco_id AND m.status = 'CONFIRMADO'
WHERE b.status = 'ATIVO'
GROUP BY b.id, b.codigo_banco, b.nome_banco, b.agencia, b.conta, b.tipo_conta, b.saldo_inicial, b.saldo_atual;

-- ============================================================================
-- TRIGGERS PARA AUTOMATIZAÇÃO
-- ============================================================================

-- Trigger para atualizar saldo de contas a receber
CREATE TRIGGER IF NOT EXISTS trg_atualiza_saldo_cobranca_recebimento
AFTER INSERT ON fat_recebimentos
BEGIN
    UPDATE fat_cobrancas
    SET
        valor_pago = (SELECT COALESCE(SUM(valor_recebido), 0) FROM fat_recebimentos WHERE cobranca_id = NEW.cobranca_id),
        valor_saldo = valor_total - (SELECT COALESCE(SUM(valor_recebido), 0) FROM fat_recebimentos WHERE cobranca_id = NEW.cobranca_id),
        status = CASE
            WHEN (valor_total - (SELECT COALESCE(SUM(valor_recebido), 0) FROM fat_recebimentos WHERE cobranca_id = NEW.cobranca_id)) = 0 THEN 'PAGO'
            WHEN (SELECT COALESCE(SUM(valor_recebido), 0) FROM fat_recebimentos WHERE cobranca_id = NEW.cobranca_id) > 0 THEN 'PAGO_PARCIAL'
            ELSE status
        END,
        data_pagamento = CASE
            WHEN (valor_total - (SELECT COALESCE(SUM(valor_recebido), 0) FROM fat_recebimentos WHERE cobranca_id = NEW.cobranca_id)) = 0 THEN NEW.data_recebimento
            ELSE data_pagamento
        END,
        atualizado_em = CURRENT_TIMESTAMP
    WHERE id = NEW.cobranca_id;
END;

-- Trigger para atualizar saldo de contas a pagar
CREATE TRIGGER IF NOT EXISTS trg_atualiza_saldo_pagamento
AFTER INSERT ON com_baixas_pagamento
BEGIN
    UPDATE com_pagamentos
    SET
        valor_pago = (SELECT COALESCE(SUM(valor_pago), 0) FROM com_baixas_pagamento WHERE pagamento_id = NEW.pagamento_id),
        valor_saldo = valor_total - (SELECT COALESCE(SUM(valor_pago), 0) FROM com_baixas_pagamento WHERE pagamento_id = NEW.pagamento_id),
        status = CASE
            WHEN (valor_total - (SELECT COALESCE(SUM(valor_pago), 0) FROM com_baixas_pagamento WHERE pagamento_id = NEW.pagamento_id)) = 0 THEN 'PAGO'
            WHEN (SELECT COALESCE(SUM(valor_pago), 0) FROM com_baixas_pagamento WHERE pagamento_id = NEW.pagamento_id) > 0 THEN 'PAGO_PARCIAL'
            ELSE status
        END,
        data_pagamento = CASE
            WHEN (valor_total - (SELECT COALESCE(SUM(valor_pago), 0) FROM com_baixas_pagamento WHERE pagamento_id = NEW.pagamento_id)) = 0 THEN NEW.data_pagamento
            ELSE data_pagamento
        END,
        atualizado_em = CURRENT_TIMESTAMP
    WHERE id = NEW.pagamento_id;
END;

-- Trigger para atualizar timestamp de atualização
CREATE TRIGGER IF NOT EXISTS trg_atualiza_timestamp_funcionarios
AFTER UPDATE ON adm_funcionarios
BEGIN
    UPDATE adm_funcionarios SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_atualiza_timestamp_usuarios
AFTER UPDATE ON adm_usuarios
BEGIN
    UPDATE adm_usuarios SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_atualiza_timestamp_plano_contas
AFTER UPDATE ON fin_plano_contas
BEGIN
    UPDATE fin_plano_contas SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
