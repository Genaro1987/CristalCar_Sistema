# ANÁLISE COMPLETA - CristalCar_Sistema

## RESUMO EXECUTIVO

Foram identificados **23 problemas críticos** que impedirão o funcionamento correto de várias APIs e módulos do sistema. A maioria dos problemas está relacionada a discrepâncias entre o schema.sql e as queries nas APIs (erros de nome de coluna e tabela).

### Estatísticas
- **Total de arquivos analisados:** 25 rotas de API
- **Problemas críticos encontrados:** 14
- **Problemas de média severidade:** 5
- **Problemas de normalização:** 5
- **Tabelas sem APIs correspondentes:** 16
- **Páginas web faltando:** 12
- **Telas desincronizadas:** 8

---

## SEÇÃO 1: PROBLEMAS CRÍTICOS (Gravidade: ALTA)

### 1.1 - Funcionários: Colunas Inexistentes
**Arquivo:** `/frontend/app/api/administrativo/funcionarios/route.js` (POST)
**Linha:** 33-35
**Severidade:** CRÍTICA - Falha em INSERT/UPDATE

```javascript
// ERRADO:
33: horario_entrada,
34: horario_saida,
35: horario_almoco_inicio,
36: horario_almoco_fim,
60: dias_trabalho
```

**Problema:** Schema NÃO possui estas colunas:
- `horario_entrada` ❌
- `horario_saida` ❌
- `horario_almoco_inicio` ❌
- `horario_almoco_fim` ❌
- `dias_trabalho` ❌

**Impacto:** POST/PUT de funcionários falham com erro SQL
**Solução:** Remover estas 5 colunas das queries

---

### 1.2 - Funcionários: Falta Normalização de Texto
**Arquivo:** `/frontend/app/api/administrativo/funcionarios/route.js` (POST, linhas 22-71)
**Severidade:** ALTA - Dados salvos com inconsistência

**Problema:** 
- API de empresa normaliza texto com `normalizarTexto()`
- API de funcionários NÃO normaliza
- Colunas de texto devem estar em MAIÚSCULAS SEM ACENTOS

**Solução:** Adicionar normalização para campos:
```javascript
import { normalizarTexto } from '@/lib/text-utils';

data.nome_completo = normalizarTexto(data.nome_completo);
data.endereco = normalizarTexto(data.endereco);
data.cidade = normalizarTexto(data.cidade);
data.cargo = normalizarTexto(data.cargo);
data.departamento = normalizarTexto(data.departamento);
```

---

### 1.3 - Bancos: Nomes de Coluna Errados
**Arquivos:**
- `/frontend/app/api/financeiro/bancos/route.js` (POST, linhas 29-33)
- `/frontend/app/api/financeiro/bancos/[id]/route.js` (PUT, linhas 16-27)

**Severidade:** CRÍTICA - Falha em INSERT/UPDATE

| Coluna na API | Coluna Correta | Tipo |
|---|---|---|
| `codigo` | `codigo_banco` | VARCHAR(10) |
| `nome` | `nome_banco` | VARCHAR(100) |
| `nome_completo` | ❌ NÃO EXISTE | - |
| `site` | ❌ NÃO EXISTE | - |
| `telefone` | ❌ NÃO EXISTE | - |
| `permite_ofx` | ❌ NÃO EXISTE | - |
| `config_ofx` | ❌ NÃO EXISTE | - |
| `ativo` | `status` | VARCHAR(20) |

**Problema Adicional - GET:**
```javascript
// Linha 12 - ERRADO:
ORDER BY ativo DESC

// CORRETO:
ORDER BY status DESC
```

**Impacto:** 
- Impossível criar/atualizar bancos
- GET retorna erro ao tentar ordenar por coluna inexistente

---

### 1.4 - Condições de Pagamento: Nomes de Coluna Errados
**Arquivos:**
- `/frontend/app/api/financeiro/condicoes-pagamento/route.js` (POST, linhas 30-32)
- `/frontend/app/api/financeiro/condicoes-pagamento/[id]/route.js` (PUT, linhas 20-24)

**Severidade:** CRÍTICA - Falha em INSERT/UPDATE

| Coluna na API | Coluna Correta | Motivo |
|---|---|---|
| `qtd_parcelas` | `quantidade_parcelas` | Schema define assim |
| `acrescimo_percentual` | `percentual_acrescimo` | Schema define assim |
| `desconto_percentual` | `percentual_desconto` | Schema define assim |
| `ativo` | `status` | Schema usa VARCHAR(20) |
| `updated_at` | `atualizado_em` | Padrão do projeto |

**Problema Adicional - GET:**
```javascript
// Linha 12 - ERRADO:
ORDER BY ativo DESC

// CORRETO:
ORDER BY status DESC
```

---

### 1.5 - Regras de Conciliação: Colunas Estruturalmente Erradas
**Arquivos:**
- `/frontend/app/api/financeiro/regras-conciliacao/route.js` (POST, linhas 29-31)
- `/frontend/app/api/financeiro/regras-conciliacao/[id]/route.js` (PUT, linhas 19-26)

**Severidade:** CRÍTICA - Falha em INSERT/UPDATE

| Coluna na API | Coluna Correta | Status |
|---|---|---|
| `tipo_regra` | ❌ NÃO EXISTE | Campo descartado |
| `texto_busca` | `padrao_busca` | EXISTE |
| `conta_id` | `plano_contas_id` | Foreign key incorreta |
| `historico_padrao` | ❌ NÃO EXISTE | Campo descartado |
| `aplicacao_automatica` | ❌ NÃO EXISTE | Campo descartado |
| `ativo` | `ativo` | OK ✓ |
| `updated_at` | `atualizado_em` | Padrão do projeto |

**Impacto:** Impossível criar/atualizar regras de conciliação

---

### 1.6 - Backup Config: Tabela com Nome Errado
**Arquivo:** `/frontend/app/api/backup/config/route.js`

**Severidade:** CRÍTICA - Toda a rota falha

**Problema:**
- API referencia: `adm_backup_config`
- Schema define: `adm_configuracao_backup`

**Linhas afetadas:** 11, 46, 54-65, 86-90

**Impacto:** GET/POST de configuração de backup falham

---

### 1.7 - Backup Executar: Múltiplas Tabelas com Nomes Errados
**Arquivo:** `/frontend/app/api/backup/executar/route.js`

**Severidade:** ALTA - Backup incompleto/falha

**Tabelas Erradas:**
| Tabela na API | Tabela Correta | Linhas |
|---|---|---|
| `adm_perfis_acesso` | ❌ NÃO EXISTE | 15 |
| `adm_permissoes` | `adm_permissoes_modulos` | 16 |
| `adm_logs` | `adm_log_acessos` | 20 |
| `fin_movimentacao` | `mov_financeiro` | 30 |

**Impacto:** Backup executa parcialmente, deixando tabelas sem backup

**Colunas Erradas (linhas 85-88, 139-141):**
```javascript
// ERRADO:
INSERT INTO adm_historico_backup (
  data_backup, status, tipo_backup, local_arquivo,
  tamanho_arquivo_bytes, tempo_execucao_segundos, mensagem_erro
)

// CORRETO:
INSERT INTO adm_historico_backup (
  data_backup, status, tipo_backup, caminho_completo,
  tamanho_bytes, tempo_execucao, mensagem_erro
)
```

---

### 1.8 - Tabelas de Preço: Falta Campo Obrigatório
**Arquivo:** `/frontend/app/api/tabelas-precos/cadastro/route.js` (POST, linha 33)

**Severidade:** ALTA - Falha em INSERT

**Problema:**
- Schema define: `codigo VARCHAR(20) UNIQUE NOT NULL`
- API não insere `codigo`

**Impacto:** INSERT falha porque coluna obrigatória não é fornecida

**Solução:**
```javascript
// Linha 33-37, adicionar:
codigo: data.codigo || `TAB${Date.now()}`,

// E na query INSERT (linha 34):
INSERT INTO tab_tabelas_precos (
  codigo,    // ← ADICIONAR ISTO
  nome, descricao, tipo_ajuste, valor_ajuste,
  data_inicio, data_fim,
  observacoes, ativo
)
```

---

### 1.9 - Bancos [id] PUT: Coluna Timestamp Errada
**Arquivo:** `/frontend/app/api/financeiro/bancos/[id]/route.js` (PUT, linha 28)

**Severidade:** MÉDIA - UPDATE falha silenciosamente

```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### 1.10 - Condições de Pagamento [id] PUT: Coluna Timestamp Errada
**Arquivo:** `/frontend/app/api/financeiro/condicoes-pagamento/[id]/route.js` (PUT, linha 27)

**Severidade:** MÉDIA - UPDATE falha silenciosamente

```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### 1.11 - Regras Conciliação [id] PUT: Coluna Timestamp Errada
**Arquivo:** `/frontend/app/api/financeiro/regras-conciliacao/[id]/route.js` (PUT, linha 27)

**Severidade:** MÉDIA - UPDATE falha silenciosamente

```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### 1.12 - Tabelas Preço [id] PUT: Coluna Timestamp Errada
**Arquivo:** `/frontend/app/api/tabelas-precos/cadastro/[id]/route.js` (PUT, linha 24)

**Severidade:** MÉDIA - UPDATE falha silenciosamente

```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### 1.13 - Parceiros: Tabelas Fantasma em DELETE
**Arquivo:** `/frontend/app/api/parceiros/cadastro/[id]/route.js` (DELETE, linhas 101-108)

**Severidade:** ALTA - Validação falha

```javascript
// ERRADO - Tabelas não existem:
SELECT COUNT(*) as count FROM mov_vendas WHERE parceiro_id = ?
SELECT COUNT(*) as count FROM mov_compras WHERE parceiro_id = ?
```

**Problema:**
- `mov_vendas` não existe no schema
- `mov_compras` não existe no schema

**Impacto:** DELETE sempre falha com erro 'tabela não encontrada'

**Solução:** Remover estas verificações ou ajustar lógica de validação

---

### 1.14 - Bancos [id] DELETE: Tabela Fantasma
**Arquivo:** `/frontend/app/api/financeiro/bancos/[id]/route.js` (DELETE, linha 61)

**Severidade:** ALTA - Validação falha

```javascript
// ERRADO - Tabela não existe:
SELECT COUNT(*) as count FROM mov_lancamentos_financeiros WHERE banco_id = ?

// CORRETO:
SELECT COUNT(*) as count FROM mov_financeiro WHERE banco_id = ?
```

**Impacto:** DELETE sempre falha

---

## SEÇÃO 2: COMPARATIVO DE TELAS

### Telas Definidas no Banco (adm_telas - 24 telas)

```
ADMINISTRATIVO (4):
  ✓ ADM_EMPRESA → /modules/administrativo/empresa
  ✓ ADM_FUNCIONARIOS → /modules/administrativo/funcionarios
  ❌ ADM_USUARIOS → /modules/administrativo/usuarios (página não existe)
  ✓ ADM_BACKUP → /modules/administrativo/backup

FINANCEIRO (6):
  ✓ FIN_PLANO_CONTAS → /modules/financeiro/plano-contas
  ✓ FIN_BANCOS → /modules/financeiro/bancos
  ✓ FIN_FORMAS_PAGAMENTO → /modules/financeiro/formas-pagamento
  ✓ FIN_CONDICOES_PAGAMENTO → /modules/financeiro/condicoes-pagamento
  ❌ FIN_MOVIMENTACAO → /modules/financeiro/movimentacao (página não existe)
  ❌ FIN_CONCILIACAO → /modules/financeiro/conciliacao (página não existe)

PARCEIROS (2):
  ✓ PAR_CADASTRO → /modules/parceiros/cadastro
  ❌ PAR_CONSULTA → /modules/parceiros/consulta (página não existe)

FATURAMENTO (3):
  ❌ FAT_CLIENTES → /modules/faturamento/clientes (página não existe)
  ❌ FAT_NOTAS_FISCAIS → /modules/faturamento/notas-fiscais (página não existe)
  ❌ FAT_COBRANCAS → /modules/faturamento/cobrancas (página não existe)

COMPRAS (3):
  ❌ COM_FORNECEDORES → /modules/compras/fornecedores (página não existe)
  ❌ COM_NOTAS_FISCAIS → /modules/compras/notas-fiscais (página não existe)
  ❌ COM_PAGAMENTOS → /modules/compras/pagamentos (página não existe)

TABELAS (1):
  ✓ TAB_PRECOS → /modules/tabelas-precos/cadastro

OBJETIVOS (1):
  ❌ OBJ_TRIMESTRAL → /modules/objetivos/trimestral (página não existe)

RELATORIOS (2):
  ❌ REL_DRE → /modules/relatorios/dre (página não existe)
  ❌ REL_FLUXO_CAIXA → /modules/relatorios/fluxo-caixa (página não existe)
```

### Telas no Menu (Sidebar.js - 13 telas)

```
ADMINISTRATIVO:
  ✓ Cadastro da Empresa
  ✓ Funcionários
  ❌ Layouts de Importação (não registrada no banco)
  ✓ Configuração de Backup
  ❌ Registro de Log (não registrada no banco)

MODELOS DE PLANO:
  ✓ Plano de Contas
  ❌ Estrutura DRE (não registrada no banco)

FINANCEIRO:
  ✓ Formas de Pagamento
  ✓ Condições de Pagamento
  ✓ Cadastro de Bancos
  ✓ Regras de Conciliação

PARCEIROS:
  ✓ Cadastro de Parceiros

TABELAS DE PREÇOS:
  ✓ Tabelas de Preços
  ✓ Histórico de Alterações
```

### Discrepâncias Encontradas

**12 Telas no banco mas NÃO no menu:**
- ADM_USUARIOS
- FIN_MOVIMENTACAO
- FIN_CONCILIACAO
- PAR_CONSULTA
- FAT_CLIENTES, FAT_NOTAS_FISCAIS, FAT_COBRANCAS
- COM_FORNECEDORES, COM_NOTAS_FISCAIS, COM_PAGAMENTOS
- OBJ_TRIMESTRAL
- REL_DRE, REL_FLUXO_CAIXA

**4 Telas no menu mas NÃO no banco:**
- ADM_LAYOUTS (Layouts de Importação)
- ADM_LOGS (Registro de Log)
- FIN_ESTRUTURA_DRE (Estrutura DRE)
- TAB_HISTORICO (Histórico de Alterações)

---

## SEÇÃO 3: TABELAS DO SCHEMA SEM APIs CORRESPONDENTES

### 16 Tabelas sem rotas de cadastro:

1. **fat_clientes** - Clientes não tem API
2. **fat_notas_fiscais** - Notas Fiscais de Venda não tem API
3. **fat_cobrancas** - Contas a Receber não tem API
4. **fat_recebimentos** - Recebimentos não tem API
5. **com_fornecedores** - Fornecedores não tem API
6. **com_notas_fiscais** - Notas Fiscais de Compra não tem API
7. **com_pagamentos** - Contas a Pagar não tem API
8. **com_baixas_pagamento** - Baixas de Pagamento não tem API
9. **fin_estrutura_dre** - Estrutura DRE não tem API
10. **fin_dre_plano_contas** - Vinculação DRE x Plano não tem API
11. **fin_centro_custo** - Centro de Custo não tem API
12. **fin_config_ofx_bancos** - Configuração OFX não tem API
13. **obj_objetivos_trimestrais** - Objetivos Trimestrais não tem API
14. **obj_metas_semanais** - Metas Semanais não tem API
15. **imp_arquivos** - Importações não tem API
16. **imp_log_detalhes** - Log de Importação não tem API

---

## SEÇÃO 4: FALTA DE NORMALIZAÇÃO DE TEXTO

### APIs SEM Normalização de Texto

1. **Funcionários** (`/frontend/app/api/administrativo/funcionarios/route.js`)
   - Campos: nome_completo, endereco, cidade, cargo, departamento
   
2. **Bancos** (`/frontend/app/api/financeiro/bancos/route.js`)
   - Campos: nome_banco
   
3. **Formas de Pagamento** (`/frontend/app/api/financeiro/formas-pagamento/route.js`)
   - Campos: descricao
   
4. **Condições de Pagamento** (`/frontend/app/api/financeiro/condicoes-pagamento/route.js`)
   - Campos: nome, descricao
   
5. **Tabelas de Preço** (`/frontend/app/api/tabelas-precos/cadastro/route.js`)
   - Campos: nome, descricao

---

## SEÇÃO 5: RESUMO DE CORREÇÕES REQUERIDAS

| # | Arquivo | Tipo | Linhas | Ação | Gravidade |
|---|---|---|---|---|---|
| 1 | funcionarios/route.js | POST | 33-35 | Remover 5 colunas inexistentes | CRÍTICA |
| 2 | funcionarios/route.js | POST | 22-71 | Adicionar normalização de texto | ALTA |
| 3 | funcionarios/[id]/route.js | PUT | 33-37 | Remover 5 colunas inexistentes | CRÍTICA |
| 4 | bancos/route.js | GET | 12 | Mudar ORDER BY ativo → status | MÉDIA |
| 5 | bancos/route.js | POST | 29-33 | Corrigir 4 nomes + 3 colunas fantasma | CRÍTICA |
| 6 | bancos/[id]/route.js | PUT | 16-27 | Corrigir 4 nomes + 3 colunas fantasma | CRÍTICA |
| 7 | bancos/[id]/route.js | PUT | 28 | Corrigir updated_at → atualizado_em | MÉDIA |
| 8 | bancos/[id]/route.js | DELETE | 61 | Corrigir tabela fantasma | ALTA |
| 9 | formas-pagamento/route.js | GET | 12 | Mudar ORDER BY ativo → status | MÉDIA |
| 10 | formas-pagamento/route.js | POST | 22-41 | Adicionar normalização | ALTA |
| 11 | formas-pagamento/[id]/route.js | PUT | 22 | Corrigir ativo → status | MÉDIA |
| 12 | condicoes-pagamento/route.js | GET | 12 | Mudar ORDER BY ativo → status | MÉDIA |
| 13 | condicoes-pagamento/route.js | POST | 30-32 | Corrigir 3 nomes + status | CRÍTICA |
| 14 | condicoes-pagamento/[id]/route.js | PUT | 20-27 | Corrigir 3 nomes + status | CRÍTICA |
| 15 | condicoes-pagamento/[id]/route.js | PUT | 27 | Corrigir updated_at → atualizado_em | MÉDIA |
| 16 | condicoes-pagamento/[id]/route.js | DELETE | 59 | Corrigir tabela fantasma | ALTA |
| 17 | regras-conciliacao/route.js | POST | 29-31 | Remover 3 + corrigir 2 colunas | CRÍTICA |
| 18 | regras-conciliacao/[id]/route.js | PUT | 19-26 | Remover 3 + corrigir 2 colunas | CRÍTICA |
| 19 | regras-conciliacao/[id]/route.js | PUT | 27 | Corrigir updated_at → atualizado_em | MÉDIA |
| 20 | backup/config/route.js | ALL | 11+ | Mudar tabela adm_backup_config | CRÍTICA |
| 21 | backup/executar/route.js | POST | 15-20,85-88 | Corrigir 4 tabelas + 3 colunas | CRÍTICA |
| 22 | tabelas-precos/cadastro/route.js | POST | 34 | Adicionar codigo (obrigatório) | ALTA |
| 23 | tabelas-precos/cadastro/[id]/route.js | PUT | 24 | Corrigir updated_at → atualizado_em | MÉDIA |
| 24 | parceiros/cadastro/[id]/route.js | DELETE | 101-108 | Corrigir tabelas fantasma | ALTA |

---

## PRIORIDADE DE CORREÇÃO

### Prioridade 1 (Crítico - Bloqueia funcionamento - 8 itens)
- [ ] Funcionários: remover colunas fantasma (route.js + [id]/route.js)
- [ ] Bancos: corrigir nomes de coluna (route.js + [id]/route.js)
- [ ] Condições de Pagamento: corrigir nomes de coluna
- [ ] Regras de Conciliação: corrigir colunas fantasma
- [ ] Backup Config: corrigir nome de tabela
- [ ] Backup Executar: corrigir tabelas e colunas

### Prioridade 2 (Alto - Falha em operações específicas - 7 itens)
- [ ] Funcionários: adicionar normalização de texto
- [ ] Formas Pagamento: adicionar normalização
- [ ] Bancos [id] DELETE: corrigir tabela fantasma
- [ ] Condicoes [id] DELETE: corrigir tabela fantasma
- [ ] Parceiros DELETE: corrigir tabelas fantasma
- [ ] Tabelas Preço: adicionar codigo obrigatório
- [ ] GET de Bancos: corrigir ORDER BY

### Prioridade 3 (Médio - Inconsistência/Redundância - 8 itens)
- [ ] Corrigir todas as colunas atualizado_em (updated_at) - 4 arquivos
- [ ] Adicionar normalização em Condições Pagamento e Tabelas Preço
- [ ] Corrigir ORDER BY em GETs (Formas Pagamento, Condições Pagamento)

---

## RECOMENDAÇÕES GERAIS

1. **Implementar validação de schema**: Adicionar testes automatizados que verificam se colunas/tabelas referenciadas existem
2. **Centralizar normalização**: Usar decorator ou middleware que normaliza todos os campos de texto automaticamente
3. **Sincronizar adm_telas com Sidebar**: Manter um único ponto de verdade para telas do sistema
4. **Implementar páginas faltantes**: 15+ páginas estão definidas no banco mas não existem no frontend
5. **Revisar colunas fantasma**: Remover referências a colunas que nunca foram implementadas (permite_ofx, config_ofx, etc)
6. **Documentação de API**: Manter documentação sincronizada com schema

---

**Documento gerado em:** 2025-11-15
**Análise realizada em:** /home/user/CristalCar_Sistema

