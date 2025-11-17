import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabela() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_modelos_dre (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_modelo VARCHAR(200) NOT NULL,
      tipo_modelo VARCHAR(50) NOT NULL,
      estrutura_tipo VARCHAR(50) NOT NULL,
      descricao TEXT,
      padrao BOOLEAN DEFAULT 0,
      status VARCHAR(20) DEFAULT 'ATIVO',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  try {
    await garantirTabela();

    const result = await turso.execute({
      sql: `SELECT * FROM fin_modelos_dre ORDER BY status DESC, nome_modelo ASC`,
      args: [],
    });

    return NextResponse.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao listar modelos de DRE:', error);
    return NextResponse.json({ error: 'Erro ao listar modelos de DRE' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabela();
    const data = await request.json();

    const nome = normalizarTexto(data.nome_modelo || data.nome);
    const tipo = normalizarTexto(data.tipo_modelo || 'OFICIAL');
    const estrutura = normalizarTexto(data.estrutura_tipo || 'PADRAO');
    const status = data.status ? normalizarTexto(data.status) : data.ativo === false ? 'INATIVO' : 'ATIVO';

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_modelos_dre (nome_modelo, tipo_modelo, estrutura_tipo, descricao, padrao, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        nome,
        tipo,
        estrutura,
        data.descricao || null,
        data.padrao ? 1 : 0,
        status,
      ],
    });

    return NextResponse.json({ success: true, id: serializeValue(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar modelo de DRE:', error);
    return NextResponse.json({ error: 'Erro ao criar modelo de DRE' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabela();
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
    }

    const updates = [];
    const args = [];

    if (data.nome_modelo || data.nome) {
      updates.push('nome_modelo = ?');
      args.push(normalizarTexto(data.nome_modelo || data.nome));
    }

    if (data.tipo_modelo) {
      updates.push('tipo_modelo = ?');
      args.push(normalizarTexto(data.tipo_modelo));
    }

    if (data.estrutura_tipo) {
      updates.push('estrutura_tipo = ?');
      args.push(normalizarTexto(data.estrutura_tipo));
    }

    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      args.push(data.descricao || null);
    }

    if (data.padrao !== undefined) {
      updates.push('padrao = ?');
      args.push(data.padrao ? 1 : 0);
    }

    if (data.status !== undefined || data.ativo !== undefined) {
      updates.push('status = ?');
      const status = data.status
        ? normalizarTexto(data.status)
        : data.ativo === false
          ? 'INATIVO'
          : 'ATIVO';
      args.push(status);
    }

    if (!updates.length) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE fin_modelos_dre SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar modelo de DRE:', error);
    return NextResponse.json({ error: 'Erro ao atualizar modelo de DRE' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await garantirTabela();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
    }

    await turso.execute({ sql: 'DELETE FROM fin_modelos_dre WHERE id = ?', args: [id] });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir modelo de DRE:', error);
    return NextResponse.json({ error: 'Erro ao excluir modelo de DRE' }, { status: 500 });
  }
}
