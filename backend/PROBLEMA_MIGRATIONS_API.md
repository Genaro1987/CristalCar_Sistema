# Problema: Erro "Unexpected status code while fetching migration jobs: 400"

## Contexto

O script `src/init-database.mjs` está falhando no GitHub Actions com o erro:
```
❌ Erro no comando 1: Unexpected status code while fetching migration jobs: 400
```

## Causa Raiz

A biblioteca `@libsql/client` (versão 0.6.0) tenta automaticamente usar a **Migrations API do Turso** quando detecta comandos DDL (CREATE TABLE, CREATE INDEX, etc.).

Essa API de migrations é uma feature do Turso que permite gerenciar alterações de schema de forma declarativa, mas:
- Pode não estar habilitada em todos os planos
- Pode retornar erro 400 se não estiver configurada corretamente
- Não é necessária para nosso caso de uso (IF NOT EXISTS já protege contra erros)

## Status Atual

- ✅ As **APIs do Vercel** estão corrigidas (removido `cpf_cnpj`, adicionado prefixos `par_`)
- ⚠️ O **script de inicialização** ainda falha no GitHub Actions
- ✅ O **banco de dados JÁ EXISTE** (conforme confirmado pelo usuário)

## Soluções Possíveis

### Solução 1: Desabilitar o workflow de inicialização (RECOMENDADO)

Como o banco já existe, podemos simplesmente **não executar** o `init-database.mjs` no GitHub Actions:

**Arquivo:** `.github/workflows/test-db.yml`

```yaml
# Comentar ou remover a etapa de inicialização:
# - name: Inicializar banco
#   run: npm run init:db
#   working-directory: ./backend
```

### Solução 2: Usar CLI do Turso ao invés da biblioteca JavaScript

Instalar e usar a CLI oficial do Turso:

```yaml
- name: Instalar Turso CLI
  run: curl -sSfL https://get.tur.so/install.sh | bash

- name: Executar schema
  run: |
    export PATH="/home/runner/.turso/bin:$PATH"
    turso db shell ${{ secrets.TURSO_DATABASE_URL }} < backend/src/schema.sql
```

### Solução 3: Downgrade da biblioteca @libsql/client

Testar com versão anterior que não tinha migrations API:

```json
{
  "dependencies": {
    "@libsql/client": "^0.4.0"
  }
}
```

### Solução 4: Executar apenas via Web UI

Usar a rota `/api/init-db-web` do frontend:

```
https://seu-app.vercel.app/api/init-db-web?secret=SEU_SECRET
```

## Solução Implementada

Por enquanto, mantemos o script `init-database.mjs` com as seguintes melhorias:
- ✅ Execução em batches (10 comandos por vez)
- ✅ Delay de 100ms entre batches
- ✅ Tentativa de usar `executeMultiple` se disponível
- ✅ Tratamento de erros individual por comando

**Próximo passo:** Escolher e implementar uma das soluções acima.

## Recomendação Final

**Opção 1 (mais simples):** Desabilitar o workflow do GitHub Actions, pois:
- O banco já existe
- As tabelas usam `IF NOT EXISTS`
- Não precisamos recriar o schema a cada push
- Podemos executar manualmente via `/api/init-db-web` quando necessário

**Opção 2 (mais robusta):** Usar a CLI do Turso no GitHub Actions para execuções futuras de schema.
