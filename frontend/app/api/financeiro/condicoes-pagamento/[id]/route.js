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
    const nome = normalizarTexto(data.nome);
    const descricao = data.descricao ? normalizarTexto(data.descricao) : null;
    const observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null;

    await turso.execute({
      sql: `
        UPDATE fin_condicoes_pagamento
        SET codigo = ?,
            nome = ?,
            descricao = ?,
            tipo = ?,
            forma_pagamento_id = ?,
            quantidade_parcelas = ?,
            dias_primeira_parcela = ?,
            dias_entre_parcelas = ?,
            percentual_desconto = ?,
            percentual_acrescimo = ?,
            status = ?,
            observacoes = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.codigo || `COND${Date.now()}`,
        nome,
        descricao,
        data.tipo,
        data.forma_pagamento_id,
        data.quantidade_parcelas || data.qtd_parcelas || 1,
        data.dias_primeira_parcela || 0,
        data.dias_entre_parcelas || 30,
        data.percentual_desconto || data.desconto_percentual || 0,
        data.percentual_acrescimo || data.acrescimo_percentual || 0,
        data.status || (data.ativo ? 'ATIVO' : 'INATIVO'),
        observacoes,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar condição:', error);
    return Response.json({ error: 'Erro ao atualizar condição: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // TODO: Verificar se a condição está sendo usada quando tabelas de vendas/compras forem implementadas
    // const checkResult = await turso.execute({
    //   sql: 'SELECT COUNT(*) as count FROM fat_notas_fiscais WHERE condicao_pagamento_id = ?',
    //   args: [id]
    // });

    await turso.execute({
      sql: 'DELETE FROM fin_condicoes_pagamento WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir condição:', error);
    return Response.json({ error: 'Erro ao excluir condição: ' + error.message }, { status: 500 });
  }
}
