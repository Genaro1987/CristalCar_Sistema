import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelaFormasPagamento() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_formas_pagamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      descricao VARCHAR(200) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      taxa_percentual DECIMAL(10,2) DEFAULT 0,
      taxa_fixa DECIMAL(10,2) DEFAULT 0,
      gera_movimento_bancario BOOLEAN DEFAULT 0,
      status VARCHAR(20) DEFAULT 'ATIVO',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  try {
    await garantirTabelaFormasPagamento();
    const result = await turso.execute(`
      SELECT * FROM fin_formas_pagamento
      ORDER BY status DESC, descricao ASC
    `);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    return Response.json({ error: 'Erro ao buscar formas de pagamento' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelaFormasPagamento();
    const data = await request.json();

    // Gerar código sequencial se não fornecido
    let codigo = data.codigo;
    if (!codigo) {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM fin_formas_pagamento
        WHERE codigo LIKE 'FPAG-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[1]) || 0;
        codigo = `FPAG-${String(ultimoNumero + 1).padStart(3, '0')}`;
      } else {
        codigo = 'FPAG-001';
      }
    }

    // Normalizar campos de texto (MAIÚSCULO sem acentos)
    const descricao = normalizarTexto(data.descricao);

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_formas_pagamento (
          codigo, descricao, tipo,
          taxa_percentual, taxa_fixa,
          gera_movimento_bancario, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        codigo,
        descricao,
        data.tipo,
        data.taxa_percentual || 0,
        data.taxa_fixa || 0,
        data.gera_movimento_bancario ? 1 : 0,
        data.status || (data.ativo ? 'ATIVO' : 'INATIVO')
      ]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid),
      codigo: codigo
    });
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    return Response.json({ error: 'Erro ao criar forma de pagamento: ' + error.message }, { status: 500 });
  }
}
