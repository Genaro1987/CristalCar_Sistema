import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasObjetivos() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS obj_objetivos_trimestrais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      empresa_id INTEGER,
      ano INTEGER NOT NULL,
      trimestre INTEGER NOT NULL,
      plano_conta_id INTEGER NOT NULL,
      tipo_conta VARCHAR(20) NOT NULL,
      valor_objetivo DECIMAL(15,2) NOT NULL,
      descricao TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plano_conta_id) REFERENCES fin_plano_contas(id),
      UNIQUE(empresa_id, ano, trimestre, plano_conta_id)
    )
  `);

  // Migrações: garantir que colunas necessárias existem
  try {
    const tableInfo = await turso.execute('PRAGMA table_info(obj_objetivos_trimestrais)');
    const colunas = tableInfo.rows?.map(row => row.name) || [];

    // Migração 1: adicionar coluna empresa_id se não existir
    if (!colunas.includes('empresa_id')) {
      await turso.execute('ALTER TABLE obj_objetivos_trimestrais ADD COLUMN empresa_id INTEGER');
    }

    // Migração 2: adicionar coluna plano_conta_id se não existir
    if (!colunas.includes('plano_conta_id')) {
      await turso.execute('ALTER TABLE obj_objetivos_trimestrais ADD COLUMN plano_conta_id INTEGER');
    }

    // Migração 3: adicionar outras colunas essenciais
    if (!colunas.includes('ano')) {
      await turso.execute('ALTER TABLE obj_objetivos_trimestrais ADD COLUMN ano INTEGER');
    }
    if (!colunas.includes('trimestre')) {
      await turso.execute('ALTER TABLE obj_objetivos_trimestrais ADD COLUMN trimestre INTEGER');
    }
    if (!colunas.includes('tipo_conta')) {
      await turso.execute('ALTER TABLE obj_objetivos_trimestrais ADD COLUMN tipo_conta VARCHAR(20)');
    }
    if (!colunas.includes('valor_objetivo')) {
      await turso.execute('ALTER TABLE obj_objetivos_trimestrais ADD COLUMN valor_objetivo DECIMAL(15,2)');
    }

    // Migração 4: adicionar coluna codigo se não existir
    if (!colunas.includes('codigo')) {
      await turso.execute('ALTER TABLE obj_objetivos_trimestrais ADD COLUMN codigo VARCHAR(20)');

      const registros = await turso.execute('SELECT id FROM obj_objetivos_trimestrais');
      for (const reg of registros.rows) {
        const codigo = `OBJ-TRI-${String(reg.id).padStart(4, '0')}`;
        await turso.execute({
          sql: 'UPDATE obj_objetivos_trimestrais SET codigo = ? WHERE id = ?',
          args: [codigo, reg.id]
        });
      }

      await turso.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_obj_trim_codigo ON obj_objetivos_trimestrais(codigo)');
    }
  } catch (error) {
    console.log('Migração objetivos trimestrais:', error.message);
  }
}

export async function GET(request) {
  try {
    await garantirTabelasObjetivos();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const ano = searchParams.get('ano');
    const trimestre = searchParams.get('trimestre');

    let sql = `
      SELECT o.*, p.codigo as conta_codigo, p.descricao as conta_nome
      FROM obj_objetivos_trimestrais o
      LEFT JOIN fin_plano_contas p ON p.id = o.plano_conta_id
      WHERE 1=1
    `;
    const args = [];

    if (empresaId) {
      sql += ' AND (o.empresa_id = ? OR o.empresa_id IS NULL)';
      args.push(Number(empresaId));
    }

    if (ano) {
      sql += ' AND o.ano = ?';
      args.push(Number(ano));
    }

    if (trimestre) {
      sql += ' AND o.trimestre = ?';
      args.push(Number(trimestre));
    }

    sql += ' ORDER BY o.ano DESC, o.trimestre DESC, p.codigo ASC';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar objetivos trimestrais:', error);
    return Response.json({ error: 'Erro ao buscar objetivos trimestrais' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasObjetivos();
    const data = await request.json();

    if (!data.ano || !data.trimestre || !data.plano_conta_id || !data.valor_objetivo) {
      return Response.json({
        error: 'Campos obrigatórios: ano, trimestre, plano_conta_id, valor_objetivo'
      }, { status: 400 });
    }

    // Gerar código sequencial
    let codigo = data.codigo;
    if (!codigo) {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM obj_objetivos_trimestrais
        WHERE codigo LIKE 'OBJ-TRI-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[2]) || 0;
        codigo = `OBJ-TRI-${String(ultimoNumero + 1).padStart(4, '0')}`;
      } else {
        codigo = 'OBJ-TRI-0001';
      }
    }

    const descricao = data.descricao ? normalizarTexto(data.descricao) : null;

    const result = await turso.execute({
      sql: `INSERT INTO obj_objetivos_trimestrais
            (codigo, empresa_id, ano, trimestre, plano_conta_id, tipo_conta, valor_objetivo, descricao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        data.empresa_id || null,
        data.ano,
        data.trimestre,
        data.plano_conta_id,
        data.tipo_conta || 'RECEITA',
        data.valor_objetivo,
        descricao
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
        error: 'Já existe um objetivo para esta conta neste trimestre'
      }, { status: 400 });
    }
    console.error('Erro ao criar objetivo trimestral:', error);
    return Response.json({ error: 'Erro ao criar objetivo: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelasObjetivos();
    const data = await request.json();

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const updates = [];
    const args = [];

    if (data.valor_objetivo !== undefined) {
      updates.push('valor_objetivo = ?');
      args.push(data.valor_objetivo);
    }
    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      args.push(data.descricao ? normalizarTexto(data.descricao) : null);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE obj_objetivos_trimestrais SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar objetivo:', error);
    return Response.json({ error: 'Erro ao atualizar objetivo: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    // Excluir metas semanais associadas
    await turso.execute({
      sql: 'DELETE FROM obj_metas_semanais WHERE objetivo_trimestral_id = ?',
      args: [id]
    });

    await turso.execute({
      sql: 'DELETE FROM obj_objetivos_trimestrais WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir objetivo:', error);
    return Response.json({ error: 'Erro ao excluir objetivo: ' + error.message }, { status: 500 });
  }
}
