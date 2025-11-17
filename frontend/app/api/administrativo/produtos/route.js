import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelaProdutos() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS adm_produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      unidade_medida VARCHAR(20),
      local_estoque VARCHAR(100),
      tipo VARCHAR(20) DEFAULT 'PRODUTO',
      finalidade VARCHAR(20) DEFAULT 'AMBOS',
      foto_path VARCHAR(500),
      qtd_minima_estoque DECIMAL(10,2) DEFAULT 0,
      empresa_id INTEGER,
      status VARCHAR(20) DEFAULT 'ATIVO',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
    )
  `);

  // Migração: garantir empresa_id
  try {
    const tableInfo = await turso.execute('PRAGMA table_info(adm_produtos)');
    const colunas = tableInfo.rows?.map(row => row.name) || [];

    if (!colunas.includes('empresa_id')) {
      await turso.execute('ALTER TABLE adm_produtos ADD COLUMN empresa_id INTEGER');
    }
  } catch (error) {
    console.log('Migração produtos:', error.message);
  }
}

export async function GET(request) {
  try {
    await garantirTabelaProdutos();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const tipo = searchParams.get('tipo');
    const finalidade = searchParams.get('finalidade');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM adm_produtos WHERE 1=1';
    const args = [];

    if (empresaId) {
      sql += ' AND (empresa_id = ? OR empresa_id IS NULL)';
      args.push(Number(empresaId));
    }

    if (tipo) {
      sql += ' AND tipo = ?';
      args.push(tipo);
    }

    if (finalidade) {
      sql += ' AND (finalidade = ? OR finalidade = "AMBOS")';
      args.push(finalidade);
    }

    if (status) {
      sql += ' AND status = ?';
      args.push(status);
    } else {
      sql += ' AND status = ?';
      args.push('ATIVO');
    }

    sql += ' ORDER BY nome ASC';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return Response.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelaProdutos();
    const data = await request.json();

    if (!data.nome) {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Gerar código sequencial
    let codigo = data.codigo;
    if (!codigo) {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM adm_produtos
        WHERE codigo LIKE 'PROD-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[1]) || 0;
        codigo = `PROD-${String(ultimoNumero + 1).padStart(4, '0')}`;
      } else {
        codigo = 'PROD-0001';
      }
    }

    codigo = normalizarTexto(codigo);
    const nome = normalizarTexto(data.nome);

    const result = await turso.execute({
      sql: `INSERT INTO adm_produtos
            (codigo, nome, unidade_medida, local_estoque, tipo, finalidade, foto_path, qtd_minima_estoque, empresa_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        nome,
        data.unidade_medida || null,
        data.local_estoque || null,
        data.tipo || 'PRODUTO',
        data.finalidade || 'AMBOS',
        data.foto_path || null,
        data.qtd_minima_estoque || 0,
        data.empresa_id || null,
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
      return Response.json({ error: 'Já existe um produto com este código' }, { status: 400 });
    }
    console.error('Erro ao criar produto:', error);
    return Response.json({ error: 'Erro ao criar produto: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelaProdutos();
    const data = await request.json();

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const nome = data.nome ? normalizarTexto(data.nome) : undefined;

    const updates = [];
    const args = [];

    if (nome) {
      updates.push('nome = ?');
      args.push(nome);
    }
    if (data.unidade_medida !== undefined) {
      updates.push('unidade_medida = ?');
      args.push(data.unidade_medida);
    }
    if (data.local_estoque !== undefined) {
      updates.push('local_estoque = ?');
      args.push(data.local_estoque);
    }
    if (data.tipo) {
      updates.push('tipo = ?');
      args.push(data.tipo);
    }
    if (data.finalidade) {
      updates.push('finalidade = ?');
      args.push(data.finalidade);
    }
    if (data.foto_path !== undefined) {
      updates.push('foto_path = ?');
      args.push(data.foto_path);
    }
    if (data.qtd_minima_estoque !== undefined) {
      updates.push('qtd_minima_estoque = ?');
      args.push(data.qtd_minima_estoque);
    }
    if (data.status) {
      updates.push('status = ?');
      args.push(data.status);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE adm_produtos SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return Response.json({ error: 'Erro ao atualizar produto: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await garantirTabelaProdutos();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM adm_produtos WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return Response.json({ error: 'Erro ao excluir produto: ' + error.message }, { status: 500 });
  }
}
