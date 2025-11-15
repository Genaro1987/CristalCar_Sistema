import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM par_parceiros
      ORDER BY nome_razao_social ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    return Response.json({ error: 'Erro ao buscar parceiros' }, { status: 500 });
  }
}
