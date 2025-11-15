# 🌐 Guia de Inicialização 100% VIA WEB (Sem Terminal)

Este guia é para você que trabalha 100% via web, sem acesso a terminal local.

## 🎯 Problema Atual

Erro no Vercel: `no such column: codigo` - indica que as tabelas não existem no banco Turso.

## ✅ Solução Via Web (Escolha UMA das opções)

---

## **OPÇÃO 1: Via Endpoint API (Mais Rápido) ⚡**

### Passo 1: Configurar Secret no Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto **CristalCar_Sistema**
3. Vá em **Settings** → **Environment Variables**
4. Adicione nova variável:
   - **Name:** `INIT_DB_SECRET`
   - **Value:** `cristalcar-init-2024` (ou crie sua própria senha)
   - **Environments:** ✅ Production
5. Clique em **Save**

### Passo 2: Fazer Deploy

1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. Aguarde o build completar (~2 minutos)

### Passo 3: Executar Inicialização

Após o deploy, acesse esta URL no seu navegador:

```
https://seu-app.vercel.app/api/init-db-web?secret=cristalcar-init-2024
```

**Substitua:**
- `seu-app.vercel.app` pelo domínio real do seu projeto
- `cristalcar-init-2024` pela senha que você configurou

Você verá uma resposta JSON como:

```json
{
  "success": true,
  "message": "Inicialização parcial concluída!",
  "created": [
    "adm_empresa",
    "adm_favoritos",
    "par_parceiros",
    "fin_bancos",
    "fin_formas_pagamento",
    "fin_condicoes_pagamento",
    "fin_plano_contas"
  ],
  "totalTables": 8,
  "nextSteps": [...]
}
```

✅ **Pronto!** As tabelas essenciais foram criadas.

---

## **OPÇÃO 2: Via Turso Web Console (Mais Completo) 🔧**

### Passo 1: Acessar Turso Console

1. Acesse https://app.turso.tech
2. Faça login
3. Selecione seu banco **cristalcar-db** (ou como você nomeou)
4. Clique em **SQL Editor** ou **Console**

### Passo 2: Executar Schema em Partes

Cole e execute cada bloco SQL abaixo **separadamente** (um de cada vez):

#### Bloco 1: Tabelas Administrativas

```sql
-- Tabela de Empresa
CREATE TABLE IF NOT EXISTS adm_empresa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    regime_tributario VARCHAR(50),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    site VARCHAR(200),
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    logo_url VARCHAR(500),
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Favoritos
CREATE TABLE IF NOT EXISTS adm_favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    codigo_tela VARCHAR(20) NOT NULL,
    nome_tela VARCHAR(200) NOT NULL,
    caminho_tela VARCHAR(500) NOT NULL,
    ordem INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configuração Backup
CREATE TABLE IF NOT EXISTS adm_configuracao_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_backup VARCHAR(30) NOT NULL,
    diretorio_local VARCHAR(500),
    google_drive_folder_id VARCHAR(200),
    google_drive_credentials TEXT,
    frequencia VARCHAR(20) NOT NULL,
    horario_execucao TIME,
    dia_semana INTEGER,
    dia_mes INTEGER,
    quantidade_manter INTEGER DEFAULT 7,
    backup_automatico BOOLEAN DEFAULT 1,
    ultimo_backup DATETIME,
    proximo_backup DATETIME,
    status VARCHAR(20) DEFAULT 'ATIVO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico Backup
CREATE TABLE IF NOT EXISTS adm_historico_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_backup VARCHAR(30),
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes INTEGER,
    caminho_completo VARCHAR(500),
    data_backup DATETIME NOT NULL,
    status VARCHAR(20),
    tempo_execucao INTEGER,
    mensagem TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Clique em **Run** ou **Execute**.

#### Bloco 2: Tabela de Parceiros (ESSENCIAL!)

```sql
CREATE TABLE IF NOT EXISTS par_parceiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo_pessoa VARCHAR(20) NOT NULL,
    tipo_parceiro VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    rg_inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    nome VARCHAR(200),
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    data_nascimento DATE,
    data_fundacao DATE,
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    site VARCHAR(200),
    endereco VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    pais VARCHAR(50) DEFAULT 'Brasil',
    limite_credito DECIMAL(15,2),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Clique em **Run** ou **Execute**.

#### Bloco 3: Tabelas Financeiras

```sql
-- Tabela de Bancos
CREATE TABLE IF NOT EXISTS fin_bancos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    numero_banco VARCHAR(10) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(30),
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    gerente VARCHAR(200),
    telefone VARCHAR(20),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Formas de Pagamento
CREATE TABLE IF NOT EXISTS fin_formas_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Condições de Pagamento
CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    quantidade_parcelas INTEGER NOT NULL,
    intervalo_dias INTEGER NOT NULL,
    primeira_parcela_dias INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Plano de Contas
CREATE TABLE IF NOT EXISTS fin_plano_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    natureza VARCHAR(20) NOT NULL,
    nivel INTEGER NOT NULL,
    conta_pai_id INTEGER,
    aceita_lancamento BOOLEAN DEFAULT 1,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Regras de Conciliação
CREATE TABLE IF NOT EXISTS fin_regras_conciliacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    palavra_chave VARCHAR(200),
    plano_contas_id INTEGER,
    categoria VARCHAR(100),
    prioridade INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Clique em **Run** ou **Execute**.

#### Bloco 4: Tabelas de Preços

```sql
-- Tabelas de Preços
CREATE TABLE IF NOT EXISTS tab_tabelas_precos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    data_vigencia_inicio DATE NOT NULL,
    data_vigencia_fim DATE,
    ativa BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Alterações de Preços
CREATE TABLE IF NOT EXISTS tab_historico_precos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela_preco_id INTEGER NOT NULL,
    data_alteracao DATETIME NOT NULL,
    usuario VARCHAR(100),
    descricao_alteracao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Clique em **Run** ou **Execute**.

### Passo 3: Verificar Criação

No console SQL, execute:

```sql
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
```

Você deve ver as tabelas criadas:
- adm_empresa
- adm_favoritos
- adm_configuracao_backup
- adm_historico_backup
- par_parceiros
- fin_bancos
- fin_formas_pagamento
- fin_condicoes_pagamento
- fin_plano_contas
- fin_regras_conciliacao
- tab_tabelas_precos
- tab_historico_precos

---

## 🧪 Testar a Conexão

### Opção A: Via Endpoint de Teste

Acesse no navegador:

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
    "schema": { "tableCount": 12 },
    "write": { "success": true }
  }
}
```

### Opção B: Testar Cadastro no Sistema

1. Acesse seu sistema no Vercel
2. Vá em **Parceiros** → **Cadastro**
3. Preencha um parceiro de teste
4. Clique em **Salvar**
5. Verifique se não aparece erro e se o parceiro aparece na listagem

### Opção C: Verificar no Turso Console

1. Volte para https://app.turso.tech
2. No SQL Editor, execute:

```sql
SELECT * FROM par_parceiros;
```

Se você cadastrou um parceiro, ele deve aparecer aqui!

---

## 🔧 Desabilitar Init no GitHub Actions (Opcional)

Como o banco já estará inicializado, você pode evitar que o GitHub Actions tente executar o init novamente.

### Via GitHub Web:

1. Acesse seu repositório no GitHub
2. Vá em **.github/workflows/ci.yml** (ou o nome do seu workflow)
3. Clique em **Edit** (ícone de lápis)
4. **Comente ou remova** estas linhas:

```yaml
# - name: Inicializar banco de dados
#   run: npm run init:db
#   working-directory: ./backend
#   env:
#     TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
#     TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}
```

5. Clique em **Commit changes**

---

## ✅ Checklist Final

- [ ] Variáveis TURSO_DATABASE_URL e TURSO_AUTH_TOKEN configuradas no Vercel
- [ ] Tabelas criadas via API endpoint OU via Turso Console
- [ ] Endpoint /api/test-db retorna success
- [ ] Cadastro de parceiro funciona e salva dados
- [ ] Dados aparecem no Turso Console
- [ ] GitHub Actions não tenta mais rodar init:db (opcional)

---

## 🆘 Solução de Problemas

### Erro: "no such column: codigo" persiste

**Causa:** Cache do build do Vercel.

**Solução:**
1. Vá em Vercel → Deployments
2. Clique nos 3 pontos do último deployment
3. Escolha **Redeploy**
4. **DESMARQUE** "Use existing Build Cache"
5. Clique em **Redeploy**

### Erro: "401 Unauthorized" no endpoint

**Causa:** Secret incorreto.

**Solução:**
- Verifique se você configurou `INIT_DB_SECRET` no Vercel
- Use o mesmo valor na URL: `?secret=valor-aqui`

### Tabelas não aparecem no Turso Console

**Causa:** Você pode estar olhando o banco errado.

**Solução:**
- Verifique se o nome do banco selecionado no console é o mesmo da variável `TURSO_DATABASE_URL`
- A URL deve ser algo como `libsql://cristalcar-db-xxxxx.turso.io`

---

## 📚 Próximos Passos

Após a inicialização, você pode:

1. **Cadastrar dados de teste** em cada módulo
2. **Explorar as funcionalidades** do sistema
3. **Adicionar mais tabelas** conforme necessário (via Turso Console)
4. **Monitorar o uso** do banco em https://app.turso.tech

---

## 💡 Dica Pro

Salve o link do endpoint de inicialização com o secret:

```
https://seu-app.vercel.app/api/init-db-web?secret=cristalcar-init-2024
```

Se precisar recriar as tabelas no futuro, basta acessar novamente!

**IMPORTANTE:** Por segurança, não compartilhe este link publicamente.

---

**Documentação completa do Turso:** https://docs.turso.tech
**Suporte do Vercel:** https://vercel.com/support
