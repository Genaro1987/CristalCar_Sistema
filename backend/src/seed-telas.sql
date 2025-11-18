-- ============================================================================
-- SEED DE TELAS DO SISTEMA CRISTALCAR
-- Data: 2025-11-18
-- Descrição: Cadastro de todas as 27 telas do sistema em adm_telas
-- ============================================================================

-- Limpar telas existentes (apenas em desenvolvimento)
-- DELETE FROM adm_telas;

-- ============================================================================
-- MÓDULO: AJUDA (HELP)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES ('HELP-001', 'Central de Ajuda', 'Central de ajuda e documentação do sistema', 'AJUDA', '/modules/ajuda', 'HelpCircle', 999, 1, 1, 1);

-- ============================================================================
-- MÓDULO: ADMINISTRATIVO (ADM)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('ADM-001', 'Dados da Empresa', 'Cadastro e configuração dos dados da empresa', 'ADMINISTRATIVO', '/modules/administrativo/empresa', 'Building', 10, 1, 1, 1),
('ADM-002', 'Funcionários', 'Cadastro e gestão de funcionários', 'ADMINISTRATIVO', '/modules/administrativo/funcionarios', 'Users', 20, 1, 1, 1),
('ADM-003', 'Layouts de Importação', 'Configuração de layouts para importação de arquivos', 'ADMINISTRATIVO', '/modules/administrativo/layouts', 'FileText', 30, 1, 1, 1),
('ADM-004', 'Backup', 'Configuração e gestão de backups do sistema', 'ADMINISTRATIVO', '/modules/administrativo/backup', 'Database', 40, 1, 1, 1),
('ADM-005', 'Logs do Sistema', 'Visualização de logs e auditoria do sistema', 'ADMINISTRATIVO', '/modules/administrativo/logs', 'FileSearch', 50, 1, 1, 1),
('ADM-006', 'Departamentos', 'Cadastro de departamentos e centros de custo', 'ADMINISTRATIVO', '/modules/administrativo/departamentos', 'Building2', 60, 1, 1, 1),
('ADM-007', 'Produtos', 'Cadastro de produtos e serviços', 'ADMINISTRATIVO', '/modules/administrativo/produtos', 'Package', 70, 1, 1, 1),
('ADM-MIGRATE', 'Migração de Banco', 'Ferramenta de migração e atualização do banco de dados', 'ADMINISTRATIVO', '/modules/administrativo/migrar-banco', 'Database', 999, 0, 0, 1);

-- ============================================================================
-- MÓDULO: FINANCEIRO (FIN)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('FIN-001', 'Plano de Contas', 'Estruturação hierárquica do plano de contas', 'FINANCEIRO', '/modules/modelos-plano/plano-contas', 'TreeStructure', 110, 1, 1, 1),
('FIN-010', 'Formas de Pagamento', 'Cadastro de formas de pagamento', 'FINANCEIRO', '/modules/financeiro/formas-pagamento', 'CreditCard', 120, 1, 1, 1),
('FIN-011', 'Condições de Pagamento', 'Configuração de condições e prazos de pagamento', 'FINANCEIRO', '/modules/financeiro/condicoes-pagamento', 'Calendar', 130, 1, 1, 1),
('FIN-012', 'Bancos e Contas', 'Gestão de contas bancárias', 'FINANCEIRO', '/modules/financeiro/bancos', 'Landmark', 140, 1, 1, 1),
('FIN-013', 'Regras de Conciliação', 'Regras automáticas para conciliação bancária', 'FINANCEIRO', '/modules/financeiro/regras-conciliacao', 'GitBranch', 150, 1, 1, 1);

-- ============================================================================
-- MÓDULO: DRE (Demonstração de Resultado)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('DRE-001', 'Tipos de DRE', 'Gerenciamento de tipos e modelos de DRE', 'DRE', '/modules/modelos-plano/tipos-dre-lista', 'Layers', 210, 1, 1, 1),
('DRE-002', 'Estrutura do DRE', 'Estruturação das linhas e fórmulas do DRE', 'DRE', '/modules/modelos-plano/estrutura-dre', 'Workflow', 220, 1, 1, 1),
('DRE-003', 'Modelos de Plano', 'Modelos padrões de plano de contas', 'DRE', '/modules/modelos-plano/planos-padroes', 'FileStack', 230, 1, 1, 1),
('DRE-004', 'Editor de Estrutura', 'Editor visual de estrutura do DRE', 'DRE', '/modules/modelos-plano/estrutura-dre-editor', 'Edit', 240, 0, 0, 1);

-- ============================================================================
-- MÓDULO: PARCEIROS (PAR)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('PAR-001', 'Cadastro de Parceiros', 'Cadastro unificado de clientes, fornecedores e transportadoras', 'PARCEIROS', '/modules/parceiros/cadastro', 'UserGroup', 310, 1, 1, 1);

-- ============================================================================
-- MÓDULO: TABELAS DE PREÇOS (TAB)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('TAB-001', 'Tabelas de Preços', 'Gestão de tabelas de preços e políticas comerciais', 'TABELAS_PRECOS', '/modules/tabelas-precos/cadastro', 'DollarSign', 410, 1, 1, 1),
('TAB-002', 'Histórico de Alterações', 'Histórico de alterações de preços', 'TABELAS_PRECOS', '/modules/tabelas-precos/historico', 'History', 420, 1, 1, 1),
('CAD-001', 'Itens por Tabela', 'Gestão de itens e preços por tabela', 'TABELAS_PRECOS', '/modules/cadastros/tabelas-precos-itens', 'List', 430, 1, 1, 1);

-- ============================================================================
-- MÓDULO: IMPORTAÇÃO (IMP)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('IMP-001', 'Importação de Extratos', 'Importação de extratos bancários (OFX, CSV)', 'IMPORTACAO', '/modules/importacao/extratos', 'Upload', 510, 1, 1, 1),
('IMP-002', 'Importação XML NF-e', 'Importação de notas fiscais eletrônicas (XML)', 'IMPORTACAO', '/modules/importacao/xml-nfe', 'FileCode', 520, 1, 1, 1);

-- ============================================================================
-- MÓDULO: INDICADORES (IND)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('IND-001', 'Indicadores Customizáveis', 'Criação e gestão de indicadores personalizados', 'INDICADORES', '/modules/indicadores/customizaveis', 'BarChart', 610, 1, 1, 1);

-- ============================================================================
-- MÓDULO: OBJETIVOS (OBJ)
-- ============================================================================

INSERT INTO adm_telas (codigo_tela, nome_tela, descricao, modulo, caminho_tela, icone, ordem_exibicao, exibir_menu, exibir_favoritos, ativo)
VALUES
('OBJ-001', 'Objetivos Trimestrais', 'Definição de objetivos e metas trimestrais', 'OBJETIVOS', '/modules/objetivos/trimestrais', 'Target', 710, 1, 1, 1),
('OBJ-002', 'Metas Semanais', 'Desmembramento semanal dos objetivos', 'OBJETIVOS', '/modules/objetivos/semanais', 'Calendar', 720, 1, 1, 1);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Contar telas inseridas
SELECT 'Total de telas cadastradas: ' || COUNT(*) as resultado FROM adm_telas;

-- Listar todas as telas por módulo
SELECT
    modulo,
    COUNT(*) as total_telas,
    GROUP_CONCAT(codigo_tela, ', ') as codigos
FROM adm_telas
GROUP BY modulo
ORDER BY modulo;
