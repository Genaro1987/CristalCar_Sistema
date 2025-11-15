# 🗄️ Guia Rápido: Inicialização do Banco de Dados

## ⚡ Inicializar Schema no Turso

### Opção 1: Via Script NPM (Recomendado)
```bash
cd backend

# Exportar as variáveis (substitua pelos seus valores)
export TURSO_DATABASE_URL="libsql://cristalcar-db-seu-usuario.turso.io"
export TURSO_AUTH_TOKEN="seu-token-aqui"

# Executar inicialização
npm run init:db
```

### Opção 2: Direto via Node
```bash
cd backend

TURSO_DATABASE_URL="sua-url" TURSO_AUTH_TOKEN="seu-token" node src/init-database.mjs
```

### Opção 3: Via Turso CLI
```bash
# Conectar ao banco
turso db shell cristalcar-db

# Copiar e colar o conteúdo do arquivo backend/src/schema.sql
# OU importar diretamente:
.read backend/src/schema.sql

# Verificar tabelas criadas
.tables

# Sair
.exit
```

---

## ✅ Verificar se o Banco foi Inicializado

### Via Turso CLI
```bash
turso db shell cristalcar-db

# Listar todas as tabelas
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

# Contar tabelas
SELECT COUNT(*) as total FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';

.exit
```

### Via API de Teste (após deploy no Vercel)
1. Acesse: `https://seu-projeto.vercel.app/api/test-db`
2. Você deve ver:
```json
{
  "success": true,
  "message": "✅ Conexão com Turso funcionando perfeitamente!",
  "checks": {
    "schema": {
      "tablesCount": 20,
      "tables": ["adm_empresa", "adm_funcionarios", ...]
    }
  }
}
```

---

## 📊 Tabelas que Devem Ser Criadas

O schema cria as seguintes tabelas:

### Administrativo (adm_)
- `adm_empresa` - Dados da empresa
- `adm_funcionarios` - Funcionários
- `adm_layouts_importacao` - Layouts de importação
- `adm_configuracao_backup` - Configuração de backup
- `adm_historico_backup` - Histórico de backups
- `adm_favoritos` - Telas favoritas por usuário

### Financeiro (fin_)
- `fin_plano_contas` - Plano de contas
- `fin_formas_pagamento` - Formas de pagamento
- `fin_condicoes_pagamento` - Condições de pagamento
- `fin_bancos` - Cadastro de bancos
- `fin_config_ofx_bancos` - Configuração OFX
- `fin_regras_conciliacao` - Regras de conciliação
- `fin_centro_custo` - Centro de custo

### Parceiros (par_)
- `par_parceiros` - Clientes, fornecedores, etc (unificado)

### Tabelas de Preços (tab_)
- `tab_tabelas_precos` - Tabelas de preços
- `tab_tabelas_precos_parceiros` - Vinculação tabela-parceiro
- `tab_historico_alteracoes` - Histórico de mudanças

---

## 🐛 Problemas Comuns

### "Error: TURSO_DATABASE_URL não definida"
**Solução:** Exporte as variáveis de ambiente antes de executar o script
```bash
export TURSO_DATABASE_URL="sua-url"
export TURSO_AUTH_TOKEN="seu-token"
```

### "Table already exists"
**Normal!** O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar múltiplas vezes.

### Schema executado mas Vercel ainda vê banco vazio
**Solução:**
1. Certifique-se de que usou o mesmo banco nos dois lugares
2. Verifique se a URL no Vercel é exatamente igual à usada no script
3. Faça redeploy no Vercel após configurar as variáveis

---

## 🔄 Reiniciar o Banco (Cuidado!)

Se precisar apagar tudo e começar do zero:

```bash
# CUIDADO: Isso apaga TODOS os dados!
turso db destroy cristalcar-db

# Criar novamente
turso db create cristalcar-db

# Obter nova URL e token
turso db show cristalcar-db
turso db tokens create cristalcar-db

# Atualizar variáveis no Vercel
# ...

# Inicializar schema novamente
cd backend
npm run init:db
```

---

✅ **Após inicializar o schema, todas as telas do sistema estarão prontas para uso!**
