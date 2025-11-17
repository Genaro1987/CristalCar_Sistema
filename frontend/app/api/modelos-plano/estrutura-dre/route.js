import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasEstruturaDRE() {
  // Criar tabela de estrutura DRE
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_estrutura_dre (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_dre_id INTEGER NOT NULL,
      codigo VARCHAR(20) NOT NULL,
      nome VARCHAR(200) NOT NULL,
      nivel INTEGER NOT NULL,
      pai_id INTEGER,
      ordem INTEGER DEFAULT 999,
      tipo_linha VARCHAR(20) NOT NULL,
      formula TEXT,
      negativo BOOLEAN DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tipo_dre_id) REFERENCES fin_tipos_dre(id) ON DELETE CASCADE,
      FOREIGN KEY (pai_id) REFERENCES fin_estrutura_dre(id) ON DELETE CASCADE
    )
  `);

  // Criar tabela de vínculos com plano de contas
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_estrutura_dre_vinculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estrutura_dre_id INTEGER NOT NULL,
      plano_conta_id INTEGER NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estrutura_dre_id) REFERENCES fin_estrutura_dre(id) ON DELETE CASCADE,
      FOREIGN KEY (plano_conta_id) REFERENCES fin_plano_contas(id) ON DELETE CASCADE,
      UNIQUE(estrutura_dre_id, plano_conta_id)
    )
  `);
}

export async function GET(request) {
  try {
    await garantirTabelasEstruturaDRE();

    const { searchParams } = new URL(request.url);
    const tipoDreId = searchParams.get('tipo_dre_id');
    const incluirVinculos = searchParams.get('incluir_vinculos') === 'true';

    if (!tipoDreId) {
      return Response.json({ error: 'tipo_dre_id é obrigatório' }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `SELECT * FROM fin_estrutura_dre
            WHERE tipo_dre_id = ?
            ORDER BY ordem ASC, codigo ASC`,
      args: [Number(tipoDreId)]
    });

    let linhas = serializeRows(result.rows);

    // Buscar vínculos se solicitado
    if (incluirVinculos && linhas.length > 0) {
      const ids = linhas.map(l => l.id);
      const placeholders = ids.map(() => '?').join(',');

      const vinculos = await turso.execute({
        sql: `SELECT v.*, p.codigo as conta_codigo, p.descricao as conta_nome
              FROM fin_estrutura_dre_vinculos v
              LEFT JOIN fin_plano_contas p ON p.id = v.plano_conta_id
              WHERE v.estrutura_dre_id IN (${placeholders})`,
        args: ids
      });

      const vinculosMap = {};
      serializeRows(vinculos.rows).forEach(v => {
        if (!vinculosMap[v.estrutura_dre_id]) {
          vinculosMap[v.estrutura_dre_id] = [];
        }
        vinculosMap[v.estrutura_dre_id].push({
          id: v.id,
          plano_conta_id: v.plano_conta_id,
          conta_codigo: v.conta_codigo,
          conta_nome: v.conta_nome
        });
      });

      linhas = linhas.map(linha => ({
        ...linha,
        vinculos: vinculosMap[linha.id] || []
      }));
    }

    return Response.json(linhas);
  } catch (error) {
    console.error('Erro ao buscar estrutura DRE:', error);
    return Response.json({ error: 'Erro ao buscar estrutura DRE' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasEstruturaDRE();
    const data = await request.json();

    if (!data.tipo_dre_id) {
      return Response.json({ error: 'tipo_dre_id é obrigatório' }, { status: 400 });
    }

    const nome = normalizarTexto(data.nome);

    const result = await turso.execute({
      sql: `INSERT INTO fin_estrutura_dre
            (tipo_dre_id, codigo, nome, nivel, pai_id, ordem, tipo_linha, formula, negativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.tipo_dre_id,
        data.codigo || `LIN-${Date.now()}`,
        nome,
        data.nivel || 1,
        data.pai_id || null,
        data.ordem || 999,
        data.tipo_linha || 'TITULO',
        data.formula || null,
        data.negativo ? 1 : 0
      ]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid)
    });
  } catch (error) {
    console.error('Erro ao criar linha DRE:', error);
    return Response.json({ error: 'Erro ao criar linha DRE: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelasEstruturaDRE();
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
    if (data.ordem !== undefined) {
      updates.push('ordem = ?');
      args.push(data.ordem);
    }
    if (data.formula !== undefined) {
      updates.push('formula = ?');
      args.push(data.formula);
    }
    if (data.negativo !== undefined) {
      updates.push('negativo = ?');
      args.push(data.negativo ? 1 : 0);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE fin_estrutura_dre SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar linha DRE:', error);
    return Response.json({ error: 'Erro ao atualizar linha DRE: ' + error.message }, { status: 500 });
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
      sql: 'DELETE FROM fin_estrutura_dre WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir linha DRE:', error);
    return Response.json({ error: 'Erro ao excluir linha DRE: ' + error.message }, { status: 500 });
  }
}
