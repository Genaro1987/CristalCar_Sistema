# ANÁLISE DO BANCO DE DADOS - Versão 2 (Schema Otimizado)

## Objetivo
Reorganizar o schema para manter somente as estruturas usadas pelas APIs/telas atuais, centralizar cadastros e eliminar duplicidades entre banco, API e frontend.

## Principais ajustes
- Consolidado **cadastro central de parceiros** em `par_parceiros`, com views de compatibilidade `fat_clientes` e `com_fornecedores`.
- Padronizado o núcleo financeiro: `fin_plano_contas`, `fin_tipos_dre`, `fin_estrutura_dre`, `fin_dre_plano_contas`, `fin_modelos_dre`, bancos, formas/condições de pagamento e regras de conciliação.
- Movimentações passam a referenciar **departamentos** (`adm_departamentos`) como centro de custo, removendo dependência de tabela obsoleta.
- Incluídas tabelas realmente usadas pelas APIs: importação de XML (imp_nfe_*), extratos bancários, indicadores, objetivos e tabelas de preço (itens/vínculos).
- Eliminadas tabelas sem uso nas rotas atuais (ex.: imp_arquivos, imp_log_detalhes, fin_config_ofx_bancos) e simplificadas seções de faturamento/fornecedores para usar parceiros como fonte única.

## Impacto esperado
- Inicialização consistente via `schema.sql`/`schema-complete.sql` sem recriações ad-hoc nas APIs.
- Menos divergência entre banco e frontend, com FK/nomes alinhados ao código.
- Base pronta para alimentar relatórios (fluxo de caixa) usando tabelas centralizadas e views de compatibilidade.

## Próximos passos sugeridos
1. Garantir migração dos dados existentes para o novo formato (principalmente vínculos de parceiros e plano de contas).
2. Validar APIs de DRE e movimentação após a mudança de colunas (`fin_estrutura_dre` e centros de custo).
3. Atualizar scripts de migração/seed se surgirem novos campos das telas.
