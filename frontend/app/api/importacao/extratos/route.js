import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasExtratos() {
  // Tabela de layouts de extrato
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS imp_layouts_extrato (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      formato VARCHAR(20) NOT NULL,
      separador VARCHAR(10),
      col_data INTEGER,
      col_descricao INTEGER,
      col_valor INTEGER,
      col_tipo INTEGER,
      formato_data VARCHAR(20),
      ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de extratos importados
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS imp_extratos_bancarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      empresa_id INTEGER,
      layout_id INTEGER,
      nome_arquivo VARCHAR(500),
      data_importacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_linhas INTEGER,
      linhas_processadas INTEGER,
      linhas_erro INTEGER,
      status VARCHAR(20) DEFAULT 'PROCESSANDO',
      observacoes TEXT,
      FOREIGN KEY (layout_id) REFERENCES imp_layouts_extrato(id)
    )
  `);

  // Tabela de linhas do extrato
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS imp_extrato_linhas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      extrato_id INTEGER NOT NULL,
      linha_numero INTEGER,
      data_movimento DATE,
      descricao TEXT,
      valor DECIMAL(15,2),
      tipo VARCHAR(10),
      conciliado BOOLEAN DEFAULT 0,
      lancamento_id INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (extrato_id) REFERENCES imp_extratos_bancarios(id) ON DELETE CASCADE
    )
  `);

  // Garantir layouts padrão
  const layoutsPadrao = [
    {
      codigo: 'LAY-SICOOB',
      nome: 'SICOOB - OFX Padrao',
      tipo: 'SICOOB',
      formato: 'OFX',
      separador: null,
      col_data: null,
      col_descricao: null,
      col_valor: null,
      col_tipo: null,
      formato_data: 'YYYYMMDD'
    },
    {
      codigo: 'LAY-BMP',
      nome: 'BMP Money Plus - CSV',
      tipo: 'BMP_MONEY_PLUS',
      formato: 'CSV',
      separador: ';',
      col_data: 0,
      col_descricao: 1,
      col_valor: 2,
      col_tipo: 3,
      formato_data: 'DD/MM/YYYY'
    }
  ];

  const existentes = await turso.execute('SELECT codigo FROM imp_layouts_extrato');
  const codigosExistentes = existentes.rows?.map(row => row.codigo) || [];

  for (const layout of layoutsPadrao) {
    if (!codigosExistentes.includes(layout.codigo)) {
      await turso.execute({
        sql: `INSERT INTO imp_layouts_extrato
              (codigo, nome, tipo, formato, separador, col_data, col_descricao, col_valor, col_tipo, formato_data, ativo)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          layout.codigo,
          layout.nome,
          layout.tipo,
          layout.formato,
          layout.separador,
          layout.col_data,
          layout.col_descricao,
          layout.col_valor,
          layout.col_tipo,
          layout.formato_data,
          1
        ]
      });
    }
  }
}

export async function GET(request) {
  try {
    await garantirTabelasExtratos();

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    if (tipo === 'layouts') {
      const result = await turso.execute(
        'SELECT * FROM imp_layouts_extrato WHERE ativo = 1 ORDER BY nome ASC'
      );
      return Response.json(serializeRows(result.rows));
    }

    if (tipo === 'extratos') {
      const empresaId = searchParams.get('empresa_id');

      let sql = `
        SELECT e.*, l.nome as layout_nome
        FROM imp_extratos_bancarios e
        LEFT JOIN imp_layouts_extrato l ON l.id = e.layout_id
        WHERE 1=1
      `;
      const args = [];

      if (empresaId) {
        sql += ' AND (e.empresa_id = ? OR e.empresa_id IS NULL)';
        args.push(Number(empresaId));
      }

      sql += ' ORDER BY e.data_importacao DESC LIMIT 100';

      const result = args.length > 0
        ? await turso.execute({ sql, args })
        : await turso.execute(sql);

      return Response.json(serializeRows(result.rows));
    }

    return Response.json({ error: 'Tipo não especificado (layouts ou extratos)' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return Response.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasExtratos();
    const data = await request.json();

    // Gerar código do extrato
    const ultimoCodigo = await turso.execute(`
      SELECT codigo FROM imp_extratos_bancarios
      WHERE codigo LIKE 'EXT-%'
      ORDER BY codigo DESC LIMIT 1
    `);

    let codigo;
    if (ultimoCodigo.rows.length > 0) {
      const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[1]) || 0;
      codigo = `EXT-${String(ultimoNumero + 1).padStart(5, '0')}`;
    } else {
      codigo = 'EXT-00001';
    }

    const result = await turso.execute({
      sql: `INSERT INTO imp_extratos_bancarios
            (codigo, empresa_id, layout_id, nome_arquivo, total_linhas, linhas_processadas, linhas_erro, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        data.empresa_id || null,
        data.layout_id,
        data.nome_arquivo || 'extrato.txt',
        data.total_linhas || 0,
        data.linhas_processadas || 0,
        data.linhas_erro || 0,
        'PROCESSADO'
      ]
    });

    const extratoId = serializeValue(result.lastInsertRowid);

    // Inserir linhas do extrato
    if (data.linhas && Array.isArray(data.linhas)) {
      for (let i = 0; i < data.linhas.length; i++) {
        const linha = data.linhas[i];
        await turso.execute({
          sql: `INSERT INTO imp_extrato_linhas
                (extrato_id, linha_numero, data_movimento, descricao, valor, tipo)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            extratoId,
            i + 1,
            linha.data || null,
            linha.descricao || '',
            linha.valor || 0,
            linha.tipo || 'D'
          ]
        });
      }
    }

    return Response.json({
      success: true,
      id: extratoId,
      codigo: codigo
    });
  } catch (error) {
    console.error('Erro ao criar extrato:', error);
    return Response.json({ error: 'Erro ao criar extrato: ' + error.message }, { status: 500 });
  }
}
