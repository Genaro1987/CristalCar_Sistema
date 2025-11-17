import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelaLayouts() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS adm_layouts_importacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome_layout VARCHAR(100) NOT NULL,
      tipo_arquivo VARCHAR(50) NOT NULL,
      descricao TEXT,
      delimitador VARCHAR(5),
      encoding VARCHAR(20),
      tem_cabecalho BOOLEAN DEFAULT 1,
      linha_inicio_dados INTEGER DEFAULT 1,
      mapeamento_campos TEXT,
      regras_validacao TEXT,
      regras_transformacao TEXT,
      status VARCHAR(20) DEFAULT 'ATIVO',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migração: garantir que coluna codigo existe
  try {
    const tableInfo = await turso.execute('PRAGMA table_info(adm_layouts_importacao)');
    const temCodigo = tableInfo.rows?.some(row => row.name === 'codigo');

    if (!temCodigo) {
      await turso.execute('ALTER TABLE adm_layouts_importacao ADD COLUMN codigo VARCHAR(20)');

      const registros = await turso.execute('SELECT id FROM adm_layouts_importacao');
      for (const reg of registros.rows) {
        const codigo = `LAY-${String(reg.id).padStart(4, '0')}`;
        await turso.execute({
          sql: 'UPDATE adm_layouts_importacao SET codigo = ? WHERE id = ?',
          args: [codigo, reg.id]
        });
      }

      await turso.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_layouts_codigo ON adm_layouts_importacao(codigo)');
    }
  } catch (error) {
    console.log('Migração codigo layouts:', error.message);
  }

  // Seed layouts SICOOB e BMP se não existirem
  const existentes = await turso.execute('SELECT COUNT(*) as total FROM adm_layouts_importacao');
  if (existentes.rows[0].total === 0) {
    const layoutsPadrao = [
      {
        codigo: 'LAY-0001',
        nome_layout: 'SICOOB - Extrato CSV',
        tipo_arquivo: 'EXTRATO_CSV',
        descricao: 'Layout padrão para importação de extratos bancários SICOOB em formato CSV',
        delimitador: ';',
        encoding: 'UTF-8',
        tem_cabecalho: 1,
        linha_inicio_dados: 2,
        mapeamento_campos: JSON.stringify([
          { origem: 'coluna_1', nome_origem: 'Data', destino: 'data' },
          { origem: 'coluna_2', nome_origem: 'Descrição', destino: 'descricao' },
          { origem: 'coluna_3', nome_origem: 'Valor', destino: 'valor' },
          { origem: 'coluna_4', nome_origem: 'Documento', destino: 'documento' }
        ]),
        status: 'ATIVO'
      },
      {
        codigo: 'LAY-0002',
        nome_layout: 'BMP Money Plus - Extrato CSV',
        tipo_arquivo: 'EXTRATO_CSV',
        descricao: 'Layout padrão para importação de extratos bancários BMP Money Plus em formato CSV',
        delimitador: ',',
        encoding: 'UTF-8',
        tem_cabecalho: 1,
        linha_inicio_dados: 2,
        mapeamento_campos: JSON.stringify([
          { origem: 'coluna_1', nome_origem: 'Data', destino: 'data' },
          { origem: 'coluna_2', nome_origem: 'Histórico', destino: 'descricao' },
          { origem: 'coluna_3', nome_origem: 'Débito', destino: 'valor_debito' },
          { origem: 'coluna_4', nome_origem: 'Crédito', destino: 'valor_credito' },
          { origem: 'coluna_5', nome_origem: 'Saldo', destino: 'saldo' }
        ]),
        status: 'ATIVO'
      }
    ];

    for (const layout of layoutsPadrao) {
      await turso.execute({
        sql: `INSERT INTO adm_layouts_importacao
              (codigo, nome_layout, tipo_arquivo, descricao, delimitador, encoding, tem_cabecalho, linha_inicio_dados, mapeamento_campos, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          layout.codigo,
          layout.nome_layout,
          layout.tipo_arquivo,
          layout.descricao,
          layout.delimitador,
          layout.encoding,
          layout.tem_cabecalho,
          layout.linha_inicio_dados,
          layout.mapeamento_campos,
          layout.status
        ]
      });
    }
  }
}

export async function GET(request) {
  try {
    await garantirTabelaLayouts();

    const { searchParams } = new URL(request.url);
    const tipoArquivo = searchParams.get('tipo_arquivo');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM adm_layouts_importacao WHERE 1=1';
    const args = [];

    if (tipoArquivo) {
      sql += ' AND tipo_arquivo = ?';
      args.push(tipoArquivo);
    }

    if (status) {
      sql += ' AND status = ?';
      args.push(status);
    }

    sql += ' ORDER BY nome_layout ASC';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    // Parse JSON fields
    const layouts = serializeRows(result.rows).map(layout => ({
      ...layout,
      mapeamento_campos: layout.mapeamento_campos ? JSON.parse(layout.mapeamento_campos) : [],
      regras_validacao: layout.regras_validacao ? JSON.parse(layout.regras_validacao) : [],
      regras_transformacao: layout.regras_transformacao ? JSON.parse(layout.regras_transformacao) : []
    }));

    return Response.json(layouts);
  } catch (error) {
    console.error('Erro ao buscar layouts:', error);
    return Response.json({ error: 'Erro ao buscar layouts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelaLayouts();
    const data = await request.json();

    if (!data.nome_layout || !data.tipo_arquivo) {
      return Response.json({
        error: 'Campos obrigatórios: nome_layout, tipo_arquivo'
      }, { status: 400 });
    }

    // Gerar código sequencial
    let codigo = data.codigo;
    if (!codigo) {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM adm_layouts_importacao
        WHERE codigo LIKE 'LAY-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[1]) || 0;
        codigo = `LAY-${String(ultimoNumero + 1).padStart(4, '0')}`;
      } else {
        codigo = 'LAY-0001';
      }
    }

    const result = await turso.execute({
      sql: `INSERT INTO adm_layouts_importacao
            (codigo, nome_layout, tipo_arquivo, descricao, delimitador, encoding, tem_cabecalho,
             linha_inicio_dados, mapeamento_campos, regras_validacao, regras_transformacao, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        data.nome_layout,
        data.tipo_arquivo,
        data.descricao || null,
        data.delimitador || null,
        data.encoding || 'UTF-8',
        data.tem_cabecalho !== undefined ? (data.tem_cabecalho ? 1 : 0) : 1,
        data.linha_inicio_dados || 1,
        JSON.stringify(data.mapeamento_campos || []),
        JSON.stringify(data.regras_validacao || []),
        JSON.stringify(data.regras_transformacao || []),
        data.status || 'ATIVO'
      ]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid),
      codigo: codigo
    });
  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      return Response.json({
        error: 'Já existe um layout com este código'
      }, { status: 400 });
    }
    console.error('Erro ao criar layout:', error);
    return Response.json({ error: 'Erro ao criar layout: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelaLayouts();
    const data = await request.json();

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const updates = [];
    const args = [];

    if (data.nome_layout !== undefined) {
      updates.push('nome_layout = ?');
      args.push(data.nome_layout);
    }
    if (data.tipo_arquivo !== undefined) {
      updates.push('tipo_arquivo = ?');
      args.push(data.tipo_arquivo);
    }
    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      args.push(data.descricao);
    }
    if (data.delimitador !== undefined) {
      updates.push('delimitador = ?');
      args.push(data.delimitador);
    }
    if (data.encoding !== undefined) {
      updates.push('encoding = ?');
      args.push(data.encoding);
    }
    if (data.tem_cabecalho !== undefined) {
      updates.push('tem_cabecalho = ?');
      args.push(data.tem_cabecalho ? 1 : 0);
    }
    if (data.linha_inicio_dados !== undefined) {
      updates.push('linha_inicio_dados = ?');
      args.push(data.linha_inicio_dados);
    }
    if (data.mapeamento_campos !== undefined) {
      updates.push('mapeamento_campos = ?');
      args.push(JSON.stringify(data.mapeamento_campos));
    }
    if (data.regras_validacao !== undefined) {
      updates.push('regras_validacao = ?');
      args.push(JSON.stringify(data.regras_validacao));
    }
    if (data.regras_transformacao !== undefined) {
      updates.push('regras_transformacao = ?');
      args.push(JSON.stringify(data.regras_transformacao));
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      args.push(data.status);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE adm_layouts_importacao SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar layout:', error);
    return Response.json({ error: 'Erro ao atualizar layout: ' + error.message }, { status: 500 });
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
      sql: 'DELETE FROM adm_layouts_importacao WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir layout:', error);
    return Response.json({ error: 'Erro ao excluir layout: ' + error.message }, { status: 500 });
  }
}
