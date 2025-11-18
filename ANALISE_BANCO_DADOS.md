# ANÁLISE COMPLETA DO BANCO DE DADOS - CristalCar Sistema

## RESUMO EXECUTIVO

### Problemas Identificados
- ✅ **37 tabelas** definidas no schema.sql
- ⚠️ **11 tabelas** criadas apenas nas APIs (não estão no schema)
- 🔴 **2 tabelas** com estruturas completamente diferentes entre schema e implementação
- 🟡 **6 conceitos duplicados** que devem ser unificados
- 🔧 **15+ campos** com nomenclatura inconsistente
- 🚨 **Problemas de exclusão** em Plano de Contas e Departamentos (CORRIGIDO)

### Impacto Crítico
Se o banco for recriado usando apenas `schema.sql`, várias funcionalidades param de funcionar:
- Cadastro de Produtos
- Cadastro de Departamentos
- Indicadores Customizáveis
- Importação de Extratos Bancários
- Tabelas de Preços (itens)

---

## 1. PROBLEMAS CRÍTICOS JÁ CORRIGIDOS

### ✅ Plano de Contas - Coluna compoe_dre
**Problema**: API usava `compoe_dre` mas schema definia `considera_resultado`
**Solução**: Criada função `garantirColunasNecessarias()` que:
- Verifica se coluna existe
- Cria a coluna `compoe_dre` se necessário
- Migra dados de `considera_resultado` se existir
- **Arquivo**: `frontend/app/api/plano-contas/route.js`

### ✅ Logs Detalhados para Debug
**Problema**: Exclusões não funcionavam mas não havia logs
**Solução**: Adicionados logs detalhados em:
- `frontend/app/modules/administrativo/departamentos/page.js`
- `frontend/app/modules/modelos-plano/plano-contas/page.js`
- `frontend/app/api/administrativo/departamentos/route.js`

---

## 2. TABELAS FALTANDO NO SCHEMA (ALTA PRIORIDADE)

### Cadastros Administrativos
#### 1. adm_departamentos
```sql
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
```
**Status**: Criada dinamicamente na API
**Conflito**: Conceito similar a `fin_centro_custo`
**Recomendação**: Unificar ou claramente separar as responsabilidades

#### 2. adm_produtos
```sql
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
```
**Status**: Criada dinamicamente na API
**Uso**: Tabelas de preços, controle de estoque
**Recomendação**: ADICIONAR AO SCHEMA URGENTE

#### 3. adm_log_acoes
```sql
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
```
**Status**: Criada dinamicamente na API
**Conflito**: Similar a `adm_log_acessos`
**Recomendação**: Unificar ou separar claramente (acessos vs ações)

### Financeiro
#### 4. fin_tipos_dre
```sql
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
```
**Status**: Criada dinamicamente na API
**Conflito**: Schema tem `fin_tipos_estrutura_dre` (nome confuso)
**Recomendação**: UNIFICAR - Usar `fin_tipos_dre` (nome mais claro)

### Tabelas de Preços
#### 5. tab_tabelas_precos_itens
```sql
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
```
**Status**: Criada dinamicamente na API
**Recomendação**: ADICIONAR AO SCHEMA URGENTE

### Indicadores
#### 6. ind_indicadores
```sql
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
```
**Status**: Criada dinamicamente na API
**Recomendação**: ADICIONAR AO SCHEMA - Módulo inteiro faltando

### Importação de Extratos
#### 7-9. Módulo de Extratos Bancários
```sql
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
```
**Status**: Criadas dinamicamente na API
**Recomendação**: ADICIONAR AO SCHEMA - Funcionalidade importante

---

## 3. TABELAS COM ESTRUTURAS DIFERENTES (CRÍTICO)

### 🔴 fin_estrutura_dre
**Problema**: Estrutura completamente diferente entre schema e implementação na API

**Schema define**:
- codigo_conta, descricao, tipo, nivel, conta_pai_id, tipo_estrutura_id, ordem_exibicao, formula, exibir_negativo, negrito

**API usa**:
- codigo, nome, tipo_linha, nivel, pai_id, tipo_dre_id, ordem, formula, negativo, editavel, empresa_id

**Impacto**: API recria a tabela inteira com migrações complexas

**Recomendação**:
1. Atualizar schema.sql com estrutura da API (mais completa)
2. Remover lógica de recriação da tabela nas APIs
3. Usar migrations estruturadas

### 🔴 obj_objetivos_trimestrais
**Problema**: Campos diferentes e constraint NOT NULL divergente

**Schema define**:
- plano_contas_id INTEGER NOT NULL
- Campos: ano, trimestre, meta_trimestral, realizado_trimestral, percentual_atingido

**API usa**:
- plano_conta_id INTEGER (NULLABLE)
- Campos adicionais: codigo, empresa_id, tipo_conta, valor_objetivo, descricao

**Impacto**: API faz DROP e CREATE da tabela durante migração

**Recomendação**:
1. Decidir estrutura definitiva (API está mais completa)
2. Atualizar schema.sql
3. Remover lógica de DROP TABLE das APIs

---

## 4. CONCEITOS DUPLICADOS QUE DEVEM SER UNIFICADOS

### 4.1 Departamentos vs Centro de Custo
**Tabelas**:
- `fin_centro_custo` (schema) - 3 campos básicos
- `adm_departamentos` (API) - 7 campos completos

**Diferenças**:
- fin_centro_custo: codigo, descricao, status
- adm_departamentos: codigo, nome, descricao, responsavel_id, empresa_id, status

**Proposta de Unificação**:
```sql
-- Opção 1: Expandir fin_centro_custo
ALTER TABLE fin_centro_custo ADD COLUMN nome VARCHAR(200);
ALTER TABLE fin_centro_custo ADD COLUMN responsavel_id INTEGER;
ALTER TABLE fin_centro_custo ADD COLUMN empresa_id INTEGER;
UPDATE fin_centro_custo SET nome = descricao;

-- Opção 2: Usar adm_departamentos e depreciar fin_centro_custo
-- Migrar todos os registros e atualizar FKs
```

**Recomendação**: **Opção 2** - `adm_departamentos` é mais completo e intuitivo

### 4.2 Tipos de DRE
**Tabelas**:
- `fin_tipos_estrutura_dre` (schema)
- `fin_tipos_dre` (API) ← Nome mais claro

**Proposta**:
- Renomear `fin_tipos_estrutura_dre` → `fin_tipos_dre` no schema
- Atualizar todas as Foreign Keys
- Usar nome mais intuitivo

### 4.3 Vínculos DRE-Plano de Contas
**Tabelas**:
- `fin_dre_plano_contas` (schema)
- `fin_estrutura_dre_vinculos` (API)

**Mesma finalidade**: Vincular linha do DRE com conta contábil

**Proposta**:
- Manter apenas `fin_dre_plano_contas` (nome mais descritivo)
- Remover criação de `fin_estrutura_dre_vinculos` das APIs
- Padronizar uso em todo o código

### 4.4 Logs do Sistema
**Tabelas**:
- `adm_log_acessos` (schema) - Login, logout, navegação
- `adm_log_acoes` (API) - CRUD operations (criar, editar, excluir)
- `adm_configuracao_log` (API) - **OBSOLETO** (migrado para adm_telas)

**Proposta**:
- Manter separado: `adm_log_acessos` para autenticação/navegação
- Adicionar ao schema: `adm_log_acoes` para auditoria de dados
- Remover: `adm_configuracao_log` (já migrado)

### 4.5 Layouts de Importação
**Tabelas**:
- `adm_layouts_importacao` (schema) - Genérico
- `imp_layouts_extrato` (API) - Específico para extratos

**Análise**:
- Propósitos diferentes: genérico vs específico
- Campos diferentes adequados a cada caso

**Recomendação**: Manter separados mas documentar a diferença

### 4.6 Clientes/Fornecedores/Parceiros
**Tabelas**:
- `fat_clientes` (schema)
- `com_fornecedores` (schema)
- `par_parceiros` (schema) ← Unificado

**Status Atual**: Schema já tem conceito unificado em `par_parceiros`

**Recomendação**:
- Manter `par_parceiros` como cadastro principal
- Depreciar `fat_clientes` e `com_fornecedores` em versões futuras
- Criar views para compatibilidade: `CREATE VIEW fat_clientes AS SELECT * FROM par_parceiros WHERE tipo_parceiro LIKE '%CLIENTE%'`

---

## 5. INCONSISTÊNCIAS DE NOMENCLATURA

### 5.1 Nomes de Colunas
| Schema | API | Problema | Proposta |
|--------|-----|----------|----------|
| codigo_banco | codigo | Redundância | Padronizar: `codigo` |
| nome_banco | nome | Redundância | Padronizar: `nome` |
| plano_contas_id | plano_conta_id | Plural vs Singular | Padronizar: `plano_conta_id` (singular) |
| considera_resultado | compoe_dre | Nomes diferentes | Padronizar: `compoe_dre` (mais claro) |
| dias_primeira_parcela | primeira_parcela_dias | Ordem invertida | Padronizar: `dias_primeira_parcela` |

### 5.2 Status vs Ativo
**Problema**: Usado intercambiavelmente
- Algumas tabelas: `status VARCHAR(20)` com valores 'ATIVO', 'INATIVO'
- Outras tabelas: `ativo BOOLEAN` com valores 0, 1

**Proposta**:
- Padronizar em `status VARCHAR(20)`  com valores 'ATIVO', 'INATIVO', 'BLOQUEADO', etc
- Mais flexível para estados futuros

---

## 6. PLANO DE AÇÃO

### FASE 1: Correções Críticas (URGENTE)
1. ✅ Corrigir problema de exclusão em Plano de Contas (FEITO)
2. ✅ Corrigir problema de exclusão em Departamentos (FEITO)
3. ✅ Adicionar coluna `compoe_dre` com migração automática (FEITO)
4. ✅ Adicionar logs detalhados para debug (FEITO)
5. ⏳ Adicionar ao schema.sql as 11 tabelas faltantes
6. ⏳ Atualizar estrutura de `fin_estrutura_dre` no schema
7. ⏳ Atualizar estrutura de `obj_objetivos_trimestrais` no schema

### FASE 2: Unificações (ALTA PRIORIDADE)
8. ⏳ Unificar `fin_centro_custo` e `adm_departamentos`
9. ⏳ Renomear `fin_tipos_estrutura_dre` → `fin_tipos_dre`
10. ⏳ Unificar `fin_dre_plano_contas` e `fin_estrutura_dre_vinculos`
11. ⏳ Remover `adm_configuracao_log` (obsoleto)

### FASE 3: Padronizações (MÉDIA PRIORIDADE)
12. ⏳ Padronizar nomenclatura de colunas
13. ⏳ Padronizar uso de `status` vs `ativo`
14. ⏳ Criar guia de padrões de nomenclatura
15. ⏳ Adicionar índices nas tabelas novas

### FASE 4: Otimizações (BAIXA PRIORIDADE)
16. ⏳ Criar views para compatibilidade (fat_clientes, com_fornecedores)
17. ⏳ Implementar sistema de migrations
18. ⏳ Documentar decisões de arquitetura
19. ⏳ Revisar e otimizar índices existentes

---

## 7. IMPACTO DAS MUDANÇAS

### Alto Impacto (Requer Migração de Dados)
- Unificação de departamentos/centro_custo
- Renomeação de tipos_estrutura_dre
- Padronização de status vs ativo

### Médio Impacto (Requer Update de Queries)
- Padronização de nomenclatura
- Unificação de vínculos DRE

### Baixo Impacto (Apenas Schema)
- Adição de tabelas faltantes ao schema.sql
- Criação de views de compatibilidade

---

## 8. PRÓXIMOS PASSOS

### Imediato (Esta Sessão)
1. Criar branch de desenvolvimento
2. Atualizar schema.sql com tabelas faltantes
3. Testar exclusões no ambiente de desenvolvimento
4. Commit e push das correções

### Curto Prazo (Próxima Semana)
5. Implementar unificações críticas
6. Criar scripts de migração
7. Testar em ambiente de staging

### Médio Prazo (Próximo Mês)
8. Implementar padronizações
9. Documentar arquitetura
10. Criar guias de desenvolvimento

---

## CONCLUSÃO

O sistema possui inconsistências significativas entre o schema definido e as implementações nas APIs. As correções mais críticas já foram implementadas (exclusões e coluna compoe_dre), mas ainda há trabalho importante a fazer para:

1. **Adicionar tabelas faltantes ao schema** - Sem isso, reinicializar o banco quebra o sistema
2. **Unificar conceitos duplicados** - Reduz confusão e melhora manutenibilidade
3. **Padronizar nomenclatura** - Facilita desenvolvimento e reduz erros

**Prioridade**: Começar pela FASE 1 (Correções Críticas) para garantir estabilidade, depois seguir para FASE 2 (Unificações) para melhorar a arquitetura.
