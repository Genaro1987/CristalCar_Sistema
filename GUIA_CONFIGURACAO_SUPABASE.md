# 🚀 Guia de Configuração do Supabase

Este guia explica como configurar corretamente as variáveis de ambiente do Supabase no Vercel.

---

## ❌ Problema Atual

Você está vendo a mensagem:
```
"Configuração do Supabase ausente."
```

**Causa:** As variáveis de ambiente do Supabase não estão configuradas no Vercel ou estão incorretas.

---

## ✅ Solução: Configurar Variáveis no Vercel

### Passo 1: Obter Credenciais do Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Clique em **Settings** (⚙️ no menu lateral)
4. Clique em **API**
5. Copie as seguintes informações:

   **a) Project URL**
   ```
   https://[seu-projeto].supabase.co
   ```

   **b) Project API keys:**
   - `anon` `public` - **Chave anônima** (pública, pode ser exposta)
   - `service_role` `secret` - **Chave de serviço** (privada, NUNCA exponha!)

---

### Passo 2: Configurar no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **CristalCar_Sistema**
3. Clique em **Settings**
4. Clique em **Environment Variables**
5. Adicione as **3 variáveis** abaixo:

#### Variável 1: NEXT_PUBLIC_SUPABASE_URL

```
Nome: NEXT_PUBLIC_SUPABASE_URL
Valor: https://[seu-projeto].supabase.co
Environment: Production, Preview, Development (marque todos)
```

#### Variável 2: SUPABASE_SERVICE_ROLE_KEY

```
Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: [sua-chave-service-role-copiada-do-supabase]
Environment: Production, Preview, Development (marque todos)
```

#### Variável 3: NEXT_PUBLIC_SUPABASE_ANON_KEY

```
Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: [sua-chave-anon-copiada-do-supabase]
Environment: Production, Preview, Development (marque todos)
```

---

### Passo 3: Redesenhar (Redeploy)

Após adicionar as variáveis:

1. Volte para **Deployments** no Vercel
2. Clique no último deployment
3. Clique no botão **"⋯"** (três pontos)
4. Clique em **"Redeploy"**
5. Marque a opção **"Use existing Build Cache"**
6. Clique em **"Redeploy"**

⏱️ **Aguarde 2-3 minutos** para o deploy completar.

---

### Passo 4: Testar

1. Acesse: `https://cristalcar-sistema.vercel.app/`
2. Tente cadastrar uma empresa
3. Se funcionou: ✅ Configuração OK!
4. Se ainda der erro: veja seção de **Troubleshooting** abaixo

---

## 🔍 Como Verificar se Está Configurado

### No Vercel:

1. Vá em **Settings > Environment Variables**
2. Você deve ver:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Logs no Vercel:

1. Vá em **Deployments**
2. Clique no deployment ativo
3. Clique em **"View Function Logs"**
4. Procure por mensagens como:
   - ❌ "Configuração do Supabase ausente" → **Variáveis não configuradas**
   - ✅ Sem mensagens de erro → **Tudo OK**

---

## 🐛 Troubleshooting

### Erro persiste após configurar?

**1. Verifique o nome das variáveis**
- Deve ser **exatamente**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⚠️ Letras maiúsculas/minúsculas importam!

**2. Verifique os valores**
- `NEXT_PUBLIC_SUPABASE_URL` deve começar com `https://`
- As chaves são longas (100+ caracteres)
- Não pode ter espaços antes ou depois

**3. Redesenhar novamente**
- Às vezes o Vercel precisa de um redeploy para pegar as variáveis
- Tente fazer um **Redeploy sem cache**: desmarque "Use existing Build Cache"

**4. Verifique no Supabase se o projeto está ativo**
- Acesse https://supabase.com/dashboard
- Certifique-se que o projeto não está pausado
- Verifique se o banco de dados está ativo

---

## 🏗️ Para Desenvolvimento Local

Se você quiser testar localmente:

### 1. Criar arquivo `.env.local`

Na raiz do projeto `frontend/`, crie um arquivo `.env.local`:

```bash
cd frontend
```

Crie o arquivo:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anon]
```

### 2. Reiniciar servidor de desenvolvimento

```bash
npm run dev
```

### 3. Acessar

```
http://localhost:3000
```

---

## 📋 Checklist Final

Antes de dar o sistema como configurado, verifique:

- [ ] **Variáveis criadas no Vercel** (3 no total)
- [ ] **Todas marcadas** para Production, Preview e Development
- [ ] **Redeploy feito** após adicionar variáveis
- [ ] **Aguardou 2-3 minutos** para deploy completar
- [ ] **Testou cadastro de empresa** na URL de produção
- [ ] **Sem erros** nos logs do Vercel

---

## 🔐 Segurança

**⚠️ IMPORTANTE:**

- **NUNCA** commite o arquivo `.env.local` no Git
- **NUNCA** compartilhe a `SUPABASE_SERVICE_ROLE_KEY` publicamente
- A `NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ser exposta (é pública por natureza)
- Use RLS (Row Level Security) no Supabase para proteger seus dados

---

## 📊 Migração do Banco de Dados

Após configurar o Supabase, você precisa executar as migrations:

### 1. Acessar Supabase SQL Editor

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral

### 2. Executar Migrations

Execute os scripts na ordem:

**a) Schema inicial:**
```sql
-- Cole o conteúdo de: db/migrations/002_schema_derivado_do_front.sql
```

**b) Otimizações:**
```sql
-- Cole o conteúdo de: db/migrations/003_otimizacao_schema.sql
```

### 3. Verificar Tabelas Criadas

No SQL Editor, execute:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver tabelas como:
- `adm_empresa`
- `adm_funcionarios`
- `adm_departamentos`
- `adm_produtos`
- `par_parceiros`
- etc.

---

## 🎉 Pronto!

Se tudo foi configurado corretamente:

1. ✅ Cadastro de empresa funciona
2. ✅ Cadastro de funcionários funciona
3. ✅ Cadastro de departamentos funciona
4. ✅ Cadastro de produtos funciona
5. ✅ Dados persistem no Supabase

---

## 📞 Suporte

**Dúvidas?**

1. Verifique os logs do Vercel
2. Verifique os logs do Supabase (Logs Explorer)
3. Consulte a documentação oficial:
   - [Supabase Docs](https://supabase.com/docs)
   - [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Última atualização:** 19/11/2025
