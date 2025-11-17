import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasMetasSemanais() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS obj_metas_semanais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      objetivo_trimestral_id INTEGER NOT NULL,
      semana INTEGER NOT NULL,
      valor_meta DECIMAL(15,2) NOT NULL,
      valor_realizado DECIMAL(15,2) DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (objetivo_trimestral_id) REFERENCES obj_objetivos_trimestrais(id) ON DELETE CASCADE,
      UNIQUE(objetivo_trimestral_id, semana)
    )
  `);
}

export async function GET(request) {
  try {
    await garantirTabelasMetasSemanais();

    const { searchParams } = new URL(request.url);
    const objetivoId = searchParams.get('objetivo_id');

    if (!objetivoId) {
      return Response.json({ error: 'objetivo_id é obrigatório' }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `SELECT * FROM obj_metas_semanais
            WHERE objetivo_trimestral_id = ?
            ORDER BY semana ASC`,
      args: [Number(objetivoId)]
    });

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar metas semanais:', error);
    return Response.json({ error: 'Erro ao buscar metas semanais' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasMetasSemanais();
    const data = await request.json();

    if (!data.objetivo_trimestral_id) {
      return Response.json({ error: 'objetivo_trimestral_id é obrigatório' }, { status: 400 });
    }

    // Se for geração automática de 13 semanas
    if (data.gerar_automatico) {
      const objetivo = await turso.execute({
        sql: 'SELECT valor_objetivo FROM obj_objetivos_trimestrais WHERE id = ?',
        args: [data.objetivo_trimestral_id]
      });

      if (objetivo.rows.length === 0) {
        return Response.json({ error: 'Objetivo não encontrado' }, { status: 404 });
      }

      const valorObjetivo = objetivo.rows[0].valor_objetivo;
      const valorPorSemana = valorObjetivo / 13; // Trimestre = 13 semanas

      // Limpar metas existentes
      await turso.execute({
        sql: 'DELETE FROM obj_metas_semanais WHERE objetivo_trimestral_id = ?',
        args: [data.objetivo_trimestral_id]
      });

      // Criar 13 metas semanais
      for (let semana = 1; semana <= 13; semana++) {
        await turso.execute({
          sql: `INSERT INTO obj_metas_semanais (objetivo_trimestral_id, semana, valor_meta, valor_realizado)
                VALUES (?, ?, ?, ?)`,
          args: [data.objetivo_trimestral_id, semana, valorPorSemana, 0]
        });
      }

      return Response.json({ success: true, metas_criadas: 13 });
    }

    // Criação individual
    if (!data.semana || !data.valor_meta) {
      return Response.json({ error: 'semana e valor_meta são obrigatórios' }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `INSERT INTO obj_metas_semanais (objetivo_trimestral_id, semana, valor_meta, valor_realizado)
            VALUES (?, ?, ?, ?)`,
      args: [
        data.objetivo_trimestral_id,
        data.semana,
        data.valor_meta,
        data.valor_realizado || 0
      ]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid)
    });
  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      return Response.json({ error: 'Já existe meta para esta semana' }, { status: 400 });
    }
    console.error('Erro ao criar meta semanal:', error);
    return Response.json({ error: 'Erro ao criar meta: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelasMetasSemanais();
    const data = await request.json();

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const updates = [];
    const args = [];

    if (data.valor_meta !== undefined) {
      updates.push('valor_meta = ?');
      args.push(data.valor_meta);
    }
    if (data.valor_realizado !== undefined) {
      updates.push('valor_realizado = ?');
      args.push(data.valor_realizado);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE obj_metas_semanais SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    return Response.json({ error: 'Erro ao atualizar meta: ' + error.message }, { status: 500 });
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
      sql: 'DELETE FROM obj_metas_semanais WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    return Response.json({ error: 'Erro ao excluir meta: ' + error.message }, { status: 500 });
  }
}
