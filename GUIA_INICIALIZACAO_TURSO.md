# 🚀 Guia de Inicialização do Banco de Dados Turso

Este guia mostra como inicializar o banco de dados Turso para o sistema CristalCar.

## ⚠️ Problema Encontrado

O erro `400 - Unexpected status code while fetching migration jobs` no GitHub Actions indica que:

1. **Credenciais inválidas** - URL ou token do Turso incorretos nos Secrets do GitHub
2. **Database não existe** - O banco Turso ainda não foi criado
3. **Permissões inadequadas** - O token não tem permissão para modificar o banco

## ✅ Solução: Usar Turso CLI (Recomendado)

A forma mais confiável de inicializar o banco é usando o Turso CLI diretamente.

### Passo 1: Instalar Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
irm https://get.tur.so/install.ps1 | iex
```

### Passo 2: Autenticar no Turso

```bash
turso auth login
```

Isso abrirá seu navegador para fazer login.

### Passo 3: Criar o Banco (se ainda não existir)

```bash
# Listar bancos existentes
turso db list

# Se o banco não existir, crie
turso db create cristalcar-db

# Verificar se foi criado
turso db show cristalcar-db
```

### Passo 4: Inicializar o Schema

Existem **duas formas** de fazer isso:

#### **Opção A: Via Turso CLI (Mais Confiável)**

```bash
# Na raiz do projeto
cd backend

# Executar schema diretamente no Turso
turso db shell cristalcar-db < src/schema.sql
```

✅ Esta é a forma mais confiável! O Turso CLI gerencia transações, triggers e dependências automaticamente.

#### **Opção B: Via Script Node.js**

```bash
# Na pasta backend
cd backend

# Configurar variáveis de ambiente
export TURSO_DATABASE_URL=$(turso db show cristalcar-db --url)
export TURSO_AUTH_TOKEN=$(turso db tokens create cristalcar-db)

# Executar script simplificado
npm run init:db:simple
```

### Passo 5: Verificar Inicialização

```bash
# Abrir shell do Turso
turso db shell cristalcar-db

# Dentro do shell, verificar tabelas criadas
.tables

# Contar tabelas
SELECT COUNT(*) as total_tabelas
FROM sqlite_master
WHERE type='table'
AND name NOT LIKE 'sqlite_%';

# Deve retornar ~20 tabelas

# Sair
.quit
```

### Passo 6: Configurar GitHub Secrets

Agora que o banco está inicializado, configure os Secrets no GitHub:

```bash
# Obter URL
turso db show cristalcar-db --url

# Obter token (criar um novo se necessário)
turso db tokens create cristalcar-db
```

No GitHub:
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Adicione/atualize:
   - `TURSO_DATABASE_URL` = URL obtida acima
   - `TURSO_AUTH_TOKEN` = Token obtido acima

### Passo 7: Configurar Vercel

No Vercel (https://vercel.com/dashboard):

1. Vá no seu projeto → **Settings** → **Environment Variables**
2. Adicione as mesmas variáveis:
   - `TURSO_DATABASE_URL` (Production + Preview + Development)
   - `TURSO_AUTH_TOKEN` (Production + Preview + Development)
3. **Redeploy** o projeto

## 🔧 Atualizar package.json

Adicione o novo script ao `backend/package.json`:

```json
{
  "scripts": {
    "test:db": "node src/test-db.mjs",
    "init:db": "node src/init-database.mjs",
    "init:db:simple": "node src/init-database-simple.mjs",
    "init:db:complete": "node src/init-database-complete.mjs"
  }
}
```

## 🧪 Testar a Conexão

Após deploy no Vercel, acesse:

```
https://seu-app.vercel.app/api/test-db
```

Deve retornar:
```json
{
  "success": true,
  "checks": {
    "environmentVariables": {
      "TURSO_DATABASE_URL": { "exists": true },
      "TURSO_AUTH_TOKEN": { "exists": true }
    },
    "connection": { "success": true },
    "schema": { "tableCount": 20 },
    "write": { "success": true }
  }
}
```

## 📊 Verificar Dados Salvos

Após fazer um cadastro no sistema, verifique:

```bash
# Abrir shell do Turso
turso db shell cristalcar-db

# Ver parceiros cadastrados
SELECT * FROM par_parceiros LIMIT 5;

# Ver bancos
SELECT * FROM fin_bancos LIMIT 5;
```

## ❌ Troubleshooting

### Erro: "no such table: par_parceiros"

**Causa:** Schema não foi inicializado.
**Solução:** Execute o Passo 4 novamente.

### Erro: "TURSO_DATABASE_URL não definida"

**Causa:** Variáveis de ambiente não configuradas.
**Solução:** Configure no GitHub Secrets e Vercel Environment Variables.

### Erro: "401 Unauthorized"

**Causa:** Token inválido ou expirado.
**Solução:** Gere um novo token:
```bash
turso db tokens create cristalcar-db
```

### Dados não salvam no Vercel

**Verificar:**
1. ✅ Schema inicializado no Turso
2. ✅ Environment Variables configuradas no Vercel
3. ✅ Redeploy feito após configurar variáveis
4. ✅ `/api/test-db` retorna success

## 📝 Comandos Úteis do Turso CLI

```bash
# Listar bancos
turso db list

# Ver informações do banco
turso db show cristalcar-db

# Obter URL
turso db show cristalcar-db --url

# Criar token
turso db tokens create cristalcar-db

# Revogar token
turso db tokens revoke cristalcar-db <token>

# Abrir shell interativo
turso db shell cristalcar-db

# Executar SQL de arquivo
turso db shell cristalcar-db < arquivo.sql

# Destruir banco (CUIDADO!)
turso db destroy cristalcar-db
```

## 🎯 Resumo Rápido

```bash
# 1. Criar banco
turso db create cristalcar-db

# 2. Inicializar schema
cd backend
turso db shell cristalcar-db < src/schema.sql

# 3. Obter credenciais
turso db show cristalcar-db --url
turso db tokens create cristalcar-db

# 4. Configurar no GitHub Secrets e Vercel
# (fazer via interface web)

# 5. Testar
curl https://seu-app.vercel.app/api/test-db
```

## ✅ Pronto!

Agora seu sistema está conectado ao Turso e pronto para salvar dados! 🎉
