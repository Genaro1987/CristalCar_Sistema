import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM fin_condicoes_pagamento
      ORDER BY ativo DESC, nome ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar condições:', error);
    return Response.json({ error: 'Erro ao buscar condições' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_condicoes_pagamento (
          nome, descricao, tipo, forma_pagamento_id,
          qtd_parcelas, dias_primeira_parcela, dias_entre_parcelas,
          acrescimo_percentual, desconto_percentual,
          observacoes, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        data.ativo ? 1 : 0
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar condição:', error);
    return Response.json({ error: 'Erro ao criar condição' }, { status: 500 });
  }
}
