import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM tab_historico_alteracoes
      ORDER BY data_alteracao DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return Response.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await turso.execute({
      sql: `
        INSERT INTO tab_historico_alteracoes (
          tabela_id, tipo_alteracao, descricao,
          valor_anterior, valor_novo, usuario
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        data.tabela_id,
        data.tipo_alteracao,
        data.descricao || null,
        data.valor_anterior || null,
        data.valor_novo || null,
        data.usuario || 'Sistema'
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar registro de histórico:', error);
    return Response.json({ error: 'Erro ao criar registro de histórico' }, { status: 500 });
  }
}
