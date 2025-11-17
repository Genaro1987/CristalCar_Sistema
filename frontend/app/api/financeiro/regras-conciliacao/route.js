import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM fin_regras_conciliacao
      ORDER BY prioridade DESC, nome ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar regras:', error);
    return Response.json({ error: 'Erro ao buscar regras' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_regras_conciliacao (
          nome, descricao, tipo_operacao, tipo_regra, texto_busca,
          conta_id, historico_padrao, aplicacao_automatica,
          prioridade, observacoes, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        data.ativo ? 1 : 0
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar regra:', error);
    return Response.json({ error: 'Erro ao criar regra' }, { status: 500 });
  }
}
