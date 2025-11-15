import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await turso.execute({
      sql: `
        SELECT parceiro_id
        FROM tab_tabelas_precos_parceiros
        WHERE tabela_preco_id = ?
      `,
      args: [id]
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar vínculos:', error);
    return Response.json({ error: 'Erro ao buscar vínculos' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { parceiros } = await request.json();

    // Remove todos os vínculos existentes
    await turso.execute({
      sql: 'DELETE FROM tab_tabelas_precos_parceiros WHERE tabela_preco_id = ?',
      args: [id]
    });

    // Insere os novos vínculos
    if (parceiros && parceiros.length > 0) {
      for (const parceiroId of parceiros) {
        await turso.execute({
          sql: `
            INSERT INTO tab_tabelas_precos_parceiros (tabela_preco_id, parceiro_id)
            VALUES (?, ?)
          `,
          args: [id, parceiroId]
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar vínculos:', error);
    return Response.json({ error: 'Erro ao salvar vínculos' }, { status: 500 });
  }
}
