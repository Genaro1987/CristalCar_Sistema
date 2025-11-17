import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT
        t.*,
        COUNT(tp.parceiro_id) as parceiros_count
      FROM tab_tabelas_precos t
      LEFT JOIN tab_tabelas_precos_parceiros tp ON t.id = tp.tabela_preco_id
      GROUP BY t.id
      ORDER BY t.nome ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tabelas:', error);
    return Response.json({ error: 'Erro ao buscar tabelas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Garantir código único exigido pelo schema
    const codigo = data.codigo || `TAB${Date.now()}`;

    const result = await turso.execute({
      sql: `
        INSERT INTO tab_tabelas_precos (
          codigo, nome, descricao, tipo_ajuste, valor_ajuste,
          data_inicio, data_fim,
          observacoes, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        codigo,
        data.nome,
        data.descricao || null,
        data.tipo_ajuste,
        data.valor_ajuste,
        data.data_inicio || null,
        data.data_fim || null,
        data.observacoes || null,
        data.ativo ? 1 : 0
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    return Response.json({ error: 'Erro ao criar tabela' }, { status: 500 });
  }
}
