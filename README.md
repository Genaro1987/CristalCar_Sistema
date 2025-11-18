# 🚗 CristalCar ERP - Sistema de Gestão Automotiva

Sistema ERP completo desenvolvido para empresas do segmento automotivo, com foco em gestão financeira, fluxo de caixa e DRE.

## 🎨 Identidade Visual

- **Cor Primária**: Laranja (`#f97316`)
- **Cor Secundária**: Cinza (`#6b7280`)
- **Design**: Moderno e profissional

## 🏗️ Arquitetura do Projeto

```
CristalCar_Sistema/
├── frontend/          # Next.js 14 + Vercel
│   ├── app/
│   │   ├── api/      # API Routes
│   │   ├── login/    # Página de login
│   │   └── dashboard/# Dashboard principal
│   └── ...
└── backend/          # Scripts e banco de dados
    └── src/
        ├── db.mjs           # Conexão Turso
        ├── auth.mjs         # Autenticação
        ├── schema.sql       # Schema do banco
        ├── init-database.mjs # Inicializar DB
        └── seed-database.mjs # Popular DB
```

## 📊 Módulos do Sistema

### 01.01 - **Administrativo** (Prefixo: `adm_`)
- ✅ Cadastro da Empresa (com upload de logo)
- ✅ Cadastro de Funcionários (controle de admissão/demissão, horários)
- ✅ Cadastro de Usuários com Permissões Detalhadas
- 🔄 Layouts de Importação (estrutura pronta)
- 🔄 Configuração de Backup (Google Drive)
- ✅ Registro de Log por Tela

### 01.02 - **Modelos de Plano** (Prefixo: `fin_`)
- ✅ Plano de Contas em Árvore (até 9 níveis hierárquicos)
- ✅ Estrutura do DRE Customizável
- ✅ Vinculação DRE x Plano de Contas

### 01.03 - **Financeiro** (Prefixo: `fin_`)
- ✅ Formas de Pagamento
- ✅ Condições de Pagamento (parcelamento)
- ✅ Cadastro de Bancos
- ✅ Regras de Conciliação Bancária (De-Para automático)
- ✅ Centro de Custo

### 01.04 - **Parceiros** (Prefixo: `par_`)
- ✅ Cadastro Unificado (Clientes/Fornecedores/Ambos)
- ✅ Múltiplos Contatos por Parceiro
- ✅ Dados Bancários e PIX

### 01.05 - **Tabelas de Preços** (Prefixo: `tab_`)
- ✅ Tabelas de Compra/Venda
- ✅ Vigência e Exclusividade
- ✅ Política de Descontos
- ✅ Histórico de Alterações

### **Movimentação Financeira** (Prefixo: `mov_`)
- ✅ Registro de Entradas e Saídas
- ✅ Conciliação Bancária
- ✅ Controle de Saldo
- ✅ Origem rastreável (Manual, XML, API)

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos
- **Vercel** - Deploy

### Backend
- **Turso** - Banco de dados SQLite distribuído
- **Node.js** - Runtime
- **bcryptjs** - Criptografia de senhas

## 📦 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/Genaro1987/CristalCar_Sistema.git
cd CristalCar_Sistema
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend`:
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 3. Inicializar Banco de Dados

```bash
# Criar todas as tabelas e inserir dados iniciais
npm run init:db
```

Este comando irá:
- ✅ Criar todas as tabelas do sistema (37 tabelas + views + triggers)
- ✅ Inserir dados da empresa Cristal Car
- ✅ Criar usuário administrador (admin/admin123)
- ✅ Criar plano de contas básico
- ✅ Cadastrar formas e condições de pagamento padrão
- ✅ Listar todas as tabelas criadas

**Verificar conexão:**
```bash
npm run test:db
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crie um arquivo `.env.local` na pasta `frontend`:
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔑 Acesso ao Sistema

Após executar `npm run init:db`, você pode acessar o sistema:

**URL:** `http://localhost:3000`

**Credenciais Padrão:**
- **Usuário:** admin
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro acesso!

### Sistema de Autenticação

A estrutura completa de autenticação está implementada:
- ✅ Tabelas de usuários, permissões detalhadas e logs
- ✅ API de login com bcrypt
- ✅ Controle de acesso por tela/função
- ✅ Sistema de bloqueio após tentativas falhas
- 🔄 Login desativado temporariamente (acesso direto ao dashboard)

Para ativar o login:
1. Descomentar verificação em `/app/page.js`
2. Descomentar verificação em `/app/dashboard/page.js`

## 📋 Estrutura do Banco de Dados

### Organização por Prefixos

| Prefixo | Módulo | Quantidade de Tabelas |
|---------|--------|----------------------|
| `adm_` | Administrativo | 9 tabelas |
| `fin_` | Financeiro | 12 tabelas |
| `mov_` | Movimentação | 1 tabela |
| `par_` | Parceiros | 2 tabelas |
| `tab_` | Tabelas de Preços | 2 tabelas |

**Total**: 26 tabelas + 3 views + triggers automáticos

### Detalhamento das Tabelas

**Administrativo:**
- adm_empresa, adm_funcionarios, adm_usuarios, adm_permissoes
- adm_layouts_importacao, adm_configuracao_backup, adm_historico_backup
- adm_configuracao_log, adm_log_acoes

**Financeiro:**
- fin_plano_contas, fin_estrutura_dre, fin_dre_plano_contas
- fin_formas_pagamento, fin_condicoes_pagamento, fin_condicoes_pagamento_parcelas
- fin_bancos, fin_tipos_registro_conciliacao, fin_regras_conciliacao
- fin_centro_custo

**Parceiros:**
- par_parceiros (cadastro unificado), par_contatos

**Tabelas de Preços:**
- tab_tabelas_precos, tab_tabelas_historico

### Características do Plano de Contas

- ✅ Suporta até 9 níveis hierárquicos
- ✅ Classificação por tipo (Receita/Despesa)
- ✅ Identificação de gastos fixos/variáveis
- ✅ Vinculação com objetivos
- ✅ Controle de lançamentos por conta

### Estrutura do DRE

O DRE segue a estrutura clássica:
1. Receita Operacional Bruta
2. (-) Deduções
3. (=) Receita Líquida
4. (-) Custos Diretos
5. (=) Lucro Bruto
6. (-) Despesas Operacionais
7. (=) EBITDA
8. (-) Despesas Financeiras
9. (+) Receitas Financeiras
10. (=) Resultado antes dos Tributos
11. (-) Tributos
12. (=) Resultado Líquido

## 🔌 APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Plano de Contas
- `GET /api/financeiro/plano-contas` - Listar contas
- `POST /api/financeiro/plano-contas` - Criar conta
- `PUT /api/financeiro/plano-contas` - Atualizar conta
- `DELETE /api/financeiro/plano-contas` - Inativar conta

### Movimentação Financeira
- `GET /api/movimentacao` - Listar movimentações
- `POST /api/movimentacao` - Criar movimentação
- `PUT /api/movimentacao` - Atualizar movimentação
- `DELETE /api/movimentacao` - Cancelar movimentação

### Relatórios
- `GET /api/relatorios/dre` - Gerar DRE por período
- `GET /api/relatorios/fluxo-caixa` - Gerar Fluxo de Caixa

## 🎯 Funcionalidades Principais

### 💰 Gestão Financeira
- Controle completo de entradas e saídas
- Conciliação bancária automática
- Múltiplos bancos e formas de pagamento
- Centro de custo para análise gerencial

### 📊 Relatórios Gerenciais
- **DRE**: Análise de resultado por período
- **Fluxo de Caixa**: Visão realizada, projetada e consolidada
- **Objetivos**: Acompanhamento de metas trimestrais e semanais
- Indicadores de margem (bruta, operacional, líquida)

### 📁 Importação de Documentos
- Importação de XML de notas fiscais (vendas/compras)
- Extração automática de dados
- Log completo de importações
- Validação de duplicidades (chave de acesso)

### 🔐 Segurança (Preparado para Implementação Futura)
- ✅ Estrutura de autenticação com bcrypt
- ✅ Controle de permissões por módulo
- ✅ Log de todas as ações
- ✅ Proteção contra força bruta (bloqueio após 5 tentativas)
- 🔄 Login desativado temporariamente (acesso direto ao sistema)

## 📈 Próximas Funcionalidades

- [ ] Ativar sistema de login e autenticação
- [ ] Dashboard com gráficos interativos
- [ ] Exportação de relatórios para Excel e PDF
- [ ] Importação de XML via e-mail
- [ ] Integração com API da SEFAZ
- [ ] App mobile
- [ ] Relatórios customizáveis
- [ ] Alertas e notificações
- [ ] Backup automático

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Contribuições são bem-vindas!

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Autores

Desenvolvido para CristalCar - Empresa do Segmento Automotivo

---

**Versão**: 1.0.0
**Data**: Novembro 2024