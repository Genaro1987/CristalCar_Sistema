import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM adm_historico_backup
      ORDER BY data_backup DESC
      LIMIT 50
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico de backup:', error);
    return Response.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await turso.execute({
      sql: `
        INSERT INTO adm_historico_backup (
          tipo_backup, nome_arquivo, tamanho_bytes, caminho_completo,
          data_backup, status, tempo_execucao, mensagem
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        data.tipo_backup,
        data.nome_arquivo,
        data.tamanho_bytes || 0,
        data.caminho_completo || null,
        data.data_backup || new Date().toISOString(),
        data.status || 'SUCESSO',
        data.tempo_execucao || 0,
        data.mensagem || null
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao registrar backup:', error);
    return Response.json({ error: 'Erro ao registrar backup' }, { status: 500 });
  }
}
