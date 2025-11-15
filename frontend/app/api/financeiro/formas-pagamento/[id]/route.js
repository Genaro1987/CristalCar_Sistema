import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    await turso.execute({
      sql: `
        UPDATE fin_formas_pagamento SET
          codigo = ?,
          descricao = ?,
          tipo = ?,
          taxa_percentual = ?,
          taxa_fixa = ?,
          gera_movimento_bancario = ?,
          ativo = ?
        WHERE id = ?
      `,
      args: [
        data.codigo || null,
        data.descricao,
        data.tipo,
        data.taxa_percentual || 0,
        data.taxa_fixa || 0,
        data.gera_movimento_bancario ? 1 : 0,
        data.status === 'ATIVO' ? 1 : 0,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar forma de pagamento:', error);
    return Response.json({ error: 'Erro ao atualizar forma de pagamento' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await turso.execute({
      sql: 'DELETE FROM fin_formas_pagamento WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir forma de pagamento:', error);
    return Response.json({ error: 'Erro ao excluir forma de pagamento' }, { status: 500 });
  }
}
