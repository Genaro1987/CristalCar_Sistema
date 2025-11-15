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
        UPDATE fin_bancos
        SET codigo = ?,
            nome = ?,
            nome_completo = ?,
            site = ?,
            telefone = ?,
            agencia = ?,
            conta = ?,
            tipo_conta = ?,
            permite_ofx = ?,
            config_ofx = ?,
            observacoes = ?,
            ativo = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.codigo || null,
        data.nome,
        data.nome_completo || null,
        data.site || null,
        data.telefone || null,
        data.agencia || null,
        data.conta || null,
        data.tipo_conta || 'CORRENTE',
        data.permite_ofx ? 1 : 0,
        data.config_ofx || null,
        data.observacoes || null,
        data.ativo ? 1 : 0,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    return Response.json({ error: 'Erro ao atualizar banco' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Verificar se o banco está sendo usado em movimentações
    const checkResult = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM mov_lancamentos_financeiros WHERE banco_id = ?',
      args: [id]
    });

    if (checkResult.rows[0].count > 0) {
      return Response.json(
        { error: 'Não é possível excluir. Este banco está sendo usado em lançamentos financeiros.' },
        { status: 400 }
      );
    }

    await turso.execute({
      sql: 'DELETE FROM fin_bancos WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir banco:', error);
    return Response.json({ error: 'Erro ao excluir banco' }, { status: 500 });
  }
}
