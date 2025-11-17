import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

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
      { nome: 'data_inicio_vigencia', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN data_inicio_vigencia DATE' },
      { nome: 'data_fim_vigencia', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN data_fim_vigencia DATE' },
      { nome: 'ativo', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN ativo BOOLEAN DEFAULT 1' },
      { nome: 'ativa', ddl: 'ALTER TABLE tab_tabelas_precos ADD COLUMN ativa BOOLEAN DEFAULT 1' },
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

    // Gerar código sequencial se não fornecido
    let codigo = data.codigo;
    if (!codigo) {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM tab_tabelas_precos
        WHERE codigo LIKE 'TAB-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[1]) || 0;
        codigo = `TAB-${String(ultimoNumero + 1).padStart(3, '0')}`;
      } else {
        codigo = 'TAB-001';
      }
    }

    // Verificar colunas legado
    const tableInfo = await turso.execute('PRAGMA table_info(tab_tabelas_precos)');
    const colunas = tableInfo?.rows?.map((row) => row.name) || [];
    const temNomeTabela = colunas.includes('nome_tabela');
    const temDataInicioVigencia = colunas.includes('data_inicio_vigencia');
    const temDataFimVigencia = colunas.includes('data_fim_vigencia');
    const temAtiva = colunas.includes('ativa');

    // Construir INSERT dinamicamente
    let colunasSql = 'codigo, nome, descricao, tipo_ajuste, valor_ajuste, data_inicio, data_fim, tipo_tabela, empresa_id, observacoes, ativo';
    let placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
    let args = [
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
    ];

    // Adicionar colunas legado se existirem
    if (temNomeTabela) {
      colunasSql += ', nome_tabela';
      placeholders += ', ?';
      args.push(data.nome || data.tipo_tabela || 'TABELA');
    }
    if (temDataInicioVigencia) {
      colunasSql += ', data_inicio_vigencia';
      placeholders += ', ?';
      args.push(data.data_inicio || data.data_inicio_vigencia || new Date().toISOString().split('T')[0]);
    }
    if (temDataFimVigencia) {
      colunasSql += ', data_fim_vigencia';
      placeholders += ', ?';
      args.push(data.data_fim || data.data_fim_vigencia || null);
    }
    if (temAtiva) {
      colunasSql += ', ativa';
      placeholders += ', ?';
      args.push(data.ativo ? 1 : 0);
    }

    const result = await turso.execute({
      sql: `INSERT INTO tab_tabelas_precos (${colunasSql}) VALUES (${placeholders})`,
      args: args
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid),
      codigo: codigo
    });
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    return Response.json({ error: 'Erro ao criar tabela: ' + error.message }, { status: 500 });
  }
}
