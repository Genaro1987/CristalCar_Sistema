import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

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
        UPDATE fin_regras_conciliacao
        SET nome = ?,
            descricao = ?,
            tipo_operacao = ?,
            tipo_regra = ?,
            texto_busca = ?,
            conta_id = ?,
            historico_padrao = ?,
            aplicacao_automatica = ?,
            prioridade = ?,
            observacoes = ?,
            ativo = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.nome,
        data.descricao || null,
        data.tipo_operacao,
        data.tipo_regra,
        data.texto_busca,
        data.conta_id,
        data.historico_padrao || null,
        data.aplicacao_automatica ? 1 : 0,
        data.prioridade || 100,
        data.observacoes || null,
        data.ativo ? 1 : 0,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar regra:', error);
    return Response.json({ error: 'Erro ao atualizar regra' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await turso.execute({
      sql: 'DELETE FROM fin_regras_conciliacao WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir regra:', error);
    return Response.json({ error: 'Erro ao excluir regra' }, { status: 500 });
  }
}
