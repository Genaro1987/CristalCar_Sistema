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
        UPDATE fin_condicoes_pagamento
        SET nome = ?,
            descricao = ?,
            tipo = ?,
            forma_pagamento_id = ?,
            qtd_parcelas = ?,
            dias_primeira_parcela = ?,
            dias_entre_parcelas = ?,
            acrescimo_percentual = ?,
            desconto_percentual = ?,
            observacoes = ?,
            ativo = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.nome,
        data.descricao || null,
        data.tipo,
        data.forma_pagamento_id,
        data.qtd_parcelas || 1,
        data.dias_primeira_parcela || 0,
        data.dias_entre_parcelas || 30,
        data.acrescimo_percentual || 0,
        data.desconto_percentual || 0,
        data.observacoes || null,
        data.ativo ? 1 : 0,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar condição:', error);
    return Response.json({ error: 'Erro ao atualizar condição' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Verificar se a condição está sendo usada em vendas
    const checkResult = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM mov_vendas WHERE condicao_pagamento_id = ?',
      args: [id]
    });

    if (checkResult.rows[0].count > 0) {
      return Response.json(
        { error: 'Não é possível excluir. Esta condição está sendo usada em vendas.' },
        { status: 400 }
      );
    }

    await turso.execute({
      sql: 'DELETE FROM fin_condicoes_pagamento WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir condição:', error);
    return Response.json({ error: 'Erro ao excluir condição' }, { status: 500 });
  }
}
