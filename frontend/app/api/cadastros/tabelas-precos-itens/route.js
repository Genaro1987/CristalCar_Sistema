import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelaItens() {
  // Tabela de itens (produtos) nas tabelas de preço
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tab_tabelas_precos_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tabela_preco_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      preco_venda DECIMAL(15,2) NOT NULL,
      preco_custo DECIMAL(15,2),
      margem_lucro DECIMAL(10,2),
      ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tabela_preco_id) REFERENCES tab_tabelas_precos(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES adm_produtos(id) ON DELETE CASCADE,
      UNIQUE(tabela_preco_id, produto_id)
    )
  `);
}

export async function GET(request) {
  try {
    await garantirTabelaItens();

    const { searchParams } = new URL(request.url);
    const tabelaId = searchParams.get('tabela_id');
    const produtoId = searchParams.get('produto_id');

    if (!tabelaId) {
      return Response.json({ error: 'tabela_id é obrigatório' }, { status: 400 });
    }

    let sql = `
      SELECT
        i.*,
        p.codigo as produto_codigo,
        p.nome as produto_nome,
        p.tipo as produto_tipo,
        p.unidade_medida,
        t.nome as tabela_nome
      FROM tab_tabelas_precos_itens i
      INNER JOIN adm_produtos p ON p.id = i.produto_id
      INNER JOIN tab_tabelas_precos t ON t.id = i.tabela_preco_id
      WHERE i.tabela_preco_id = ?
    `;
    const args = [Number(tabelaId)];

    if (produtoId) {
      sql += ' AND i.produto_id = ?';
      args.push(Number(produtoId));
    }

    sql += ' ORDER BY p.nome ASC';

    const result = await turso.execute({ sql, args });
    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return Response.json({ error: 'Erro ao buscar itens' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelaItens();
    const data = await request.json();

    if (!data.tabela_preco_id || !data.produto_id || !data.preco_venda) {
      return Response.json({
        error: 'Campos obrigatórios: tabela_preco_id, produto_id, preco_venda'
      }, { status: 400 });
    }

    // Calcular margem de lucro se houver preço de custo
    let margemLucro = null;
    if (data.preco_custo && data.preco_custo > 0) {
      margemLucro = ((data.preco_venda - data.preco_custo) / data.preco_custo) * 100;
    }

    const result = await turso.execute({
      sql: `INSERT INTO tab_tabelas_precos_itens
            (tabela_preco_id, produto_id, preco_venda, preco_custo, margem_lucro, ativo)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        data.tabela_preco_id,
        data.produto_id,
        data.preco_venda,
        data.preco_custo || null,
        margemLucro,
        data.ativo !== undefined ? (data.ativo ? 1 : 0) : 1
      ]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid)
    });
  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      return Response.json({
        error: 'Produto já está nesta tabela de preços'
      }, { status: 400 });
    }
    console.error('Erro ao criar item:', error);
    return Response.json({ error: 'Erro ao criar item: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelaItens();
    const data = await request.json();

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const updates = [];
    const args = [];

    if (data.preco_venda !== undefined) {
      updates.push('preco_venda = ?');
      args.push(data.preco_venda);
    }
    if (data.preco_custo !== undefined) {
      updates.push('preco_custo = ?');
      args.push(data.preco_custo);

      // Recalcular margem de lucro
      if (data.preco_custo && data.preco_custo > 0 && data.preco_venda) {
        const margem = ((data.preco_venda - data.preco_custo) / data.preco_custo) * 100;
        updates.push('margem_lucro = ?');
        args.push(margem);
      }
    }
    if (data.ativo !== undefined) {
      updates.push('ativo = ?');
      args.push(data.ativo ? 1 : 0);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE tab_tabelas_precos_itens SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return Response.json({ error: 'Erro ao atualizar item: ' + error.message }, { status: 500 });
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
      sql: 'DELETE FROM tab_tabelas_precos_itens WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    return Response.json({ error: 'Erro ao excluir item: ' + error.message }, { status: 500 });
  }
}
