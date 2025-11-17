import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    // Por enquanto usando usuario_id = 1 (fixo, até implementar autenticação)
    const result = await turso.execute({
      sql: `
        SELECT * FROM adm_favoritos
        WHERE usuario_id = ?
        ORDER BY ordem ASC, nome_tela ASC
      `,
      args: [1]
    });

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return Response.json({ error: 'Erro ao buscar favoritos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Verifica se já existe
    const existing = await turso.execute({
      sql: 'SELECT id FROM adm_favoritos WHERE usuario_id = ? AND codigo_tela = ?',
      args: [1, data.codigo_tela]
    });

    if (existing.rows.length > 0) {
      return Response.json({ error: 'Favorito já existe' }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `
        INSERT INTO adm_favoritos (
          usuario_id, codigo_tela, nome_tela, caminho_tela, ordem
        ) VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        1, // usuario_id fixo
        data.codigo_tela,
        data.nome_tela,
        data.caminho_tela,
        data.ordem || 0
      ]
    });

    return Response.json({ success: true, id: serializeValue(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar favorito:', error);
    return Response.json({ error: 'Erro ao criar favorito' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigoTela = searchParams.get('codigo_tela');

    if (!codigoTela) {
      return Response.json({ error: 'codigo_tela é obrigatório' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM adm_favoritos WHERE usuario_id = ? AND codigo_tela = ?',
      args: [1, codigoTela]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return Response.json({ error: 'Erro ao remover favorito' }, { status: 500 });
  }
}
