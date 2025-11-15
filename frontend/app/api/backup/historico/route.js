import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT * FROM adm_backup_historico
        ORDER BY data_backup DESC
        LIMIT 50
      `,
      args: []
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico de backup:', error);
    return Response.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}
