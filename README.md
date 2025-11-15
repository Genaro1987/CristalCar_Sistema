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

### 1. **Módulo Administrativo** (Prefixo: `adm_`)
- ✅ Cadastro de Funcionários
- ✅ Cadastro de Usuários
- ✅ Controle de Permissões por Módulo
- ✅ Log de Acessos
- ✅ Sistema de Autenticação

### 2. **Módulo Financeiro** (Prefixo: `fin_`)
- ✅ Plano de Contas (até 9 níveis)
- ✅ Estrutura do DRE
- ✅ Cadastro de Bancos
- ✅ Formas de Pagamento
- ✅ Centro de Custo

### 3. **Movimentação Financeira** (Prefixo: `mov_`)
- ✅ Registro de Entradas e Saídas
- ✅ Conciliação Bancária
- ✅ Controle de Saldo

### 4. **Faturamento** (Prefixo: `fat_`)
- ✅ Cadastro de Clientes
- ✅ Notas Fiscais de Venda
- ✅ Contas a Receber
- ✅ Controle de Recebimentos

### 5. **Compras** (Prefixo: `com_`)
- ✅ Cadastro de Fornecedores
- ✅ Notas Fiscais de Compra
- ✅ Contas a Pagar
- ✅ Controle de Pagamentos

### 6. **Importação** (Prefixo: `imp_`)
- ✅ Importação de XML (Vendas/Compras)
- ✅ Log de Importações
- 🔄 Importação via E-mail (em desenvolvimento)
- 🔄 Importação via API SEFAZ (em desenvolvimento)

### 7. **Objetivos e Metas** (Prefixo: `obj_`)
- ✅ Objetivos Trimestrais
- ✅ Metas Semanais
- ✅ Acompanhamento Meta x Realizado

### 8. **Relatórios**
- ✅ DRE (Demonstrativo de Resultado)
- ✅ Fluxo de Caixa (Realizado/Projetado/Consolidado)
- ✅ Visões Personalizadas
- 🔄 Exportação para Excel/PDF (em desenvolvimento)

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
# Criar todas as tabelas
npm run db:init

# Popular com dados iniciais
npm run db:seed

# Ou executar os dois comandos
npm run db:setup
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

## 🔑 Acesso Inicial

Após executar o seed do banco de dados:

- **Usuário**: `admin`
- **Senha**: `admin123`

## 📋 Estrutura do Banco de Dados

### Organização por Prefixos

| Prefixo | Módulo | Quantidade de Tabelas |
|---------|--------|----------------------|
| `adm_` | Administrativo | 4 tabelas |
| `fin_` | Financeiro | 7 tabelas |
| `mov_` | Movimentação | 2 tabelas |
| `fat_` | Faturamento | 4 tabelas |
| `com_` | Compras | 4 tabelas |
| `imp_` | Importação | 2 tabelas |
| `obj_` | Objetivos | 2 tabelas |

**Total**: 25 tabelas + 4 views + triggers automáticos

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
- `GET /api/plano-contas` - Listar contas
- `POST /api/plano-contas` - Criar conta
- `PUT /api/plano-contas` - Atualizar conta
- `DELETE /api/plano-contas` - Inativar conta

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

### 🔐 Segurança
- Autenticação com bcrypt
- Controle de permissões por módulo
- Log de todas as ações
- Proteção contra força bruta (bloqueio após 5 tentativas)

## 📈 Próximas Funcionalidades

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