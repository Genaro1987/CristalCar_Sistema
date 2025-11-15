# Atualização do Schema - Tabela par_parceiros

## Data: 2025-11-15

## Mudanças Realizadas

O arquivo `src/schema.sql` foi atualizado para refletir a **estrutura real** do banco de dados Turso em produção.

### Tabela: `par_parceiros`

#### ❌ Campos REMOVIDOS (não existiam no banco real):
- `codigo` → substituído por `codigo_unico`
- `cpf_cnpj` → separado em `cnpj` e `cpf`
- `nome` → renomeado para `nome_completo`
- `rg_inscricao_estadual` → separado em `inscricao_estadual` e `rg`
- `site` → renomeado para `website`
- `pix` → separado em `pix_chave` e `pix_tipo`
- `condicao_pagamento_id` → renomeado para `condicao_pagamento_padrao_id`
- `dia_vencimento_padrao` → removido (não existia na estrutura real)

#### ✅ Campos ADICIONADOS (que existiam no banco real):
- `codigo_unico` VARCHAR(20) UNIQUE NOT NULL
- `cnpj` VARCHAR(18) - Para pessoa jurídica
- `cpf` VARCHAR(14) - Para pessoa física
- `nome_completo` VARCHAR(200) - Nome da pessoa física
- `rg` VARCHAR(20) - RG da pessoa física
- `data_nascimento` DATE - Data de nascimento (PF)
- `website` VARCHAR(200) - Site (era `site`)
- `tipo_conta` VARCHAR(20) - Tipo de conta bancária
- `pix_chave` VARCHAR(200) - Chave PIX
- `pix_tipo` VARCHAR(20) - Tipo da chave PIX
- `condicao_pagamento_padrao_id` INTEGER - Condição de pagamento padrão
- `forma_pagamento_padrao_id` INTEGER - Forma de pagamento padrão

#### 🔄 Estrutura Organizada por Seções:

```sql
-- Documentos - PJ (Pessoa Jurídica)
cnpj, razao_social, nome_fantasia, inscricao_estadual, inscricao_municipal

-- Documentos - PF (Pessoa Física)
cpf, nome_completo, rg, data_nascimento

-- Contatos
telefone, celular, email, website

-- Endereço
endereco, numero, complemento, bairro, cidade, estado, cep

-- Informações Comerciais
limite_credito, condicao_pagamento_padrao_id, forma_pagamento_padrao_id, tabela_preco_id

-- Informações Bancárias
banco, agencia, conta, tipo_conta, pix_chave, pix_tipo

-- Controle
status, observacoes, criado_em, atualizado_em
```

## Impacto nas APIs

As APIs já foram corrigidas nos commits anteriores para usar a estrutura correta:

✅ `/api/parceiros` - GET com campos corretos
✅ `/api/parceiros/cadastro` - POST/GET com mapeamento de campos antigos
✅ `/api/parceiros/cadastro/[id]` - PUT/DELETE com mapeamento

## Compatibilidade

As APIs mantêm **compatibilidade retroativa** através de fallbacks:

```javascript
// Exemplo de mapeamento
codigo_unico: data.codigo_unico || data.codigo || `PAR${Date.now()}`
cnpj: data.cnpj || (data.tipo_pessoa === 'JURIDICA' ? data.cpf_cnpj : null)
cpf: data.cpf || (data.tipo_pessoa === 'FISICA' ? data.cpf_cnpj : null)
nome_completo: data.nome_completo || data.nome
website: data.website || data.site
pix_chave: data.pix_chave || data.pix
```

## Foreign Keys Atualizadas

```sql
FOREIGN KEY (condicao_pagamento_padrao_id) REFERENCES fin_condicoes_pagamento(id)
FOREIGN KEY (forma_pagamento_padrao_id) REFERENCES fin_formas_pagamento(id)
FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id)
```

## Próximos Passos

1. ✅ Schema atualizado
2. ✅ APIs corrigidas
3. ✅ Compatibilidade retroativa implementada
4. 🔄 Considerar atualizar frontend para usar novos nomes de campos
5. 🔄 Documentar estrutura para equipe

## Referências

- Commit: fix: Atualizar schema.sql para refletir estrutura real do banco
- Data: 2025-11-15
- Arquivos modificados: `backend/src/schema.sql`
