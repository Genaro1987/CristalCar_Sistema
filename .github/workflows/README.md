# GitHub Actions - CristalCar Sistema

## Workflows Disponíveis

### 1. Backend - Inicializar Banco de Dados (`backend-init-database.yml`)

**Disparo:** Manual (workflow_dispatch)

**Função:** Cria todas as tabelas e insere dados iniciais no banco Turso

**O que faz:**
- ✅ Cria 26 tabelas do sistema
- ✅ Cria views e triggers
- ✅ Insere dados da empresa Cristal Car
- ✅ Cria usuário administrador (admin/admin123)
- ✅ Insere plano de contas básico
- ✅ Insere formas e condições de pagamento
- ✅ Lista todas as tabelas criadas

**Como executar:**
1. Acesse: `Actions` > `Backend - Inicializar Banco de Dados`
2. Clique em `Run workflow`
3. Selecione a branch
4. Clique em `Run workflow`

**Resultado esperado:**
```
Iniciando criação do banco de dados CristalCar...
📋 Encontrados 123 statements SQL
[1/123] CREATE TABLE adm_empresa... ✅
...
✅ Concluído: 123 sucessos, 0 erros
🎉 Banco de dados CristalCar criado com sucesso!
Total: 26 tabelas criadas
```

---

### 2. Backend CI (`backend-ci.yml`)

**Disparo:** Automático em push no `/backend/**`

**Função:** Teste de integração contínua

**O que faz:**
- ✅ Testa conexão com Turso
- ✅ Executa inicialização do banco (para validar que o script funciona)

---

## Secrets Necessários

Configure os seguintes secrets no GitHub:

### `TURSO_DATABASE_URL`
URL do banco de dados Turso
```
libsql://seu-banco.turso.io
```

### `TURSO_AUTH_TOKEN`
Token de autenticação do Turso
```
eyJhbGc...
```

**Como configurar:**
1. Vá em `Settings` > `Secrets and variables` > `Actions`
2. Clique em `New repository secret`
3. Adicione cada secret

---

## Estrutura dos Workflows

```
.github/workflows/
├── backend-init-database.yml  # Inicialização manual do banco
└── backend-ci.yml             # CI automático
```

---

## Troubleshooting

### Erro: "TURSO_DATABASE_URL não configurado"

**Solução:** Configure os secrets no GitHub (veja seção acima)

### Workflow falha ao criar tabelas

**Possíveis causas:**
1. Token do Turso expirado ou inválido
2. URL do banco incorreta
3. Permissões insuficientes no banco

**Solução:**
1. Verifique os secrets
2. Teste localmente: `cd backend && npm run init:db`
3. Verifique os logs do workflow para detalhes

### Tabelas já existem

**Comportamento esperado:** O script usa `CREATE TABLE IF NOT EXISTS`, então:
- ✅ Tabelas existentes não são recriadas
- ✅ Novas tabelas são adicionadas
- ✅ Dados iniciais usam `INSERT OR IGNORE` (não duplicam)

---

## Migrando de `criar-tabela-teste.mjs`

Se você estava usando o script antigo que criava apenas `teste_ci`:

1. ✅ Os workflows já foram atualizados para usar `init-database-complete.mjs`
2. ✅ A tabela `teste_ci` pode ser removida manualmente se desejar
3. ✅ Execute o workflow `Backend - Inicializar Banco de Dados` para criar as tabelas corretas

**Remover tabela de teste (opcional):**
```sql
DROP TABLE IF EXISTS teste_ci;
```

---

## Manutenção

### Adicionar novas tabelas

1. Edite `backend/src/schema-complete.sql`
2. Commit e push
3. Execute o workflow `Backend - Inicializar Banco de Dados`
4. Tabelas novas serão criadas (existentes permanecem intactas)

### Adicionar novos dados iniciais

1. Edite a função `inserirDadosIniciais()` em `backend/src/init-database-complete.mjs`
2. Use sempre `INSERT OR IGNORE` para evitar duplicações
3. Commit e push
4. Execute o workflow

---

## Logs e Debugging

Para ver os logs detalhados:

1. Acesse `Actions` no GitHub
2. Clique no workflow executado
3. Clique no job `init-database` ou `test-db`
4. Expanda cada step para ver os logs

Os logs mostram:
- Cada tabela sendo criada
- Erros detalhados (se houver)
- Lista final de todas as tabelas
- Dados inseridos
