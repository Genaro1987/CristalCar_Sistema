# MAPEAMENTO COMPLETO - TELAS DO CRISTALCAR SISTEMA

Data: 2025-11-18
Status: AUDITORIA COMPLETA REALIZADA

## RESUMO EXECUTIVO

### Números Totais
- **Total de Telas**: 27 páginas
- **APIs Identificadas**: 50+ endpoints
- **Telas com screenCode**: 20 ✅
- **Telas SEM screenCode**: 7 ⚠️
- **Telas com Botão de Ajuda**: 4 (15%) 🔴
- **Telas SEM Botão de Ajuda**: 23 (85%) 🔴

### Problemas Críticos Identificados

🔴 **ALTA PRIORIDADE**:
1. **7 telas sem screenCode definido** - Bloqueiam integração com adm_telas
2. **23 telas sem botão de ajuda** - Experiência do usuário comprometida
3. **1 tela sem API implementada** - Funcionalidade incompleta

---

## TABELA DETALHADA - TODAS AS TELAS

| # | Tela | Código | Caminho | APIs Principais | CRUD | Tabela(s) | Schema? | Ajuda? | Status |
|---|------|--------|---------|----------------|------|-----------|---------|--------|--------|
| 1 | Ajuda | HELP-001 | `/modules/ajuda` | Nenhuma (estática) | R | - | N/A | ✅ Sim | ✅ OK |
| 2 | Empresa | ADM-001 | `/modules/administrativo/empresa` | `/api/administrativo/empresa` | CRU | `adm_empresa` | ✅ Sim | ❌ Não | ✅ OK |
| 3 | Funcionários | ADM-002 | `/modules/administrativo/funcionarios` | `/api/administrativo/funcionarios` | CRUD | `adm_funcionarios` | ✅ Sim | ❌ Não | ✅ OK |
| 4 | Layouts | ADM-003 | `/modules/administrativo/layouts` | `/api/administrativo/layouts` | CRUD | `adm_layouts_importacao` | ✅ Sim | ❌ Não | ✅ OK |
| 5 | Backup | ADM-004 | `/modules/administrativo/backup` | `/api/backup/config` | CRU | `adm_configuracao_backup` | ✅ Sim | ❌ Não | ✅ OK |
| 6 | Logs | ADM-005 | `/modules/administrativo/logs` | `/api/administrativo/logs` | CRU | `adm_log_acoes` | ⚠️ Não | ❌ Não | ⚠️ Tabela não no schema |
| 7 | Departamentos | ADM-006 | `/modules/administrativo/departamentos` | `/api/administrativo/departamentos` | CRUD | `adm_departamentos` | ⚠️ Não | ❌ Não | ⚠️ Tabela não no schema |
| 8 | Produtos | ADM-007 | `/modules/administrativo/produtos` | `/api/administrativo/produtos` | CRUD | `adm_produtos` | ⚠️ Não | ❌ Não | ⚠️ Tabela não no schema |
| 9 | Migrar Banco | ADM-MIGRATE | `/modules/administrativo/migrar-banco` | `/api/database/migrate` | RC | Múltiplas | N/A | ❌ Não | ✅ OK |
| 10 | Plano de Contas | FIN-001 | `/modules/modelos-plano/plano-contas` | `/api/financeiro/plano-contas` | CRUD | `fin_plano_contas` | ✅ Sim | ❌ Não | ✅ OK |
| 11 | Formas Pagamento | FIN-010 | `/modules/financeiro/formas-pagamento` | `/api/financeiro/formas-pagamento` | CRUD | `fin_formas_pagamento` | ✅ Sim | ❌ Não | ✅ OK |
| 12 | Condições Pagamento | FIN-011 | `/modules/financeiro/condicoes-pagamento` | `/api/financeiro/condicoes-pagamento` | CRUD | `fin_condicoes_pagamento` | ✅ Sim | ✅ Sim | ✅ OK |
| 13 | Bancos | FIN-012 | `/modules/financeiro/bancos` | `/api/financeiro/bancos` | CRUD | `fin_bancos` | ✅ Sim | ✅ Sim | ✅ OK |
| 14 | Regras Conciliação | FIN-013 | `/modules/financeiro/regras-conciliacao` | `/api/financeiro/regras-conciliacao` | CRUD | `fin_regras_conciliacao` | ✅ Sim | ✅ Sim | ✅ OK |
| 15 | Parceiros | PAR-001 | `/modules/parceiros/cadastro` | `/api/parceiros/cadastro` | CRUD | `par_parceiros` | ✅ Sim | ✅ Sim | ✅ OK |
| 16 | Tabelas Preços | TAB-001 | `/modules/tabelas-precos/cadastro` | `/api/tabelas-precos/cadastro` | CRUD | `tab_tabelas_precos` | ✅ Sim | ❌ Não | ✅ OK |
| 17 | Itens Tab. Preços | CAD-001 | `/modules/cadastros/tabelas-precos-itens` | `/api/cadastros/tabelas-precos-itens` | CRUD | `tab_tabelas_precos_itens` | ⚠️ Não | ❌ Não | ⚠️ Tabela não no schema |
| 18 | Importação Extratos | IMP-001 | `/modules/importacao/extratos` | `/api/importacao/extratos` | CR | `imp_extratos_bancarios` | ⚠️ Não | ❌ Não | ⚠️ Tabela não no schema |
| 19 | Importação XML NFe | IMP-002 | `/modules/importacao/xml-nfe` | `/api/importacao/xml-nfe` | CRD | `com_notas_fiscais` | ✅ Sim | ❌ Não | ✅ OK |
| 20 | Indicadores | IND-001 | `/modules/indicadores/customizaveis` | `/api/indicadores/customizaveis` | CRUD | `ind_indicadores` | ⚠️ Não | ❌ Não | ⚠️ Tabela não no schema |
| 21 | Objetivos Semanais | ⚠️ SEM CÓDIGO | `/modules/objetivos/semanais` | `/api/objetivos/semanais` | CRUD | `obj_metas_semanais` | ✅ Sim | ❌ Não | 🔴 **SEM screenCode** |
| 22 | Objetivos Trimestrais | ⚠️ SEM CÓDIGO | `/modules/objetivos/trimestrais` | `/api/objetivos/trimestrais` | CRUD | `obj_objetivos_trimestrais` | ✅ Sim | ❌ Não | 🔴 **SEM screenCode** |
| 23 | Histórico Tab. Preços | ⚠️ SEM CÓDIGO | `/modules/tabelas-precos/historico` | `/api/tabelas-precos/historico` | R | `tab_historico_alteracoes` | ✅ Sim | ❌ Não | 🔴 **SEM screenCode** |
| 24 | Tipos DRE Lista | ⚠️ SEM CÓDIGO | `/modules/modelos-plano/tipos-dre-lista` | `/api/modelos-plano/tipos-dre` | R | `fin_tipos_dre` | ⚠️ Não | ❌ Não | 🔴 **SEM screenCode** |
| 25 | Planos Padrões | ⚠️ SEM CÓDIGO | `/modules/modelos-plano/planos-padroes` | ❌ SEM API | - | - | N/A | ❌ Não | 🔴 **SEM API** |
| 26 | Estrutura DRE | ⚠️ SEM CÓDIGO | `/modules/modelos-plano/estrutura-dre` | `/api/modelos-plano/estrutura-dre` | CRUD | `fin_estrutura_dre` | ✅ Sim | ❌ Não | 🔴 **SEM screenCode** |
| 27 | Editor Estrutura DRE | ⚠️ SEM CÓDIGO | `/modules/modelos-plano/estrutura-dre-editor` | `/api/modelos-plano/estrutura-dre` | CRUD | `fin_estrutura_dre` | ✅ Sim | ❌ Não | 🔴 **SEM screenCode** |

---

## ANÁLISE POR MÓDULO

### ADMINISTRATIVO (ADM-) - 9 telas
✅ **Completas**: Empresa, Funcionários, Layouts, Backup, Migrar Banco
⚠️ **Sem schema**: Logs, Departamentos, Produtos
📊 **Botão Ajuda**: 0/9 (0%)

### FINANCEIRO (FIN-) - 5 telas
✅ **Completas**: Plano Contas, Formas Pagamento, Bancos
✅ **Com Ajuda**: Condições Pagamento, Bancos, Regras Conciliação
📊 **Botão Ajuda**: 3/5 (60%)

### PARCEIROS (PAR-) - 1 tela
✅ **Completa**: Parceiros
✅ **Com Ajuda**: Sim
📊 **Botão Ajuda**: 1/1 (100%) ⭐

### TABELAS DE PREÇOS (TAB-/CAD-) - 3 telas
✅ **Completas**: Tabelas Preços
⚠️ **Sem schema**: Itens Tabelas Preços
⚠️ **Sem código**: Histórico Tabelas Preços
📊 **Botão Ajuda**: 0/3 (0%)

### IMPORTAÇÃO (IMP-) - 2 telas
✅ **Completas**: XML NFe
⚠️ **Sem schema**: Extratos Bancários
📊 **Botão Ajuda**: 0/2 (0%)

### INDICADORES (IND-) - 1 tela
⚠️ **Sem schema**: Indicadores
📊 **Botão Ajuda**: 0/1 (0%)

### OBJETIVOS (OBJ-) - 2 telas
🔴 **Sem código**: Semanais, Trimestrais
📊 **Botão Ajuda**: 0/2 (0%)

### MODELOS/PLANO (DRE) - 4 telas
🔴 **Sem código**: Tipos DRE, Planos Padrões, Estrutura DRE, Editor
🔴 **Sem API**: Planos Padrões
⚠️ **Sem schema**: Tipos DRE
📊 **Botão Ajuda**: 0/4 (0%)

---

## PROBLEMAS DETALHADOS

### 🔴 CRÍTICO - Telas sem screenCode (7 telas)
Estas telas NÃO podem ser cadastradas em `adm_telas` sem código:

1. **Objetivos Semanais** - `/modules/objetivos/semanais`
   - **Sugestão**: `OBJ-001`
   - Tabela existe: `obj_metas_semanais`

2. **Objetivos Trimestrais** - `/modules/objetivos/trimestrais`
   - **Sugestão**: `OBJ-002`
   - Tabela existe: `obj_objetivos_trimestrais`

3. **Histórico Tabelas Preços** - `/modules/tabelas-precos/historico`
   - **Sugestão**: `TAB-002`
   - Tabela existe: `tab_historico_alteracoes`

4. **Tipos DRE Lista** - `/modules/modelos-plano/tipos-dre-lista`
   - **Sugestão**: `DRE-001`
   - Tabela: `fin_tipos_dre` (não no schema)

5. **Planos Padrões** - `/modules/modelos-plano/planos-padroes`
   - **Sugestão**: `DRE-002`
   - Status: Página em desenvolvimento, SEM API

6. **Estrutura DRE** - `/modules/modelos-plano/estrutura-dre`
   - **Sugestão**: `DRE-003`
   - Tabela existe: `fin_estrutura_dre`

7. **Editor Estrutura DRE** - `/modules/modelos-plano/estrutura-dre-editor`
   - **Sugestão**: `DRE-004`
   - Tabela existe: `fin_estrutura_dre`

### 🟡 ALTA PRIORIDADE - Tabelas faltando no schema (6 tabelas)
Estas tabelas são criadas apenas nas APIs:

1. `adm_log_acoes` - Logs do sistema
2. `adm_departamentos` - Departamentos
3. `adm_produtos` - Produtos
4. `tab_tabelas_precos_itens` - Itens de tabelas de preços
5. `imp_extratos_bancarios` + `imp_layouts_extrato` + `imp_extrato_linhas` - Módulo de extratos
6. `ind_indicadores` - Indicadores customizáveis

### 🟢 MÉDIA PRIORIDADE - Botões de ajuda faltando (23 telas)
Apenas 4 telas têm botão de ajuda implementado:
- ✅ Parceiros
- ✅ Condições de Pagamento
- ✅ Bancos
- ✅ Regras de Conciliação

**Faltam**: 23 telas (85% do sistema)

---

## INCONSISTÊNCIAS ENCONTRADAS

### Nomenclatura de APIs
- ✅ Padronizado: `/api/administrativo/*`, `/api/financeiro/*`, `/api/parceiros/*`
- ⚠️ Inconsistente:
  - `/api/modelos-plano/*` vs `/api/estrutura-dre` (mesmo módulo, caminhos diferentes) **[CORRIGIDO → `/api/modelos-plano/estrutura-dre`]**
  - `/api/plano-contas` (deveria ser `/api/financeiro/plano-contas`) **[CORRIGIDO]**

### Nomenclatura de Tabelas
- ✅ Padronizado: `adm_`, `fin_`, `par_`, `tab_`, `imp_`, `ind_`, `obj_`
- ⚠️ Inconsistente:
  - `cad_parceiros` vs `par_parceiros` (mesmo conceito)
  - `mod_estrutura_dre` vs `fin_estrutura_dre` (API cria `mod_`, schema tem `fin_`)

### Códigos de Tela
- ✅ Padronizado: `ADM-NNN`, `FIN-NNN`, `PAR-NNN`, `TAB-NNN`, `IMP-NNN`, `IND-NNN`
- ⚠️ Faltam: `OBJ-NNN`, `DRE-NNN` (7 telas sem código)
- ⚠️ Inconsistente: `CAD-001` (deveria ser `TAB-002`)

---

## PLANO DE AÇÃO - ORDEM DE PRIORIDADE

### FASE 1: CORREÇÕES CRÍTICAS (URGENTE)
1. ✅ **Corrigir DELETE real no Plano de Contas** (FEITO)
2. ⏳ **Atribuir screenCodes** às 7 telas sem código
3. ⏳ **Adicionar tabelas faltantes ao schema.sql** (6 tabelas)
4. ⏳ **Padronizar nomenclatura de APIs** (mover plano-contas, estrutura-dre)

### FASE 2: CADASTRO EM adm_telas (ALTA)
5. ⏳ **Criar seeds para adm_telas** com todas as 27 telas
6. ⏳ **Validar códigos únicos** e caminhos corretos
7. ⏳ **Adicionar ícones** para cada tela

### FASE 3: BOTÕES DE AJUDA (ALTA)
8. ⏳ **Criar componente HelpButton** reutilizável
9. ⏳ **Adicionar HelpButton** nas 23 telas faltantes
10. ⏳ **Criar conteúdo de ajuda** para cada tela

### FASE 4: UNIFICAÇÕES DO BANCO (MÉDIA)
11. ⏳ **Unificar** `fin_centro_custo` e `adm_departamentos`
12. ✅ **Renomear** `fin_tipos_estrutura_dre` → `fin_tipos_dre`
13. ⏳ **Unificar** `fin_dre_plano_contas` e `fin_estrutura_dre_vinculos`
14. ⏳ **Padronizar** `cad_parceiros` → `par_parceiros`

### FASE 5: DOCUMENTAÇÃO (MÉDIA)
15. ⏳ **Documentar cada tela** (finalidade, campos, validações)
16. ⏳ **Criar guia de uso** para cada módulo
17. ⏳ **Atualizar README** com estrutura do projeto

### FASE 6: FINALIZAÇÃO (BAIXA)
18. ⏳ **Implementar API** para Planos Padrões
19. ⏳ **Adicionar testes** para APIs críticas
20. ⏳ **Otimizar queries** mais lentas

---

## MÉTRICAS DE QUALIDADE

### Cobertura Atual
- ✅ **APIs implementadas**: 26/27 telas (96%)
- ⚠️ **Tabelas no schema**: 21/27 telas (78%)
- 🔴 **Códigos de tela**: 20/27 telas (74%)
- 🔴 **Botões de ajuda**: 4/27 telas (15%)

### Meta de Qualidade
- 🎯 **APIs implementadas**: 27/27 (100%)
- 🎯 **Tabelas no schema**: 27/27 (100%)
- 🎯 **Códigos de tela**: 27/27 (100%)
- 🎯 **Botões de ajuda**: 27/27 (100%)

---

**Relatório completo gerado em: 2025-11-18**
**Próxima revisão**: Após implementação da FASE 1
