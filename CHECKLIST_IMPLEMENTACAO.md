# CHECKLIST DE IMPLEMENTAÇÃO - REFATORAÇÃO DO PROJETO

**Status:** Pronto para implementação  
**Data:** 2025-11-19  
**Responsável:** Desenvolvedor Backend e Frontend

---

## FASE 1: ANÁLISE DE IMPACTO (1-2 horas)

- [ ] Revisar documento completo: `ANALISE_PROJETO_20251119.md`
- [ ] Revisar guia técnico: `DETALHES_TECNICOS_ANALISE.md`
- [ ] Reunião com equipe para discutir prioridades
- [ ] Decidir entre Opção A (compatível) vs Opção B (refactor completo) para par_parceiros
- [ ] Listar todas as APIs que dependem de `adm_configuracao_log`
  ```bash
  grep -r "adm_configuracao_log" /home/user/CristalCar_Sistema/frontend/app/
  ```
- [ ] Comparar `estrutura-dre` vs `estrutura-dre-editor`
  ```bash
  diff -u /home/user/CristalCar_Sistema/frontend/app/modules/modelos-plano/estrutura-dre/page.js \
          /home/user/CristalCar_Sistema/frontend/app/modules/modelos-plano/estrutura-dre-editor/page.js
  ```
- [ ] Definir se páginas órfãs serão mantidas, removidas ou adicionadas ao menu

---

## FASE 2: CONSOLIDAÇÃO DE CAMPOS EM par_parceiros (4-8 horas)

### 2.1 Preparação

- [ ] Criar branch: `feature/consolidar-parceiros`
- [ ] Fazer backup do banco de dados
- [ ] Verificar quantidade de registros:
  ```sql
  SELECT COUNT(*) FROM par_parceiros;
  SELECT tipo_pessoa, COUNT(*) FROM par_parceiros GROUP BY tipo_pessoa;
  ```

### 2.2 Criar Migrations (escolher A ou B)

#### Opção A: Compatível (menor risco)
- [ ] Criar arquivo: `db/migrations/003_consolidar_parceiros_opcao_a.sql`
- [ ] Incluir script de consolidação de cpf/cnpj
- [ ] Incluir script de consolidação de nomes
- [ ] Incluir script de consolidação de website/site
- [ ] Incluir script de consolidação de status

#### Opção B: Refactor Completo (melhor código)
- [ ] Criar arquivo: `db/migrations/003_consolidar_parceiros_opcao_b.sql`
- [ ] Criar nova tabela `par_parceiros_v2`
- [ ] Migrar dados com transformações
- [ ] Criar índices
- [ ] Renomear tabelas

### 2.3 Testar Migrations (CRÍTICO)

- [ ] Executar migração em banco de testes
- [ ] Rodar validações:
  ```sql
  -- Verificar integridade
  SELECT COUNT(*) FROM par_parceiros WHERE tipo_pessoa = 'FISICA' AND cpf IS NULL;
  SELECT COUNT(*) FROM par_parceiros WHERE tipo_pessoa = 'JURIDICA' AND cnpj IS NULL;
  
  -- Verificar status consolidado
  SELECT DISTINCT status FROM par_parceiros;
  
  -- Verificar website consolidado
  SELECT COUNT(*) FROM par_parceiros WHERE site IS NOT NULL;
  ```
- [ ] Verificar foreign keys
- [ ] Verificar performance de queries
- [ ] Fazer rollback e testar novamente

### 2.4 Atualizar Frontend

- [ ] Atualizar `/frontend/app/modules/parceiros/cadastro/page.js`
  - [ ] Validações de CPF (apenas para PF)
  - [ ] Validações de CNPJ (apenas para PJ)
  - [ ] Remover referências a `cpf_cnpj`
  - [ ] Usar condicionalmente nome_completo ou razao_social
- [ ] Atualizar `/frontend/app/api/parceiros/route.js`
  - [ ] Queries para usar cpf/cnpj corretos
  - [ ] Filtros por tipo_pessoa
- [ ] Atualizar `/frontend/app/api/parceiros/cadastro/route.js`
  - [ ] POST: validar e preencher cpf/cnpj corretos
  - [ ] PUT: manter tipos de dados corretos
- [ ] Atualizar `/frontend/app/api/parceiros/cadastro/[id]/route.js`
  - [ ] GET: retornar campos corretos
  - [ ] PATCH/PUT: validar atualização

### 2.5 Testar Integração

- [ ] Teste unitário: Validações de CPF
- [ ] Teste unitário: Validações de CNPJ
- [ ] Teste E2E: Criar parceiro PF
- [ ] Teste E2E: Criar parceiro PJ
- [ ] Teste E2E: Editar parceiro
- [ ] Teste E2E: Filtrar parceiros
- [ ] Verificar se relatórios funcionam

### 2.6 Deploy

- [ ] Executar migração em staging
- [ ] Executar testes em staging
- [ ] Executar migração em produção
- [ ] Monitorar logs

---

## FASE 3: CONSOLIDAÇÃO DE LOGS (2-4 horas)

### 3.1 Análise

- [ ] Procurar todas referências a `adm_configuracao_log`:
  ```bash
  grep -r "adm_configuracao_log" /home/user/CristalCar_Sistema/
  ```
- [ ] Listar APIs que consultam essa tabela
- [ ] Verificar se há dados em `adm_configuracao_log`
  ```sql
  SELECT COUNT(*) FROM adm_configuracao_log;
  ```

### 3.2 Criar Migration

- [ ] Criar arquivo: `db/migrations/004_unificar_logs.sql`
  - [ ] Copiar dados para `adm_telas`
  - [ ] Deletar tabela `adm_configuracao_log`
  - [ ] Criar índices em `adm_telas`

### 3.3 Atualizar APIs

- [ ] Atualizar `/frontend/app/api/administrativo/logs/route.js`
  - [ ] Remover queries a `adm_configuracao_log`
  - [ ] Usar `adm_telas` como fonte de configuração
- [ ] Procurar outras rotas que possam usar a tabela legada:
  ```bash
  grep -r "adm_configuracao_log" /home/user/CristalCar_Sistema/frontend/app/api/
  ```
  - [ ] Atualizar cada referência encontrada

### 3.4 Testar

- [ ] Teste: Registrar log de ação
- [ ] Teste: Ler configurações de log
- [ ] Teste: Aplicar filtros de log
- [ ] Verificar dashboard de logs

---

## FASE 4: REMOVER ROTAS DUPLICADAS (2-4 horas)

### 4.1 Análise Detalhada

Para cada rota duplicada:

#### Rota 1: /api/plano-contas
- [ ] Comparar `/api/plano-contas/route.js` com `/api/financeiro/plano-contas/route.js`
- [ ] Verificar diferenças funcionais
- [ ] Decidir qual é a "nova" (aparentemente `/financeiro/plano-contas`)
- [ ] Procurar referências a `/api/plano-contas` no frontend
  ```bash
  grep -r "/api/plano-contas" /home/user/CristalCar_Sistema/frontend/ | grep -v "/financeiro/"
  ```

#### Rota 2: /api/tipos-dre
- [ ] Comparar `/api/tipos-dre/route.js` com `/api/modelos-plano/tipos-dre/route.js`
- [ ] Verificar diferenças funcionais
- [ ] Procurar referências a `/api/tipos-dre` no frontend

#### Rota 3: /api/estrutura-dre
- [ ] Comparar `/api/estrutura-dre/route.js` com `/api/modelos-plano/estrutura-dre/route.js`
- [ ] Verificar diferenças funcionais
- [ ] Procurar referências a `/api/estrutura-dre` no frontend

### 4.2 Atualizar Referências

- [ ] Criar branch: `feature/remover-rotas-duplicadas`
- [ ] Atualizar todos os `fetch()` que usam rotas antigas para usar novas
- [ ] Verificar imports/requires de rotas
- [ ] Testar cada endpoint

### 4.3 Remover Rotas Antigas

- [ ] Deletar `/frontend/app/api/plano-contas/route.js` (e diretório)
- [ ] Deletar `/frontend/app/api/tipos-dre/route.js` (e diretório)
- [ ] Deletar `/frontend/app/api/estrutura-dre/route.js` (e diretório)

### 4.4 Testar

- [ ] Teste: Cada novo endpoint funciona
- [ ] Teste: Não há 404 para endpoints antigos
- [ ] Verificar logs do servidor

---

## FASE 5: CONSOLIDAÇÃO DE CAMPOS EM adm_empresa (1-2 horas)

### 5.1 Criar Migration

- [ ] Criar arquivo: `db/migrations/005_padronizar_empresa.sql`
  - [ ] Consolidar cnpj e cpf_cnpj
  - [ ] Consolidar website e site
  - [ ] Consolidar logo_path e logo_url

### 5.2 Atualizar Frontend

- [ ] Atualizar `/frontend/app/modules/administrativo/empresa/page.js`
  - [ ] Remover campos redundantes do formulário
  - [ ] Usar apenas um campo por propósito
- [ ] Atualizar `/frontend/app/api/administrativo/empresa/route.js`
  - [ ] Queries devem usar apenas campos consolidados

### 5.3 Testar

- [ ] Teste: Criar empresa
- [ ] Teste: Editar empresa
- [ ] Teste: Validar dados consolidados

---

## FASE 6: LIMPEZA DE PÁGINAS ÓRFÃS (1-2 horas)

### 6.1 Página: migrar-banco

- [ ] Decidir: Manter ou remover?
- [ ] SE MANTER:
  - [ ] Adicionar ao menu em "Administrativo > Ferramentas" (novo submenu)
  - [ ] Testar acesso via menu
- [ ] SE REMOVER:
  - [ ] Deletar `/frontend/app/modules/administrativo/migrar-banco/`
  - [ ] Procurar referências diretas
  - [ ] Documentar por que foi removida

### 6.2 Página: estrutura-dre vs estrutura-dre-editor

- [ ] Analisar diferenças entre as duas versões
- [ ] Decidir qual é "oficial"
- [ ] SE estrutura-dre é redundante:
  - [ ] Deletar `/frontend/app/modules/modelos-plano/estrutura-dre/`
  - [ ] Documentar consolidação
- [ ] SE são diferentes:
  - [ ] Entender o propósito de cada
  - [ ] Adicionar a menos comum ao menu ou remover

### 6.3 Página: planos-padroes

- [ ] Verificar se está completa:
  ```bash
  grep -i "TODO\|FIXME\|WIP" /home/user/CristalCar_Sistema/frontend/app/modules/modelos-plano/planos-padroes/page.js
  ```
- [ ] SE está completa:
  - [ ] Adicionar ao menu em "Modelos de Plano"
- [ ] SE está incompleta:
  - [ ] Deletar e criar issue para implementação futura

### 6.4 Atualizar Menu

- [ ] Editar `/frontend/app/components/layout/Sidebar.js`
  - [ ] Adicionar/remover items conforme decisões acima
  - [ ] Manter estrutura hierárquica
  - [ ] Testar abertura/fechamento do menu

---

## FASE 7: TESTES DE REGRESSÃO (2-3 horas)

### 7.1 Testes Unitários

- [ ] Executar suite de testes:
  ```bash
  npm test
  ```
- [ ] Verificar cobertura de código
- [ ] Adicionar testes para novos campos/rotas

### 7.2 Testes de Integração

- [ ] Teste: Login funciona
- [ ] Teste: Dashboard carrega
- [ ] Teste: Cada módulo no menu carrega
- [ ] Teste: CRUD de parceiros
- [ ] Teste: CRUD de empresa
- [ ] Teste: Sistema de logs
- [ ] Teste: Relatórios (se houver)

### 7.3 Testes E2E

- [ ] Teste: Criar parceiro PF com novos campos
- [ ] Teste: Criar parceiro PJ com novos campos
- [ ] Teste: Editar dados consolidados
- [ ] Teste: Filtrar e buscar
- [ ] Teste: Exportar dados

### 7.4 Performance

- [ ] Medir tempo de carregamento das páginas
- [ ] Verificar queries lentas (EXPLAIN)
- [ ] Validar índices estão sendo utilizados
- [ ] Comparar com baselines anteriores

---

## FASE 8: DOCUMENTAÇÃO (1 hora)

- [ ] Atualizar README.md com mudanças
- [ ] Documentar decisões de design
- [ ] Criar documento de migração para outros devs
- [ ] Atualizar API documentation (se houver)
- [ ] Documentar procedimento de rollback

---

## FASE 9: DEPLOY (2-3 horas)

### 9.1 Staging

- [ ] Executar migrations em staging
- [ ] Rodar smoke tests
- [ ] Rodar testes de regressão completos
- [ ] Verificar logs
- [ ] Validar performance

### 9.2 Produção

- [ ] Backup automático do banco
- [ ] Executar migrations em produção (com timeout generoso)
- [ ] Monitorar logs em tempo real
- [ ] Validar funcionalidades críticas
- [ ] Executar testes de smoke
- [ ] Notificar equipe que deploy está completo

### 9.3 Pós-Deploy

- [ ] Monitorar por 1 hora (erros, performance)
- [ ] Responder a issues/bugs
- [ ] Documentar qualquer comportamento inesperado

---

## TIMELINE ESTIMADO

| Fase | Horas | Pessoa |
|------|-------|--------|
| 1 - Análise | 2 | Líder Técnico |
| 2 - Consolidar par_parceiros | 6 | Dev Backend + Frontend |
| 3 - Consolidar Logs | 3 | Dev Backend |
| 4 - Remover Rotas | 3 | Dev Frontend |
| 5 - Consolidar adm_empresa | 1.5 | Dev Backend + Frontend |
| 6 - Limpar Páginas | 1.5 | Dev Frontend |
| 7 - Testes Regressão | 2.5 | QA / Dev |
| 8 - Documentação | 1 | Dev / Líder |
| 9 - Deploy | 2 | DevOps / Dev Senior |
| **TOTAL** | **22 horas** | **Equipe** |

**Duração estimada:** 3-4 dias de trabalho focado

---

## PRIORIDADE RECOMENDADA

### Sprint 1 (Dia 1-2)
- [ ] Fase 1: Análise de Impacto
- [ ] Fase 2: Consolidação par_parceiros

### Sprint 2 (Dia 2-3)
- [ ] Fase 3: Consolidação de Logs
- [ ] Fase 4: Remover Rotas Duplicadas

### Sprint 3 (Dia 3-4)
- [ ] Fase 5: Consolidar adm_empresa
- [ ] Fase 6: Limpar Páginas Órfãs
- [ ] Fase 7: Testes de Regressão
- [ ] Fase 8: Documentação
- [ ] Fase 9: Deploy

---

## RISCOS E MITIGAÇÃO

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| Perda de dados | Baixa | Crítico | Backup antes de migrations |
| APIs quebram | Média | Alto | Testes E2E abrangentes |
| Performance degrada | Baixa | Médio | Benchmarks antes/depois |
| Conflitos merge | Média | Médio | Branches bem nomeadas, PRs pequenas |
| Usuários afetados | Baixa | Alto | Comunicação, deploy em off-peak |

---

## ROLLBACK PLAN

Se algo der errado:

```bash
# 1. Verificar se há erros críticos
tail -f logs/app.log

# 2. Opção A: Revert migrations (se estiver em DB)
psql -U user -d database -f rollback.sql

# 3. Opção B: Revert código
git revert COMMIT_HASH

# 4. Redeploy versão anterior
npm run build && npm start

# 5. Comunicar equipe
# Criar issue descrevendo o que deu errado
```

---

## CONTATOS E SUPORTE

- **Líder Técnico:** [Contato]
- **DBA:** [Contato]
- **DevOps:** [Contato]
- **Documentação:** Este arquivo

---

**Atualizado em:** 2025-11-19  
**Próxima revisão:** Após conclusão do projeto
