# 🚀 Guia de Configuração: Vercel + Turso

Este guia vai te ajudar a conectar o sistema CristalCar ERP (hospedado no Vercel) com o banco de dados Turso.

---

## 📋 Pré-requisitos

1. Conta no [Turso](https://turso.tech/)
2. CLI do Turso instalado: `curl -sSfL https://get.tur.so/install.sh | bash`
3. Projeto já implantado no Vercel

---

## 🗄️ Passo 1: Criar e Configurar Banco de Dados Turso

### 1.1. Login no Turso
```bash
turso auth login
```

### 1.2. Criar o Banco de Dados
```bash
turso db create cristalcar-db
```

### 1.3. Obter a URL do Banco
```bash
turso db show cristalcar-db
```
**Copie a URL que aparece** (formato: `libsql://cristalcar-db-[usuario].turso.io`)

### 1.4. Gerar Token de Autenticação
```bash
turso db tokens create cristalcar-db
```
**Copie o token gerado** (começa com `eyJ...`)

### 1.5. Inicializar o Schema do Banco
```bash
# Conectar ao banco via shell
turso db shell cristalcar-db

# Ou execute o script de inicialização:
cd backend
TURSO_DATABASE_URL="sua-url" TURSO_AUTH_TOKEN="seu-token" node src/init-database.mjs
```

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente no Vercel

### 2.1. Acessar o Painel do Vercel
1. Acesse: https://vercel.com/
2. Vá para o seu projeto **CristalCar_Sistema**
3. Clique em **Settings** (Configurações)
4. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)

### 2.2. Adicionar as Variáveis

#### Variável 1: TURSO_DATABASE_URL
- **Key (Nome):** `TURSO_DATABASE_URL`
- **Value (Valor):** Cole a URL obtida no passo 1.3
  - Exemplo: `libsql://cristalcar-db-usuario.turso.io`
- **Environment:** Marque **Production**, **Preview** e **Development**
- Clique em **Save**

#### Variável 2: TURSO_AUTH_TOKEN
- **Key (Nome):** `TURSO_AUTH_TOKEN`
- **Value (Valor):** Cole o token obtido no passo 1.4
  - Exemplo: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...`
- **Environment:** Marque **Production**, **Preview** e **Development**
- Clique em **Save**

### 2.3. Verificar Configuração
Após salvar, você deve ver algo assim:

```
TURSO_DATABASE_URL     libsql://cristalcar-db-xxx.turso.io     Production, Preview, Development
TURSO_AUTH_TOKEN       eyJhbGci...                              Production, Preview, Development
```

---

## 🔄 Passo 3: Forçar Redeploy no Vercel

**IMPORTANTE:** As variáveis de ambiente só são aplicadas em novos deploys!

### Opção 1: Via Interface do Vercel
1. Vá para a aba **Deployments**
2. Clique nos **três pontinhos** (⋮) do último deployment
3. Clique em **Redeploy**
4. Marque a opção **"Use existing Build Cache"** (opcional)
5. Clique em **Redeploy**

### Opção 2: Via Git Push
```bash
git commit --allow-empty -m "Trigger redeploy for Turso connection"
git push origin main
```

---

## ✅ Passo 4: Testar a Conexão

### 4.1. Verificar Logs do Vercel
1. Acesse a aba **Deployments** no Vercel
2. Clique no deployment mais recente
3. Vá para **Functions** → Clique em qualquer API route
4. Verifique se não há erros relacionados ao Turso

### 4.2. Testar Cadastro no Sistema
1. Acesse seu site no Vercel: `https://seu-projeto.vercel.app`
2. Vá para **Administrativo → Funcionários**
3. Clique em **Novo Funcionário**
4. Preencha os campos e salve
5. **Verifique se o registro aparece na lista**

### 4.3. Verificar Dados no Turso
```bash
# Conectar ao banco
turso db shell cristalcar-db

# Verificar registros
SELECT * FROM adm_funcionarios;

# Sair
.exit
```

---

## 🐛 Solução de Problemas

### Problema 1: "TURSO_DATABASE_URL não definida"
**Solução:**
- Certifique-se de que as variáveis foram salvas no Vercel
- Faça um **redeploy** completo (não reuse cache)
- Aguarde 2-3 minutos após o deploy

### Problema 2: "Authentication failed"
**Solução:**
- Verifique se o token está correto (sem espaços extras)
- Gere um novo token: `turso db tokens create cristalcar-db`
- Atualize a variável `TURSO_AUTH_TOKEN` no Vercel
- Faça redeploy

### Problema 3: "Table does not exist"
**Solução:**
- Execute o script de inicialização do banco:
```bash
cd backend
TURSO_DATABASE_URL="sua-url" TURSO_AUTH_TOKEN="seu-token" node src/init-database.mjs
```

### Problema 4: Dados não aparecem após cadastro
**Solução:**
1. Abra o Console do Navegador (F12)
2. Vá para a aba **Network**
3. Tente fazer um cadastro
4. Procure por erros nas requisições API (status 500)
5. Verifique a mensagem de erro no Response

---

## 📊 Verificação Rápida (Checklist)

Marque cada item conforme completa:

- [ ] Banco de dados criado no Turso
- [ ] URL do banco obtida
- [ ] Token de autenticação gerado
- [ ] Schema inicializado no banco
- [ ] Variável `TURSO_DATABASE_URL` configurada no Vercel
- [ ] Variável `TURSO_AUTH_TOKEN` configurada no Vercel
- [ ] Redeploy realizado no Vercel
- [ ] Teste de cadastro bem-sucedido
- [ ] Dados aparecem no banco Turso

---

## 🆘 Precisa de Ajuda?

Se após seguir todos os passos o problema persistir:

1. **Verifique os logs do Vercel:**
   - Deployments → [seu deploy] → Functions → [clique em qualquer API]

2. **Teste a conexão diretamente:**
   - Crie uma API route de teste: `/api/test-db`
   - Código:
   ```javascript
   import { createClient } from '@libsql/client';

   export async function GET() {
     try {
       const turso = createClient({
         url: process.env.TURSO_DATABASE_URL,
         authToken: process.env.TURSO_AUTH_TOKEN,
       });

       const result = await turso.execute('SELECT 1 as test');
       return Response.json({ success: true, result: result.rows });
     } catch (error) {
       return Response.json({ success: false, error: error.message }, { status: 500 });
     }
   }
   ```

3. **Acesse:** `https://seu-projeto.vercel.app/api/test-db`
   - Se retornar `{"success": true}` → Conexão OK!
   - Se retornar erro → Copie a mensagem para debug

---

## 📚 Recursos Úteis

- [Documentação do Turso](https://docs.turso.tech/)
- [Turso + Next.js Guide](https://docs.turso.tech/sdk/ts/quickstart)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Turso CLI Reference](https://docs.turso.tech/reference/turso-cli)

---

✅ **Após configurar corretamente, todas as operações do sistema funcionarão perfeitamente com o Turso!**
