import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.estrutura_dre_id || !data.plano_conta_id) {
      return Response.json({
        error: 'estrutura_dre_id e plano_conta_id são obrigatórios'
      }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `INSERT INTO fin_estrutura_dre_vinculos (estrutura_dre_id, plano_conta_id)
            VALUES (?, ?)`,
      args: [data.estrutura_dre_id, data.plano_conta_id]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid)
    });
  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      return Response.json({
        error: 'Este vínculo já existe'
      }, { status: 400 });
    }
    console.error('Erro ao criar vínculo:', error);
    return Response.json({
      error: 'Erro ao criar vínculo: ' + error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM fin_estrutura_dre_vinculos WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir vínculo:', error);
    return Response.json({
      error: 'Erro ao excluir vínculo: ' + error.message
    }, { status: 500 });
  }
}
