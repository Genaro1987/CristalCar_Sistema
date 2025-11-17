import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM fin_formas_pagamento
      ORDER BY status DESC, descricao ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    return Response.json({ error: 'Erro ao buscar formas de pagamento' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

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
        data.codigo || `FPAG${Date.now()}`,
        descricao,
        data.tipo,
        data.taxa_percentual || 0,
        data.taxa_fixa || 0,
        data.gera_movimento_bancario ? 1 : 0,
        data.status || (data.ativo ? 'ATIVO' : 'INATIVO')
      ]
    });

    return Response.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    return Response.json({ error: 'Erro ao criar forma de pagamento: ' + error.message }, { status: 500 });
  }
}
