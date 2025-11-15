# Backend - CristalCar Sistema

## Configuração do Banco de Dados

### Pré-requisitos

- Node.js instalado
- Conta no Turso com banco de dados criado
- Variáveis de ambiente configuradas

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto backend com as seguintes variáveis:

```env
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu_token_de_autenticacao
```

### Inicializar o Banco de Dados

Para criar todas as tabelas e inserir dados iniciais, execute:

```bash
cd backend
npm run init:db
```

Este comando irá:

1. Criar todas as tabelas do sistema:
   - **Módulo Administrativo:** empresa, funcionários, usuários, permissões, layouts, backup, logs
   - **Módulo Modelos de Plano:** plano de contas, estrutura DRE
   - **Módulo Financeiro:** formas/condições de pagamento, bancos, conciliação
   - **Módulo Parceiros:** cadastro unificado de clientes/fornecedores
   - **Módulo Tabelas:** tabelas de preços e histórico

2. Inserir dados iniciais:
   - Dados da empresa (Cristal Car)
   - Usuário administrador (login: `admin`, senha: `admin123`)
   - Plano de contas básico (receitas e despesas)
   - Formas de pagamento padrão (Dinheiro, PIX, Cartões, Boleto, Transferência)
   - Condições de pagamento (À vista, 30 dias, parcelado)
   - Centro de custo padrão
   - Configurações de log

3. Listar todas as tabelas criadas

### Verificar Conexão

Para testar a conexão com o banco de dados:

```bash
npm run test:db
```

### Estrutura do Banco de Dados

O schema completo está disponível em: `src/schema-complete.sql`

#### Tabelas por Módulo:

**Administrativo (adm_)**
- adm_empresa
- adm_funcionarios
- adm_usuarios
- adm_permissoes
- adm_layouts_importacao
- adm_configuracao_backup
- adm_historico_backup
- adm_configuracao_log
- adm_log_acoes

**Financeiro (fin_)**
- fin_plano_contas
- fin_estrutura_dre
- fin_dre_plano_contas
- fin_formas_pagamento
- fin_condicoes_pagamento
- fin_condicoes_pagamento_parcelas
- fin_bancos
- fin_tipos_registro_conciliacao
- fin_regras_conciliacao
- fin_centro_custo

**Movimentação (mov_)**
- mov_financeiro

**Parceiros (par_)**
- par_parceiros
- par_contatos

**Tabelas de Preços (tab_)**
- tab_tabelas_precos
- tab_tabelas_historico

### Dados Iniciais

Após a inicialização, você terá acesso ao sistema com:

- **Login:** admin
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro acesso!

## Problemas Comuns

### Tabela teste_ci existente

Se você tiver a tabela `teste_ci` de testes anteriores, ela não interfere no funcionamento do sistema. As novas tabelas serão criadas normalmente ao lado dela.

Para remover a tabela de teste (opcional):

```sql
DROP TABLE IF EXISTS teste_ci;
```

### Erro de permissão

Certifique-se de que o token do Turso tem permissões de escrita no banco de dados.

### Erro de conexão

Verifique se as variáveis `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` estão corretas e acessíveis.

## Scripts Disponíveis

- `npm run init:db` - Inicializa o banco de dados completo
- `npm run init:db:old` - Script antigo (cria apenas teste_ci)
- `npm run test:db` - Testa conexão com o banco

## Desenvolvimento

Para adicionar novas tabelas:

1. Edite `src/schema-complete.sql`
2. Execute `npm run init:db` (tabelas com `IF NOT EXISTS` não serão duplicadas)
3. Adicione seeds em `src/init-database-complete.mjs` se necessário
