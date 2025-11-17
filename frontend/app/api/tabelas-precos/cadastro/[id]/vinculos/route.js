import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasVinculos() {
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

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tab_tabelas_precos_parceiros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tabela_preco_id INTEGER NOT NULL,
      parceiro_id INTEGER NOT NULL,
      data_inicio DATE,
      data_fim DATE,
      ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
      FOREIGN KEY (parceiro_id) REFERENCES par_parceiros(id) ON DELETE CASCADE,
      UNIQUE(tabela_preco_id, parceiro_id)
    )
  `);
}

export async function GET(request, { params }) {
  try {
    await garantirTabelasVinculos();
    const { id } = params;

    const result = await turso.execute({
      sql: `
        SELECT parceiro_id
        FROM tab_tabelas_precos_parceiros
        WHERE tabela_preco_id = ?
      `,
      args: [id]
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar vínculos:', error);
    return Response.json({ error: 'Erro ao buscar vínculos' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await garantirTabelasVinculos();
    const { id } = params;
    const { parceiros } = await request.json();

    // Remove todos os vínculos existentes
    await turso.execute({
      sql: 'DELETE FROM tab_tabelas_precos_parceiros WHERE tabela_preco_id = ?',
      args: [id]
    });

    // Insere os novos vínculos
    if (parceiros && parceiros.length > 0) {
      for (const parceiroId of parceiros) {
        await turso.execute({
          sql: `
            INSERT INTO tab_tabelas_precos_parceiros (tabela_preco_id, parceiro_id)
            VALUES (?, ?)
          `,
          args: [id, parceiroId]
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar vínculos:', error);
    return Response.json({ error: 'Erro ao salvar vínculos' }, { status: 500 });
  }
}
