import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM fin_condicoes_pagamento
      ORDER BY status DESC, nome ASC
    `);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar condições:', error);
    return Response.json({ error: 'Erro ao buscar condições' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Normalizar campos de texto (MAIÚSCULO sem acentos)
    const nome = normalizarTexto(data.nome);
    const descricao = data.descricao ? normalizarTexto(data.descricao) : null;
    const observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null;

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_condicoes_pagamento (
          codigo, nome, descricao, tipo, forma_pagamento_id,
          quantidade_parcelas, dias_primeira_parcela, dias_entre_parcelas,
          percentual_desconto, percentual_acrescimo,
          status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        observacoes
      ]
    });

    return Response.json({ success: true, id: serializeValue(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar condição:', error);
    return Response.json({ error: 'Erro ao criar condição: ' + error.message }, { status: 500 });
  }
}
