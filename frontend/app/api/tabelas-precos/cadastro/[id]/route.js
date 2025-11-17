import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelaPrincipal() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tab_tabelas_precos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      descricao TEXT,
      tipo_ajuste VARCHAR(20) NOT NULL,
      valor_ajuste DECIMAL(15,2) NOT NULL,
      data_inicio DATE,
      data_fim DATE,
      ativo BOOLEAN DEFAULT 1,
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function PUT(request, { params }) {
  try {
    await garantirTabelaPrincipal();
    const data = await request.json();
    const { id } = params;

    await turso.execute({
      sql: `
        UPDATE tab_tabelas_precos
        SET nome = ?,
            descricao = ?,
            tipo_ajuste = ?,
            valor_ajuste = ?,
            data_inicio = ?,
            data_fim = ?,
            observacoes = ?,
            ativo = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.nome,
        data.descricao || null,
        data.tipo_ajuste,
        data.valor_ajuste,
        data.data_inicio || null,
        data.data_fim || null,
        data.observacoes || null,
        data.ativo ? 1 : 0,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar tabela:', error);
    return Response.json({ error: 'Erro ao atualizar tabela: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await garantirTabelaPrincipal();
    const { id } = params;

    await turso.execute({
      sql: 'DELETE FROM tab_tabelas_precos WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir tabela:', error);
    return Response.json({ error: 'Erro ao excluir tabela: ' + error.message }, { status: 500 });
  }
}
