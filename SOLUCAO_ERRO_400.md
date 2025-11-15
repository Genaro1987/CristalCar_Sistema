# ⚠️ Solução para Erro 400 no GitHub Actions

## 🔴 Problema

O GitHub Actions está falhando ao executar `npm run init:db` com o erro:

```
❌ Erro: Unexpected status code while fetching migration jobs: 400
```

## 🎯 Causa

Este erro ocorre porque:

1. **O banco Turso não foi inicializado localmente primeiro**
2. As variáveis `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` nos GitHub Secrets podem estar incorretas
3. O script `init-database.mjs` tenta executar comandos SQL que o Turso rejeita via API HTTP

## ✅ Solução (Passo a Passo)

### **Método 1: Turso CLI (RECOMENDADO - Mais Rápido)**

Este método é o mais confiável e rápido:

```bash
# 1. Instalar Turso CLI (se ainda não tiver)
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Login
turso auth login

# 3. Verificar se o banco existe
turso db list

# 4. Se não existir, criar
turso db create cristalcar-db

# 5. Inicializar schema (MÉTODO MAIS CONFIÁVEL)
cd backend
turso db shell cristalcar-db < src/schema.sql

# 6. Verificar se funcionou
turso db shell cristalcar-db
# Dentro do shell:
.tables
# Deve mostrar ~20 tabelas
.quit
```

✅ **Pronto!** O banco está inicializado.

### **Método 2: Script Node.js Simplificado**

Se preferir usar Node.js:

```bash
# 1. Obter credenciais do Turso
export TURSO_DATABASE_URL=$(turso db show cristalcar-db --url)
export TURSO_AUTH_TOKEN=$(turso db tokens create cristalcar-db)

# 2. Executar script simplificado
cd backend
npm run init:db:simple
```

## 🔧 Atualizar GitHub Secrets

Depois de inicializar o banco, atualize os Secrets no GitHub:

```bash
# Obter URL
turso db show cristalcar-db --url
# Copie o resultado: libsql://cristalcar-db-xxxxx.turso.io

# Obter token
turso db tokens create cristalcar-db
# Copie o resultado: eyJhbGci...
```

No GitHub:
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Edite ou adicione:
   - `TURSO_DATABASE_URL` = URL copiada
   - `TURSO_AUTH_TOKEN` = Token copiado

## 🚀 Configurar Vercel

No Vercel (https://vercel.com):

1. Acesse seu projeto → **Settings** → **Environment Variables**
2. Adicione as mesmas variáveis:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
3. Marque todos os ambientes: ✅ Production ✅ Preview ✅ Development
4. Clique em **Save**
5. Vá em **Deployments** e faça **Redeploy**

## 🧪 Testar

Após o deploy, acesse:

```
https://seu-app.vercel.app/api/test-db
```

Deve retornar:
```json
{
  "success": true,
  "checks": {
    "schema": { "tableCount": 20 },
    "write": { "success": true }
  }
}
```

## 📊 Verificar Dados

Após fazer um cadastro no sistema:

```bash
turso db shell cristalcar-db

# Dentro do shell:
SELECT * FROM par_parceiros;
SELECT COUNT(*) FROM par_parceiros;
```

## 📝 Modificar GitHub Actions (Opcional)

Se quiser evitar rodar `init:db` no GitHub Actions, edite `.github/workflows/ci.yml`:

**Remova ou comente** a linha:
```yaml
- name: Inicializar banco de dados
  run: npm run init:db
  working-directory: ./backend
```

Isso evita que o CI tente inicializar o banco (que já foi inicializado localmente).

## 🎯 Resumo do Fluxo Correto

1. ✅ **Inicializar banco LOCALMENTE** (via Turso CLI)
2. ✅ **Configurar GitHub Secrets** com credenciais corretas
3. ✅ **Configurar Vercel Environment Variables**
4. ✅ **Redeploy no Vercel**
5. ✅ **Testar via /api/test-db**
6. ✅ **Fazer cadastro e verificar dados**

## ❓ Se Continuar com Erro

Se após seguir estes passos o erro persistir:

1. Verifique se as variáveis estão corretas:
   ```bash
   turso db show cristalcar-db --url
   turso db tokens create cristalcar-db
   ```

2. Teste a conexão localmente:
   ```bash
   cd backend
   export TURSO_DATABASE_URL="sua-url"
   export TURSO_AUTH_TOKEN="seu-token"
   npm run test:db
   ```

3. Verifique os logs do Vercel para detalhes do erro

## 🎉 Resultado Esperado

Após seguir estes passos:
- ✅ Banco Turso inicializado com ~20 tabelas
- ✅ GitHub Secrets configurados
- ✅ Vercel conectado ao banco
- ✅ Dados sendo salvos corretamente
- ✅ `/api/test-db` retornando success

---

**Documentação completa:** Ver `GUIA_INICIALIZACAO_TURSO.md`
