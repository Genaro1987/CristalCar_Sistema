import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasIndicadores() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS ind_indicadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      descricao TEXT,
      formula TEXT NOT NULL,
      unidade VARCHAR(20) DEFAULT 'VALOR',
      categoria VARCHAR(50),
      empresa_id INTEGER,
      ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Criar indicadores padrão
  const indicadoresPadrao = [
    {
      codigo: 'IND-001',
      nome: 'MARGEM LIQUIDA',
      descricao: 'Percentual do lucro liquido sobre a receita bruta',
      formula: '(LUCRO_LIQUIDO / RECEITA_BRUTA) * 100',
      unidade: 'PERCENTUAL',
      categoria: 'RENTABILIDADE'
    },
    {
      codigo: 'IND-002',
      nome: 'EBITDA',
      descricao: 'Lucro antes de juros, impostos, depreciacao e amortizacao',
      formula: 'LUCRO_OPERACIONAL + DEPRECIACAO + AMORTIZACAO',
      unidade: 'VALOR',
      categoria: 'RENTABILIDADE'
    },
    {
      codigo: 'IND-003',
      nome: 'ROI',
      descricao: 'Retorno sobre investimento',
      formula: '(LUCRO_LIQUIDO / INVESTIMENTO_TOTAL) * 100',
      unidade: 'PERCENTUAL',
      categoria: 'RENTABILIDADE'
    },
    {
      codigo: 'IND-004',
      nome: 'TICKET MEDIO',
      descricao: 'Valor medio por venda',
      formula: 'RECEITA_TOTAL / NUMERO_VENDAS',
      unidade: 'VALOR',
      categoria: 'COMERCIAL'
    }
  ];

  const existentes = await turso.execute('SELECT codigo FROM ind_indicadores');
  const codigosExistentes = existentes.rows?.map(row => row.codigo) || [];

  for (const ind of indicadoresPadrao) {
    if (!codigosExistentes.includes(ind.codigo)) {
      await turso.execute({
        sql: `INSERT INTO ind_indicadores
              (codigo, nome, descricao, formula, unidade, categoria, ativo)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          ind.codigo,
          ind.nome,
          ind.descricao,
          ind.formula,
          ind.unidade,
          ind.categoria,
          1
        ]
      });
    }
  }
}

export async function GET(request) {
  try {
    await garantirTabelasIndicadores();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const categoria = searchParams.get('categoria');
    const ativo = searchParams.get('ativo');

    let sql = 'SELECT * FROM ind_indicadores WHERE 1=1';
    const args = [];

    if (empresaId) {
      sql += ' AND (empresa_id = ? OR empresa_id IS NULL)';
      args.push(Number(empresaId));
    }

    if (categoria) {
      sql += ' AND categoria = ?';
      args.push(categoria);
    }

    if (ativo !== null && ativo !== undefined) {
      sql += ' AND ativo = ?';
      args.push(ativo === 'true' || ativo === '1' ? 1 : 0);
    }

    sql += ' ORDER BY categoria ASC, nome ASC';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    return Response.json({ error: 'Erro ao buscar indicadores' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasIndicadores();
    const data = await request.json();

    if (!data.nome || !data.formula) {
      return Response.json({
        error: 'Campos obrigatórios: nome, formula'
      }, { status: 400 });
    }

    // Gerar código sequencial
    let codigo = data.codigo;
    if (!codigo) {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM ind_indicadores
        WHERE codigo LIKE 'IND-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const match = ultimoCodigo.rows[0].codigo.match(/IND-(\d+)/);
        const ultimoNumero = match ? parseInt(match[1]) : 0;
        codigo = `IND-${String(ultimoNumero + 1).padStart(3, '0')}`;
      } else {
        codigo = 'IND-001';
      }
    }

    const nome = normalizarTexto(data.nome);
    const descricao = data.descricao ? normalizarTexto(data.descricao) : null;
    const categoria = data.categoria ? normalizarTexto(data.categoria) : null;

    const result = await turso.execute({
      sql: `INSERT INTO ind_indicadores
            (codigo, nome, descricao, formula, unidade, categoria, empresa_id, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        nome,
        descricao,
        data.formula,
        data.unidade || 'VALOR',
        categoria,
        data.empresa_id || null,
        data.ativo !== undefined ? (data.ativo ? 1 : 0) : 1
      ]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid),
      codigo: codigo
    });
  } catch (error) {
    console.error('Erro ao criar indicador:', error);
    return Response.json({ error: 'Erro ao criar indicador: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelasIndicadores();
    const data = await request.json();

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const updates = [];
    const args = [];

    if (data.nome) {
      updates.push('nome = ?');
      args.push(normalizarTexto(data.nome));
    }
    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      args.push(data.descricao ? normalizarTexto(data.descricao) : null);
    }
    if (data.formula) {
      updates.push('formula = ?');
      args.push(data.formula);
    }
    if (data.unidade) {
      updates.push('unidade = ?');
      args.push(data.unidade);
    }
    if (data.categoria !== undefined) {
      updates.push('categoria = ?');
      args.push(data.categoria ? normalizarTexto(data.categoria) : null);
    }
    if (data.ativo !== undefined) {
      updates.push('ativo = ?');
      args.push(data.ativo ? 1 : 0);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE ind_indicadores SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar indicador:', error);
    return Response.json({ error: 'Erro ao atualizar indicador: ' + error.message }, { status: 500 });
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
      sql: 'DELETE FROM ind_indicadores WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir indicador:', error);
    return Response.json({ error: 'Erro ao excluir indicador: ' + error.message }, { status: 500 });
  }
}
