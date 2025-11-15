# CHECKLIST DE CORREÇÕES - CristalCar_Sistema

## PRIORIDADE 1: CRÍTICA (Bloqueia operações)

### [ ] 1. Funcionários - Remover colunas fantasma (POST)
**Arquivo:** `/frontend/app/api/administrativo/funcionarios/route.js`
**Linhas:** 33-35, 37, 60

Remover do INSERT:
```javascript
horario_entrada, 
horario_saida, 
horario_almoco_inicio, 
horario_almoco_fim, 
dias_trabalho
```

Remover dos args:
```javascript
data.horario_entrada || null,
data.horario_saida || null,
data.horario_almoco_inicio || null,
data.horario_almoco_fim || null,
data.dias_trabalho ? data.dias_trabalho.join(',') : null,
```

---

### [ ] 2. Funcionários - Remover colunas fantasma (PUT)
**Arquivo:** `/frontend/app/api/administrativo/funcionarios/[id]/route.js`
**Linhas:** 33-37, 61-64

Mesmo que acima, na rota PUT

---

### [ ] 3. Bancos - Corrigir nomes de coluna (POST)
**Arquivo:** `/frontend/app/api/financeiro/bancos/route.js`
**Linhas:** 29-33

Substituir:
```javascript
// ERRADO:
codigo, nome, nome_completo, site, telefone,
permite_ofx, config_ofx,

// CORRETO:
codigo_banco, nome_banco,
```

Remover dos args as colunas fantasma.

---

### [ ] 4. Bancos - Corrigir nomes de coluna (PUT)
**Arquivo:** `/frontend/app/api/financeiro/bancos/[id]/route.js`
**Linhas:** 16-27

Mudar na query UPDATE:
```javascript
codigo_banco = ?,        // era: codigo
nome_banco = ?,          // era: nome
// REMOVER: nome_completo, site, telefone, permite_ofx, config_ofx, ativo
status = ?,              // era: ativo
atualizado_em = ?        // era: updated_at
```

---

### [ ] 5. Condições de Pagamento - Corrigir nomes (POST)
**Arquivo:** `/frontend/app/api/financeiro/condicoes-pagamento/route.js`
**Linhas:** 30-32

Mudar na query INSERT:
```javascript
quantidade_parcelas,     // era: qtd_parcelas
percentual_acrescimo,    // era: acrescimo_percentual
percentual_desconto,     // era: desconto_percentual
status                   // era: ativo
```

---

### [ ] 6. Condições de Pagamento - Corrigir nomes (PUT)
**Arquivo:** `/frontend/app/api/financeiro/condicoes-pagamento/[id]/route.js`
**Linhas:** 20-24

Mudar na query UPDATE:
```javascript
quantidade_parcelas = ?,     // era: qtd_parcelas
percentual_acrescimo = ?,    // era: acrescimo_percentual
percentual_desconto = ?,     // era: desconto_percentual
status = ?,                  // era: ativo
atualizado_em = ?            // era: updated_at
```

---

### [ ] 7. Regras de Conciliação - Corrigir colunas (POST)
**Arquivo:** `/frontend/app/api/financeiro/regras-conciliacao/route.js`
**Linhas:** 29-31

Na query INSERT, remover:
- `tipo_regra`
- `historico_padrao`
- `aplicacao_automatica`

Mudar:
```javascript
padrao_busca,           // era: texto_busca
plano_contas_id,        // era: conta_id
```

---

### [ ] 8. Regras de Conciliação - Corrigir colunas (PUT)
**Arquivo:** `/frontend/app/api/financeiro/regras-conciliacao/[id]/route.js`
**Linhas:** 19-26

Mesmo que acima, na rota PUT

Mudar:
```javascript
padrao_busca = ?,       // era: texto_busca
plano_contas_id = ?,    // era: conta_id
// REMOVER: tipo_regra, historico_padrao, aplicacao_automatica
atualizado_em = ?       // era: updated_at
```

---

### [ ] 9. Backup Config - Corrigir nome de tabela
**Arquivo:** `/frontend/app/api/backup/config/route.js`

Substituir TODAS as ocorrências de:
```
adm_backup_config  →  adm_configuracao_backup
```

Ocorrências em: linhas 11, 46, 54-65, 86-90

---

### [ ] 10. Backup Executar - Corrigir tabelas e colunas
**Arquivo:** `/frontend/app/api/backup/executar/route.js`

**Linhas 9-31 (TABELAS_BACKUP array):**
```javascript
'adm_perfis_acesso',         // ❌ REMOVER - NÃO EXISTE
'adm_permissoes',       →    'adm_permissoes_modulos'
'adm_logs',             →    'adm_log_acessos'
'fin_movimentacao',     →    'mov_financeiro'
```

**Linhas 85-88 (INSERT no historico):**
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

**Linhas 139-141 (INSERT no catch):**
Mesma correção do INSERT acima

---

## PRIORIDADE 2: ALTA (Falha em operações específicas)

### [ ] 11. Funcionários - Adicionar normalização de texto
**Arquivo:** `/frontend/app/api/administrativo/funcionarios/route.js`

Adicionar no topo:
```javascript
import { normalizarTexto } from '@/lib/text-utils';
```

Adicionar após linha 24 (após `const data = await request.json()`):
```javascript
// Normalizar dados: MAIÚSCULO sem acentos
if (data.nome_completo) data.nome_completo = normalizarTexto(data.nome_completo);
if (data.endereco) data.endereco = normalizarTexto(data.endereco);
if (data.cidade) data.cidade = normalizarTexto(data.cidade);
if (data.cargo) data.cargo = normalizarTexto(data.cargo);
if (data.departamento) data.departamento = normalizarTexto(data.departamento);
```

Fazer o mesmo em `/frontend/app/api/administrativo/funcionarios/[id]/route.js`

---

### [ ] 12. Formas de Pagamento - Adicionar normalização
**Arquivo:** `/frontend/app/api/financeiro/formas-pagamento/route.js`

Adicionar no topo:
```javascript
import { normalizarTexto } from '@/lib/text-utils';
```

Adicionar após `const data = await request.json()`:
```javascript
if (data.descricao) data.descricao = normalizarTexto(data.descricao);
```

Fazer o mesmo em `/frontend/app/api/financeiro/formas-pagamento/[id]/route.js`

---

### [ ] 13. Bancos GET - Corrigir ORDER BY
**Arquivo:** `/frontend/app/api/financeiro/bancos/route.js`
**Linha:** 12

Mudar:
```javascript
// ERRADO:
ORDER BY ativo DESC

// CORRETO:
ORDER BY status DESC
```

---

### [ ] 14. Formas Pagamento GET - Corrigir ORDER BY
**Arquivo:** `/frontend/app/api/financeiro/formas-pagamento/route.js`
**Linha:** 12

Mudar:
```javascript
// ERRADO:
ORDER BY ativo DESC

// CORRETO:
ORDER BY status DESC
```

---

### [ ] 15. Condições Pagamento GET - Corrigir ORDER BY
**Arquivo:** `/frontend/app/api/financeiro/condicoes-pagamento/route.js`
**Linha:** 12

Mudar:
```javascript
// ERRADO:
ORDER BY ativo DESC

// CORRETO:
ORDER BY status DESC
```

---

### [ ] 16. Bancos DELETE - Corrigir tabela fantasma
**Arquivo:** `/frontend/app/api/financeiro/bancos/[id]/route.js`
**Linha:** 61

Mudar:
```javascript
// ERRADO:
SELECT COUNT(*) as count FROM mov_lancamentos_financeiros WHERE banco_id = ?

// CORRETO:
SELECT COUNT(*) as count FROM mov_financeiro WHERE banco_id = ?
```

---

### [ ] 17. Condições Pagamento DELETE - Corrigir tabela fantasma
**Arquivo:** `/frontend/app/api/financeiro/condicoes-pagamento/[id]/route.js`
**Linha:** 59

Mudar:
```javascript
// ERRADO:
SELECT COUNT(*) as count FROM mov_vendas WHERE condicao_pagamento_id = ?

// CORRETO:
// OPÇÃO 1: Remover esta verificação
// OPÇÃO 2: Verificar em fat_cobrancas (se é cliente) e com_pagamentos (se é fornecedor)
```

---

### [ ] 18. Parceiros DELETE - Corrigir tabelas fantasma
**Arquivo:** `/frontend/app/api/parceiros/cadastro/[id]/route.js`
**Linhas:** 101-108

Mudar:
```javascript
// ERRADO:
const checkVendas = await turso.execute({
  sql: 'SELECT COUNT(*) as count FROM mov_vendas WHERE parceiro_id = ?',
  args: [id]
});

const checkCompras = await turso.execute({
  sql: 'SELECT COUNT(*) as count FROM mov_compras WHERE parceiro_id = ?',
  args: [id]
});

// CORRETO:
// Remover estas verificações ou redesenhar a lógica
```

---

### [ ] 19. Tabelas Preço - Adicionar codigo obrigatório
**Arquivo:** `/frontend/app/api/tabelas-precos/cadastro/route.js`

Na linha 34 (antes dos args), adicionar:
```javascript
codigo: data.codigo || `TAB${Date.now()}`,
```

Na query INSERT, adicionar `codigo` na lista de colunas.

Nos args, adicionar:
```javascript
codigo,  // ← ADICIONAR ISTO
```

---

## PRIORIDADE 3: MÉDIA (Inconsistência/Padrão)

### [ ] 20. Bancos [id] PUT - Corrigir timestamp
**Arquivo:** `/frontend/app/api/financeiro/bancos/[id]/route.js`
**Linha:** 28

Mudar:
```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### [ ] 21. Formas Pagamento [id] PUT - Corrigir timestamp
**Arquivo:** `/frontend/app/api/financeiro/formas-pagamento/[id]/route.js`

Verificar se existe `updated_at` e mudar para `atualizado_em`

---

### [ ] 22. Condições Pagamento [id] PUT - Corrigir timestamp
**Arquivo:** `/frontend/app/api/financeiro/condicoes-pagamento/[id]/route.js`
**Linha:** 27

Mudar:
```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### [ ] 23. Regras Conciliação [id] PUT - Corrigir timestamp
**Arquivo:** `/frontend/app/api/financeiro/regras-conciliacao/[id]/route.js`
**Linha:** 27

Mudar:
```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### [ ] 24. Tabelas Preço [id] PUT - Corrigir timestamp
**Arquivo:** `/frontend/app/api/tabelas-precos/cadastro/[id]/route.js`
**Linha:** 24

Mudar:
```javascript
// ERRADO:
updated_at = CURRENT_TIMESTAMP

// CORRETO:
atualizado_em = CURRENT_TIMESTAMP
```

---

### [ ] 25. Condições Pagamento - Adicionar normalização
**Arquivo:** `/frontend/app/api/financeiro/condicoes-pagamento/route.js`

Adicionar normalização para `nome` e `descricao`

---

### [ ] 26. Tabelas Preço - Adicionar normalização
**Arquivo:** `/frontend/app/api/tabelas-precos/cadastro/route.js`

Adicionar normalização para `nome` e `descricao`

---

## EXTRAS: Sincronização de Telas (Recomendado)

### [ ] 27. Sincronizar adm_telas com Sidebar
Decidir se as telas são definidas no banco ou no código, não ambos.

**Opção A:** Usar banco como source of truth
- Atualizar `/frontend/app/components/layout/Sidebar.js` para ler de `GET /api/administrativo/telas`

**Opção B:** Usar código como source of truth
- Adicionar/remover telas do array em `/frontend/app/api/administrativo/telas/route.js`

**Telas para adicionar ao banco:**
- ADM_LAYOUTS (Layouts de Importação)
- ADM_LOGS (Registro de Log)  
- FIN_ESTRUTURA_DRE (Estrutura DRE)
- TAB_HISTORICO (Histórico de Alterações)

---

## TESTE E VALIDAÇÃO

Após cada correção, testar:

```bash
# Testar POST
curl -X POST http://localhost:3000/api/[modulo]/[recurso] \
  -H "Content-Type: application/json" \
  -d '{...dados...}'

# Testar GET
curl http://localhost:3000/api/[modulo]/[recurso]

# Testar PUT
curl -X PUT http://localhost:3000/api/[modulo]/[recurso]/[id] \
  -H "Content-Type: application/json" \
  -d '{...dados...}'

# Testar DELETE
curl -X DELETE http://localhost:3000/api/[modulo]/[recurso]/[id]
```

---

## RASTREAMENTO DE PROGRESSO

- [x] Análise completa realizada
- [ ] Prioridade 1 - 100% completa
- [ ] Prioridade 2 - 100% completa
- [ ] Prioridade 3 - 100% completa
- [ ] Testes executados
- [ ] Code review aprovado
- [ ] Deploy realizado

