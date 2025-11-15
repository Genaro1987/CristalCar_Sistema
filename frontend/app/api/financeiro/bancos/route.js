import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM fin_bancos
      ORDER BY ativo DESC, nome ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar bancos:', error);
    return Response.json({ error: 'Erro ao buscar bancos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_bancos (
          codigo, nome, nome_completo, site, telefone,
          agencia, conta, tipo_conta,
          permite_ofx, config_ofx,
          observacoes, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        data.ativo ? 1 : 0
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar banco:', error);
    return Response.json({ error: 'Erro ao criar banco' }, { status: 500 });
  }
}
