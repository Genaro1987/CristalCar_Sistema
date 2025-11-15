import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id } = params;

    await turso.execute({
      sql: `
        UPDATE tab_tabelas_precos
        SET nome = ?,
            descricao = ?,
            tipo_ajuste = ?,
            valor_ajuste = ?,
            data_inicio = ?,
            data_fim = ?,
            observacoes = ?,
            ativo = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.nome,
        data.descricao || null,
        data.tipo_ajuste,
        data.valor_ajuste,
        data.data_inicio || null,
        data.data_fim || null,
        data.observacoes || null,
        data.ativo ? 1 : 0,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar tabela:', error);
    return Response.json({ error: 'Erro ao atualizar tabela' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await turso.execute({
      sql: 'DELETE FROM tab_tabelas_precos WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir tabela:', error);
    return Response.json({ error: 'Erro ao excluir tabela' }, { status: 500 });
  }
}
