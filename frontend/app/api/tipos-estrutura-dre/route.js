import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tiposPadrao = [
  // Componentes do Modelo Oficial
  { codigo: 'RECEITA_BRUTA', nome: 'Receita Bruta', ordem: 1 },
  { codigo: 'DEDUCOES', nome: 'Deduções e Impostos', ordem: 2 },
  { codigo: 'RECEITA_LIQUIDA', nome: 'Receita Líquida', ordem: 3 },
  { codigo: 'CPV', nome: 'Custo dos Produtos Vendidos (CPV/CMV)', ordem: 4 },
  { codigo: 'LUCRO_BRUTO', nome: 'Lucro Bruto', ordem: 5 },
  { codigo: 'DESPESAS_OPERACIONAIS', nome: 'Despesas Operacionais', ordem: 6 },
  { codigo: 'DESPESAS_FINANCEIRAS', nome: 'Despesas Financeiras', ordem: 7 },
  { codigo: 'RECEITAS_FINANCEIRAS', nome: 'Receitas Financeiras', ordem: 8 },
  { codigo: 'OUTRAS_RECEITAS', nome: 'Outras Receitas Operacionais', ordem: 9 },
  { codigo: 'RESULTADO_ANTES_IR', nome: 'Resultado Antes do IRPJ e CSLL', ordem: 10 },
  { codigo: 'IR_CSLL', nome: 'IRPJ e CSLL', ordem: 11 },
  { codigo: 'LUCRO_LIQUIDO', nome: 'Lucro Líquido do Exercício', ordem: 12 },

  // Componentes adicionais do Modelo EBITDA
  { codigo: 'MARGEM_BRUTA', nome: 'Margem Bruta', ordem: 13 },
  { codigo: 'DESPESAS_VARIAVEIS', nome: 'Despesas Variáveis', ordem: 14 },
  { codigo: 'MARGEM_CONTRIBUICAO', nome: 'Margem de Contribuição', ordem: 15 },
  { codigo: 'GASTOS_PESSOAL', nome: 'Gastos com Pessoal', ordem: 16 },
  { codigo: 'EBITDA', nome: 'EBITDA', ordem: 17 },
  { codigo: 'DEPRECIACAO_AMORTIZACAO', nome: 'Depreciação, Amortização ou Exaustão', ordem: 18 },
  { codigo: 'OUTRAS_RECEITAS_DESPESAS', nome: 'Outras Receitas e Despesas', ordem: 19 },
  { codigo: 'RESULTADO_LIQUIDO', nome: 'Resultado Líquido', ordem: 20 },

  // Componentes adicionais do Modelo Custeio Variável
  { codigo: 'RECEITA_VENDAS', nome: 'Receita de Vendas', ordem: 21 },
  { codigo: 'CUSTOS_VARIAVEIS', nome: 'Custos Variáveis', ordem: 22 },
  { codigo: 'MARGEM_CONTRIBUICAO_TOTAL', nome: 'Margem de Contribuição Total', ordem: 23 },
  { codigo: 'CUSTOS_FIXOS', nome: 'Custos Fixos', ordem: 24 },
  { codigo: 'DESPESAS_FIXAS', nome: 'Despesas Fixas', ordem: 25 },

  // Outros componentes úteis
  { codigo: 'DESPESAS_VENDAS', nome: 'Despesas com Vendas', ordem: 26 },
  { codigo: 'DESPESAS_ADMIN', nome: 'Despesas Administrativas', ordem: 27 },
  { codigo: 'RESULTADO_FINANCEIRO', nome: 'Resultado Financeiro', ordem: 28 },
  { codigo: 'OUTRAS_DESPESAS', nome: 'Outras Despesas', ordem: 29 },
  { codigo: 'LUCRO_OPERACIONAL', nome: 'Lucro Operacional', ordem: 30 },
];

async function garantirTabela() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_tipos_estrutura_dre (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(50) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      descricao TEXT,
      ordem INTEGER DEFAULT 999,
      status VARCHAR(20) DEFAULT 'ATIVO',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Adicionar coluna ordem se não existir
  try {
    await turso.execute(`ALTER TABLE fin_tipos_estrutura_dre ADD COLUMN ordem INTEGER DEFAULT 999`);
  } catch (e) {
    // Coluna já existe
  }
}

async function garantirSeeds() {
  await garantirTabela();
  const existentes = await turso.execute('SELECT codigo FROM fin_tipos_estrutura_dre');
  const codigos = existentes.rows?.map((row) => row.codigo) || [];

  for (const tipo of tiposPadrao) {
    if (!codigos.includes(tipo.codigo)) {
      await turso.execute({
        sql: 'INSERT INTO fin_tipos_estrutura_dre (codigo, nome, ordem, status) VALUES (?, ?, ?, ?)',
        args: [tipo.codigo, tipo.nome, tipo.ordem, 'ATIVO'],
      });
    }
  }
}

export async function GET() {
  try {
    await garantirSeeds();
    const result = await turso.execute('SELECT * FROM fin_tipos_estrutura_dre WHERE status != "INATIVO" ORDER BY ordem ASC, nome ASC');
    return NextResponse.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao listar tipos de estrutura do DRE:', error);
    return NextResponse.json({ error: 'Erro ao listar tipos de estrutura do DRE' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabela();
    const body = await request.json();
    const codigo = normalizarTexto(body.codigo);
    const nome = normalizarTexto(body.nome);

    if (!codigo || !nome) {
      return NextResponse.json({ error: 'Código e nome são obrigatórios.' }, { status: 400 });
    }

    await turso.execute({
      sql: 'INSERT INTO fin_tipos_estrutura_dre (codigo, nome, descricao, status) VALUES (?, ?, ?, ?)',
      args: [codigo, nome, body.descricao || null, body.status ? normalizarTexto(body.status) : 'ATIVO'],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao criar tipo de estrutura do DRE:', error);
    return NextResponse.json({ error: 'Erro ao criar tipo de estrutura do DRE' }, { status: 500 });
  }
}
