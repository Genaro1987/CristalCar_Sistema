import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tiposPadrao = [
  { codigo: 'RECEITA_BRUTA', nome: 'Receita Bruta', ordem: 1 },
  { codigo: 'DEDUCOES', nome: 'Deduções', ordem: 2 },
  { codigo: 'RECEITA_LIQUIDA', nome: 'Receita Líquida', ordem: 3 },
  { codigo: 'CPV', nome: 'Custo dos Produtos Vendidos (CPV)', ordem: 4 },
  { codigo: 'LUCRO_BRUTO', nome: 'Lucro Bruto', ordem: 5 },
  { codigo: 'DESPESAS_OPERACIONAIS', nome: 'Despesas Operacionais', ordem: 6 },
  { codigo: 'DESPESAS_FINANCEIRAS', nome: 'Despesas Financeiras', ordem: 7 },
  { codigo: 'RECEITAS_FINANCEIRAS', nome: 'Receitas Financeiras', ordem: 8 },
  { codigo: 'OUTRAS_RECEITAS', nome: 'Outras Receitas', ordem: 9 },
  { codigo: 'RESULTADO_ANTES_IR', nome: 'Resultado Antes do IR', ordem: 10 },
  { codigo: 'IR_CSLL', nome: 'IR e CSLL', ordem: 11 },
  { codigo: 'LUCRO_LIQUIDO', nome: 'Lucro Líquido', ordem: 12 },
  { codigo: 'EBITDA', nome: 'EBITDA', ordem: 13 },
  { codigo: 'DESPESAS_VENDAS', nome: 'Despesas com Vendas', ordem: 14 },
  { codigo: 'DESPESAS_ADMIN', nome: 'Despesas Administrativas', ordem: 15 },
  { codigo: 'RESULTADO_FINANCEIRO', nome: 'Resultado Financeiro', ordem: 16 },
  { codigo: 'OUTRAS_DESPESAS', nome: 'Outras Despesas', ordem: 17 },
  { codigo: 'LUCRO_OPERACIONAL', nome: 'Lucro Operacional', ordem: 18 },
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
    return NextResponse.json(result.rows);
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
