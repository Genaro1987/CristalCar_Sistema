import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM fin_bancos
      ORDER BY status DESC, nome_banco ASC
    `);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar bancos:', error);
    return Response.json({ error: 'Erro ao buscar bancos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Normalizar campos de texto (MAIÚSCULO sem acentos)
    const nome_banco = normalizarTexto(data.nome_banco || data.nome);
    const observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null;

    if (!data.agencia || !data.conta) {
      return Response.json({ error: 'Informe agência e conta do banco.' }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_bancos (
          codigo_banco, nome_banco, agencia, conta, tipo_conta,
          saldo_inicial, saldo_atual, data_saldo_inicial,
          plano_contas_id, status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        observacoes
      ]
    });

    return Response.json({ success: true, id: serializeValue(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar banco:', error);
    return Response.json({ error: 'Erro ao criar banco: ' + error.message }, { status: 500 });
  }
}
