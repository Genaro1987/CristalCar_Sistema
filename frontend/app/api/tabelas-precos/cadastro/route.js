import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasPrecos() {
  try {
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

    const tableInfo = await turso.execute('PRAGMA table_info(tab_tabelas_precos)');
    const colunas = tableInfo?.rows?.map((row) => row.name) || [];

    const colunasObrigatorias = [
      { nome: 'nome', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN nome VARCHAR(200) NOT NULL DEFAULT ""' },
      { nome: 'descricao', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN descricao TEXT' },
      { nome: 'observacoes', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN observacoes TEXT' },
      { nome: 'tipo_ajuste', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN tipo_ajuste VARCHAR(20) NOT NULL DEFAULT "PERCENTUAL"' },
      { nome: 'valor_ajuste', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN valor_ajuste DECIMAL(15,2) NOT NULL DEFAULT 0' },
      { nome: 'tipo_tabela', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN tipo_tabela VARCHAR(20) DEFAULT "VENDA"' },
      { nome: 'empresa_id', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN empresa_id INTEGER' },
      { nome: 'data_inicio', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN data_inicio DATE' },
      { nome: 'data_fim', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN data_fim DATE' },
      { nome: 'ativo', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN ativo BOOLEAN DEFAULT 1' },
    ];

    for (const coluna of colunasObrigatorias) {
      if (!colunas.includes(coluna.nome)) {
        await turso.execute(coluna.ddl);
      }
    }

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
  } catch (error) {
    console.error('Erro ao garantir tabelas de preços:', error);
    throw error;
  }
}

export async function GET(request) {
  try {
    await garantirTabelasPrecos();
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');

    let sql = `
      SELECT
        t.*,
        COUNT(tp.parceiro_id) as parceiros_count
      FROM tab_tabelas_precos t
      LEFT JOIN tab_tabelas_precos_parceiros tp ON t.id = tp.tabela_preco_id
    `;

    const args = [];

    if (empresaId) {
      sql += ` WHERE (t.empresa_id = ? OR t.empresa_id IS NULL)`;
      args.push(Number(empresaId));
    }

    sql += ` GROUP BY t.id ORDER BY t.nome ASC`;

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar tabelas:', error);
    return Response.json({ error: 'Erro ao buscar tabelas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasPrecos();
    const data = await request.json();

    // Garantir código único exigido pelo schema
    const codigo = data.codigo || `TAB${Date.now()}`;

    const result = await turso.execute({
      sql: `
        INSERT INTO tab_tabelas_precos (
          codigo, nome, descricao, tipo_ajuste, valor_ajuste,
          data_inicio, data_fim, tipo_tabela, empresa_id,
          observacoes, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        codigo,
        data.nome,
        data.descricao || null,
        data.tipo_ajuste,
        data.valor_ajuste,
        data.data_inicio || null,
        data.data_fim || null,
        data.tipo_tabela || 'VENDA',
        data.empresa_id || null,
        data.observacoes || null,
        data.ativo ? 1 : 0
      ]
    });

    return Response.json({ success: true, id: serializeValue(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    return Response.json({ error: 'Erro ao criar tabela: ' + error.message }, { status: 500 });
  }
}
