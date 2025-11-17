import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasTiposDRE() {
  // Criar tabela de tipos de DRE
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_tipos_dre (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      descricao TEXT,
      editavel BOOLEAN DEFAULT 1,
      empresa_id INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Garantir modelos fixos
  const tiposFixos = [
    {
      codigo: 'DRE-OFICIAL',
      nome: 'DRE OFICIAL',
      tipo: 'OFICIAL',
      descricao: 'Demonstracao de Resultado do Exercicio padrao contabil',
      editavel: 0
    },
    {
      codigo: 'DRE-EBITDA',
      nome: 'DRE EBITDA',
      tipo: 'EBITDA',
      descricao: 'Earnings Before Interest, Taxes, Depreciation and Amortization',
      editavel: 0
    },
    {
      codigo: 'DRE-CUSTEIO',
      nome: 'DRE CUSTEIO VARIAVEL',
      tipo: 'CUSTEIO_VARIAVEL',
      descricao: 'Custeio variavel - separacao de custos fixos e variaveis',
      editavel: 0
    }
  ];

  const existentes = await turso.execute('SELECT codigo FROM fin_tipos_dre');
  const codigosExistentes = existentes.rows?.map(row => row.codigo) || [];

  for (const tipo of tiposFixos) {
    if (!codigosExistentes.includes(tipo.codigo)) {
      await turso.execute({
        sql: `INSERT INTO fin_tipos_dre (codigo, nome, tipo, descricao, editavel)
              VALUES (?, ?, ?, ?, ?)`,
        args: [tipo.codigo, tipo.nome, tipo.tipo, tipo.descricao, tipo.editavel]
      });
    }
  }
}

export async function GET(request) {
  try {
    await garantirTabelasTiposDRE();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const codigo = searchParams.get('codigo');

    if (codigo) {
      const result = await turso.execute({
        sql: 'SELECT * FROM fin_tipos_dre WHERE codigo = ?',
        args: [codigo]
      });
      return Response.json(result.rows[0] || null);
    }

    let sql = 'SELECT * FROM fin_tipos_dre WHERE 1=1';
    const args = [];

    if (empresaId) {
      sql += ' AND (empresa_id = ? OR empresa_id IS NULL)';
      args.push(Number(empresaId));
    }

    sql += ' ORDER BY editavel ASC, nome ASC';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar tipos DRE:', error);
    return Response.json({ error: 'Erro ao buscar tipos DRE' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasTiposDRE();
    const data = await request.json();

    // Gerar código sequencial para personalizados
    let codigo = data.codigo;
    if (!codigo && data.tipo === 'PERSONALIZADO') {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM fin_tipos_dre
        WHERE codigo LIKE 'DRE-PERS-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[2]) || 0;
        codigo = `DRE-PERS-${String(ultimoNumero + 1).padStart(3, '0')}`;
      } else {
        codigo = 'DRE-PERS-001';
      }
    }

    const nome = normalizarTexto(data.nome);
    const descricao = data.descricao ? normalizarTexto(data.descricao) : null;

    const result = await turso.execute({
      sql: `INSERT INTO fin_tipos_dre (codigo, nome, tipo, descricao, editavel, empresa_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        nome,
        data.tipo || 'PERSONALIZADO',
        descricao,
        data.tipo === 'PERSONALIZADO' ? 1 : 0,
        data.empresa_id || null
      ]
    });

    return Response.json({
      success: true,
      id: serializeValue(result.lastInsertRowid),
      codigo: codigo
    });
  } catch (error) {
    console.error('Erro ao criar tipo DRE:', error);
    return Response.json({ error: 'Erro ao criar tipo DRE: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelasTiposDRE();
    const data = await request.json();

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    // Verificar se é editável
    const tipo = await turso.execute({
      sql: 'SELECT editavel FROM fin_tipos_dre WHERE id = ?',
      args: [data.id]
    });

    if (tipo.rows.length === 0) {
      return Response.json({ error: 'Tipo DRE não encontrado' }, { status: 404 });
    }

    if (!tipo.rows[0].editavel) {
      return Response.json({ error: 'Este tipo DRE não pode ser editado' }, { status: 400 });
    }

    const nome = data.nome ? normalizarTexto(data.nome) : undefined;
    const descricao = data.descricao ? normalizarTexto(data.descricao) : null;

    const updates = [];
    const args = [];

    if (nome) {
      updates.push('nome = ?');
      args.push(nome);
    }
    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      args.push(descricao);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE fin_tipos_dre SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar tipo DRE:', error);
    return Response.json({ error: 'Erro ao atualizar tipo DRE: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    // Verificar se é editável
    const tipo = await turso.execute({
      sql: 'SELECT editavel FROM fin_tipos_dre WHERE id = ?',
      args: [id]
    });

    if (tipo.rows.length === 0) {
      return Response.json({ error: 'Tipo DRE não encontrado' }, { status: 404 });
    }

    if (!tipo.rows[0].editavel) {
      return Response.json({ error: 'Tipos DRE fixos não podem ser excluídos' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM fin_tipos_dre WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir tipo DRE:', error);
    return Response.json({ error: 'Erro ao excluir tipo DRE: ' + error.message }, { status: 500 });
  }
}
