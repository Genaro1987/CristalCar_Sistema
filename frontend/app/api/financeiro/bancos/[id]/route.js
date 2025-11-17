import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id } = params;

    // Normalizar campos de texto (MAIÚSCULO sem acentos)
    const nome_banco = normalizarTexto(data.nome_banco || data.nome);
    const observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null;

    await turso.execute({
      sql: `
        UPDATE fin_bancos
        SET codigo_banco = ?,
            nome_banco = ?,
            agencia = ?,
            conta = ?,
            tipo_conta = ?,
            saldo_inicial = ?,
            saldo_atual = ?,
            data_saldo_inicial = ?,
            plano_contas_id = ?,
            status = ?,
            observacoes = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.codigo_banco || data.codigo,
        nome_banco,
        data.agencia || null,
        data.conta || null,
        data.tipo_conta || 'CORRENTE',
        data.saldo_inicial || 0,
        data.saldo_atual || data.saldo_inicial || 0,
        data.data_saldo_inicial || null,
        data.plano_contas_id || null,
        data.status || (data.ativo ? 'ATIVO' : 'INATIVO'),
        observacoes,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    return Response.json({ error: 'Erro ao atualizar banco: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Verificar se o banco está sendo usado em movimentações
    const checkResult = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM mov_financeiro WHERE banco_id = ?',
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
    return Response.json({ error: 'Erro ao excluir banco: ' + error.message }, { status: 500 });
  }
}
