# DETALHES TÉCNICOS - ANÁLISE DO PROJETO CristalCar

**Gerado em:** 2025-11-19  
**Objetivo:** Documentação técnica para implementação das sugestões

---

## 1. CONSOLIDAÇÃO DE CAMPOS EM `par_parceiros`

### Situação Atual (Problemática)

```sql
-- Tabela atual tem campos redundantes
CREATE TABLE par_parceiros (
  id BIGSERIAL PRIMARY KEY,
  
  -- PROBLEMA 1: 3 campos para CPF/CNPJ
  cpf_cnpj VARCHAR(18),      -- Genérico
  cnpj VARCHAR(18),          -- Específico para PJ
  cpf VARCHAR(18),           -- Específico para PF
  
  -- PROBLEMA 2: 2 campos para inscrição
  rg_inscricao_estadual VARCHAR(20),
  inscricao_estadual VARCHAR(20),
  
  -- PROBLEMA 3: 4 campos para nome
  nome VARCHAR(200),
  razao_social VARCHAR(200),
  nome_fantasia VARCHAR(200),
  nome_completo VARCHAR(200),
  
  -- PROBLEMA 4: 2 campos para website
  website VARCHAR(200),
  site VARCHAR(200),
  
  -- PROBLEMA 5: 2 campos para status
  status VARCHAR(20) DEFAULT 'ATIVO',
  ativo BOOLEAN,
  
  tipo_pessoa VARCHAR(20) NOT NULL,
  ...
);
```

### Solução Proposta

#### Opção A: Manutenção de Compatibilidade (Menos Invasiva)

```sql
-- Migration 003_consolidar_parceiros.sql
BEGIN;

-- 1. Adicionar coluna de controle de migração
ALTER TABLE par_parceiros ADD COLUMN migrado_v2 BOOLEAN DEFAULT FALSE;

-- 2. Criar view de compatibilidade (para código antigo)
CREATE OR REPLACE VIEW par_parceiros_compat AS
SELECT 
  id,
  tipo_pessoa,
  -- Para tipo_pessoa = 'FISICA'
  CASE WHEN tipo_pessoa = 'FISICA' THEN cpf ELSE cpf_cnpj END as cpf_compat,
  CASE WHEN tipo_pessoa = 'JURIDICA' THEN cnpj ELSE cpf_cnpj END as cnpj_compat,
  cpf_cnpj,
  cpf,
  cnpj,
  -- ... outros campos
FROM par_parceiros;

-- 3. Migrar dados (cpf_cnpj para cpf/cnpj baseado em tipo_pessoa)
UPDATE par_parceiros 
SET 
  cpf = CASE WHEN tipo_pessoa = 'FISICA' AND cpf_cnpj IS NOT NULL THEN cpf_cnpj ELSE cpf END,
  cnpj = CASE WHEN tipo_pessoa = 'JURIDICA' AND cpf_cnpj IS NOT NULL THEN cpf_cnpj ELSE cnpj END,
  migrado_v2 = TRUE
WHERE migrado_v2 = FALSE;

-- 4. Consolidar status (usar status VARCHAR)
UPDATE par_parceiros
SET status = CASE WHEN ativo = FALSE THEN 'INATIVO' ELSE 'ATIVO' END
WHERE status IS NULL OR status = '';

-- 5. Consolidar nomes
UPDATE par_parceiros
SET nome_completo = CASE 
    WHEN tipo_pessoa = 'FISICA' AND nome_completo IS NULL THEN nome
    ELSE nome_completo
  END,
  razao_social = CASE
    WHEN tipo_pessoa = 'JURIDICA' AND razao_social IS NULL THEN nome
    ELSE razao_social
  END
WHERE nome IS NOT NULL;

-- 6. Consolidar website
UPDATE par_parceiros
SET website = COALESCE(website, site)
WHERE website IS NULL AND site IS NOT NULL;

COMMIT;
```

#### Opção B: Refatoração Completa (Mais Limpa)

```sql
-- Migration 004_refactor_parceiros_completo.sql
BEGIN;

-- 1. Criar nova tabela com estrutura limpa
CREATE TABLE par_parceiros_v2 (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(20),
  codigo_unico VARCHAR(50),
  
  -- Tipo de pessoa (FISICA ou JURIDICA) - obrigatório
  tipo_pessoa VARCHAR(20) NOT NULL,
  
  -- Identificação fiscal (usar conforme tipo_pessoa)
  cpf VARCHAR(20),           -- Apenas para PF
  cnpj VARCHAR(18),          -- Apenas para PJ
  rg VARCHAR(20),            -- Apenas para PF
  inscricao_estadual VARCHAR(20),  -- Para ambos
  inscricao_municipal VARCHAR(20),
  
  -- Nome (usar conforme tipo_pessoa)
  nome_completo VARCHAR(200),  -- Para PF
  razao_social VARCHAR(200),   -- Para PJ
  nome_fantasia VARCHAR(200),  -- Opcional para PJ
  
  -- Dados de contato
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),  -- Nome único
  
  -- Endereço
  endereco VARCHAR(200),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  pais VARCHAR(50) DEFAULT 'BRASIL',
  
  -- Dados bancários
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  tipo_conta VARCHAR(30),
  pix_chave VARCHAR(120),
  pix_tipo VARCHAR(50),
  
  -- Dados financeiros
  limite_credito NUMERIC(15,2),
  tipo_parceiro VARCHAR(100) NOT NULL,
  
  -- Status (usar apenas um campo)
  status VARCHAR(20) DEFAULT 'ATIVO',  -- ATIVO, INATIVO, SUSPENSO
  
  observacoes TEXT,
  parceiro_criado BOOLEAN,
  empresa_id BIGINT REFERENCES adm_empresa(id),
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Copiar dados da tabela antiga
INSERT INTO par_parceiros_v2 
(id, codigo, codigo_unico, tipo_pessoa, cpf, cnpj, rg, 
 inscricao_estadual, inscricao_municipal, nome_completo, razao_social, 
 nome_fantasia, telefone, celular, email, website, endereco, numero, 
 complemento, bairro, cidade, estado, cep, pais, banco, agencia, conta, 
 tipo_conta, pix_chave, pix_tipo, limite_credito, tipo_parceiro, status, 
 observacoes, parceiro_criado, empresa_id, criado_em, atualizado_em)
SELECT 
  id, codigo, codigo_unico, tipo_pessoa,
  CASE WHEN tipo_pessoa = 'FISICA' THEN COALESCE(cpf, cpf_cnpj) ELSE NULL END,
  CASE WHEN tipo_pessoa = 'JURIDICA' THEN COALESCE(cnpj, cpf_cnpj) ELSE NULL END,
  rg_inscricao_estadual,
  COALESCE(inscricao_estadual, NULLIF(rg_inscricao_estadual, '')),
  inscricao_municipal,
  CASE WHEN tipo_pessoa = 'FISICA' THEN COALESCE(nome_completo, nome) ELSE NULL END,
  CASE WHEN tipo_pessoa = 'JURIDICA' THEN COALESCE(razao_social, nome) ELSE NULL END,
  nome_fantasia,
  telefone, celular, email,
  COALESCE(website, site),
  endereco, numero, complemento, bairro, cidade, estado, cep, pais,
  banco, agencia, conta, tipo_conta, pix_chave, pix_tipo,
  limite_credito, tipo_parceiro,
  CASE WHEN ativo = FALSE THEN 'INATIVO' ELSE status END,
  observacoes, parceiro_criado, empresa_id, criado_em, atualizado_em
FROM par_parceiros;

-- 3. Criar índices na nova tabela
CREATE UNIQUE INDEX idx_parceiros_v2_cpf ON par_parceiros_v2(cpf) 
  WHERE tipo_pessoa = 'FISICA';
CREATE UNIQUE INDEX idx_parceiros_v2_cnpj ON par_parceiros_v2(cnpj) 
  WHERE tipo_pessoa = 'JURIDICA';
CREATE INDEX idx_parceiros_v2_tipo ON par_parceiros_v2(tipo_parceiro);
CREATE INDEX idx_parceiros_v2_empresa ON par_parceiros_v2(empresa_id);
CREATE INDEX idx_parceiros_v2_status ON par_parceiros_v2(status);

-- 4. Renomear tabelas
ALTER TABLE par_parceiros RENAME TO par_parceiros_old;
ALTER TABLE par_parceiros_v2 RENAME TO par_parceiros;

-- 5. Recriar foreign keys que apontam para par_parceiros
-- (Verificar quais tabelas referenciam par_parceiros)

COMMIT;
```

### Validações Necessárias após Consolidação

```sql
-- Verificar duplicatas
SELECT tipo_pessoa, COUNT(*) 
FROM par_parceiros 
GROUP BY tipo_pessoa 
HAVING COUNT(*) > 1;

-- Verificar campos nulos obrigatórios
SELECT id, tipo_pessoa, cpf, cnpj 
FROM par_parceiros 
WHERE (tipo_pessoa = 'FISICA' AND cpf IS NULL)
   OR (tipo_pessoa = 'JURIDICA' AND cnpj IS NULL);

-- Verificar integridade de status
SELECT DISTINCT status FROM par_parceiros;

-- Verificar se website consolidado
SELECT id, website, site FROM par_parceiros 
WHERE site IS NOT NULL LIMIT 10;
```

---

## 2. UNIFICAÇÃO DE TABELAS DE LOG

### Situação Atual

```sql
-- Tabela 1: adm_telas (com logging)
CREATE TABLE adm_telas (
  id BIGSERIAL PRIMARY KEY,
  codigo_tela VARCHAR(50),
  nome_tela VARCHAR(200),
  registrar_log BOOLEAN DEFAULT TRUE,
  registrar_visualizacao BOOLEAN DEFAULT FALSE,
  registrar_inclusao BOOLEAN DEFAULT TRUE,
  registrar_edicao BOOLEAN DEFAULT TRUE,
  registrar_exclusao BOOLEAN DEFAULT TRUE,
  ...
);

-- Tabela 2: adm_configuracao_log (LEGADA - duplicada)
CREATE TABLE adm_configuracao_log (
  id BIGSERIAL PRIMARY KEY,
  modulo VARCHAR(50),
  tela VARCHAR(200),
  registrar_log BOOLEAN DEFAULT TRUE,
  registrar_visualizacao BOOLEAN DEFAULT FALSE,
  registrar_inclusao BOOLEAN DEFAULT TRUE,
  registrar_edicao BOOLEAN DEFAULT TRUE,
  registrar_exclusao BOOLEAN DEFAULT TRUE,
  ...
);
```

### Solução: Migrar para `adm_telas`

```sql
-- Migration 005_unificar_logs.sql
BEGIN;

-- 1. Adicionar coluna para rastrear origem
ALTER TABLE adm_telas ADD COLUMN config_source VARCHAR(20) DEFAULT 'TELAS';

-- 2. Copiar dados da tabela legada
UPDATE adm_telas t1
SET 
  registrar_log = COALESCE(t1.registrar_log, t2.registrar_log),
  registrar_visualizacao = COALESCE(t1.registrar_visualizacao, t2.registrar_visualizacao),
  registrar_inclusao = COALESCE(t1.registrar_inclusao, t2.registrar_inclusao),
  registrar_edicao = COALESCE(t1.registrar_edicao, t2.registrar_edicao),
  registrar_exclusao = COALESCE(t1.registrar_exclusao, t2.registrar_exclusao),
  config_source = 'MIGRADO'
FROM adm_configuracao_log t2
WHERE t1.codigo_tela = t2.tela AND t2.modulo = t1.modulo;

-- 3. Criar índice para campos de logging
CREATE INDEX idx_adm_telas_log ON adm_telas(registrar_log, registrar_inclusao, registrar_edicao);

-- 4. Remover a tabela legada
DROP TABLE adm_configuracao_log;

COMMIT;
```

### Atualizar Rotas que Usam a Tabela Legada

Procurar por referências a `adm_configuracao_log`:

```bash
grep -r "adm_configuracao_log" /home/user/CristalCar_Sistema/frontend/app/api/
```

Arquivos a atualizar:
- `/frontend/app/api/administrativo/logs/route.js`
- Qualquer outro arquivo que leia desta tabela

---

## 3. REMOVER ROTAS DE API DUPLICADAS

### Identificar o Padrão de Cada Rota

```bash
# Verificar conteúdo das rotas antigas
cat /home/user/CristalCar_Sistema/frontend/app/api/plano-contas/route.js
cat /home/user/CristalCar_Sistema/frontend/app/api/tipos-dre/route.js
cat /home/user/CristalCar_Sistema/frontend/app/api/estrutura-dre/route.js

# Comparar com as novas
cat /home/user/CristalCar_Sistema/frontend/app/api/financeiro/plano-contas/route.js
cat /home/user/CristalCar_Sistema/frontend/app/api/modelos-plano/tipos-dre/route.js
cat /home/user/CristalCar_Sistema/frontend/app/api/modelos-plano/estrutura-dre/route.js
```

### Plano de Eliminação

1. **Comparar código** - Verificar se são idênticas
2. **Procurar referências** - Ver se algum lugar ainda usa as antigas
3. **Atualizar imports** - Se houver, apontar para as novas
4. **Testar** - Garantir que tudo funciona
5. **Deletar** - Remover as rotas antigas

---

## 4. CONSOLIDAR CAMPOS EM `adm_empresa`

### Opção de Refatoração Suave

```sql
-- Migration 006_padronizar_empresa.sql
BEGIN;

-- 1. Consolidar campos redundantes
-- cpf_cnpj será preenchido com cnpj se vazio
UPDATE adm_empresa
SET cpf_cnpj = COALESCE(cpf_cnpj, cnpj)
WHERE cpf_cnpj IS NULL AND cnpj IS NOT NULL;

-- 2. Consolidar website/site
UPDATE adm_empresa
SET website = COALESCE(website, site),
    site = NULL
WHERE site IS NOT NULL;

-- 3. Consolidar logo (usar logo_path como principal)
UPDATE adm_empresa
SET logo_path = COALESCE(logo_path, logo_url),
    logo_url = NULL
WHERE logo_url IS NOT NULL;

-- 4. (Opcional) Depois de validação, remover coluna não utilizada
-- ALTER TABLE adm_empresa DROP COLUMN site;
-- ALTER TABLE adm_empresa DROP COLUMN cpf_cnpj;
-- ALTER TABLE adm_empresa DROP COLUMN logo_url;

COMMIT;
```

---

## 5. PÁGINAS ÓRFÃS - ANÁLISE INDIVIDUAL

### `/modules/administrativo/migrar-banco`

```bash
# Verificar se é realmente órfã
grep -r "migrar-banco" /home/user/CristalCar_Sistema/frontend/

# Verificar tamanho/importância
wc -l /home/user/CristalCar_Sistema/frontend/app/modules/administrativo/migrar-banco/page.js
# Resultado: 150 linhas (pequena)

# Decisão: É ferramenta de administração? 
# Opção 1: Adicionar ao menu em "Administrativo > Ferramentas"
# Opção 2: Remover se não utilizada
```

### `/modules/modelos-plano/estrutura-dre` vs `estrutura-dre-editor`

```bash
# Comparar tamanho
wc -l /home/user/CristalCar_Sistema/frontend/app/modules/modelos-plano/estrutura-dre/page.js
# 837 linhas

wc -l /home/user/CristalCar_Sistema/frontend/app/modules/modelos-plano/estrutura-dre-editor/page.js
# 445 linhas

# Verificar diferenças
diff -u estrutura-dre/page.js estrutura-dre-editor/page.js | head -50

# Decisão: Qual é principal?
# Provavelmente estrutura-dre-editor é a nova
# estrutura-dre pode ser removida ou consolidada
```

### `/modules/modelos-plano/planos-padroes`

```bash
# Verificar tamanho/funcionalidade
wc -l /home/user/CristalCar_Sistema/frontend/app/modules/modelos-plano/planos-padroes/page.js
# 515 linhas

# Verificar se está relacionada a outras páginas
grep -r "planos-padroes" /home/user/CristalCar_Sistema/frontend/

# Decisão:
# Se é funcionalidade importante, adicionar ao menu
# Se é WIP, remover ou mover para branch
```

---

## 6. ARQUIVOS E DEPENDÊNCIAS A ATUALIZAR

### Por Tipo de Mudança

#### Consolidação de Campos (par_parceiros)
- [ ] `/frontend/app/modules/parceiros/cadastro/page.js` - Validações
- [ ] `/frontend/app/api/parceiros/route.js` - Queries
- [ ] `/frontend/app/api/parceiros/cadastro/route.js` - POST/PUT
- [ ] `/frontend/app/api/parceiros/cadastro/[id]/route.js` - GET/UPDATE
- [ ] Qualquer seed/fixture de dados
- [ ] Testes

#### Consolidação de Logs
- [ ] `/frontend/app/api/administrativo/logs/route.js` - Query logs
- [ ] Testes de log
- [ ] Documentação

#### Remoção de Rotas Duplicadas
- [ ] Procurar todos os imports das rotas antigas
- [ ] Atualizar para novas rotas
- [ ] Deletar diretórios das rotas antigas
- [ ] Testes

---

## 7. PLANO DE TESTES

### Testes para Consolidação de Dados

```sql
-- Antes de cada migração
BEGIN;
-- Executar migration
-- Validar dados
ROLLBACK; -- Fazer rollback para testar

-- Validações mínimas:
1. COUNT de registros = COUNT anterior
2. Não há dados perdidos
3. Integridade referencial mantida
4. Índices funcionam
5. Queries antigas ainda funcionam (com compatibility layer)
```

### Testes de Regressão Frontend

```javascript
// Testar cada módulo afetado
describe('Parceiros Cadastro', () => {
  it('deve exibir campos corretos para PF', () => {});
  it('deve exibir campos corretos para PJ', () => {});
  it('deve validar CPF para PF', () => {});
  it('deve validar CNPJ para PJ', () => {});
  it('deve consolidar dados no backend', () => {});
});

describe('Logs Administration', () => {
  it('deve ler configurações de adm_telas', () => {});
  it('deve registrar logs corretamente', () => {});
});
```

---

## RESUMO DAS MIGRATIONS

```
001 - Schema Original
002 - Schema Derivado (ATUAL)
003 - Consolidar campos par_parceiros (Opção A - compatível)
004 - Refactor completo par_parceiros (Opção B - mais limpo)
005 - Unificar logs (consolidar adm_configuracao_log em adm_telas)
006 - Padronizar empresa (remover sinônimos)
```

Escolher entre Opção A (compatível) ou Opção B (refactor completo) conforme cronograma.

---

**Documento de Suporte para Implementação**  
Use em conjunto com: `/home/user/CristalCar_Sistema/ANALISE_PROJETO_20251119.md`
