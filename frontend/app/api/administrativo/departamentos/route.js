import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelaDepartamentos() {
  // Criar tabela adm_departamentos baseada em fin_centro_custo
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS adm_departamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      descricao TEXT,
      responsavel_id INTEGER,
      empresa_id INTEGER,
      status VARCHAR(20) DEFAULT 'ATIVO',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (responsavel_id) REFERENCES adm_funcionarios(id),
      FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
    )
  `);

  // Verificar se precisa migrar dados de fin_centro_custo
  const temCentroCusto = await turso.execute(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='fin_centro_custo'
  `);

  if (temCentroCusto.rows.length > 0) {
    // Verificar se já migrou
    const jaMigrou = await turso.execute('SELECT COUNT(*) as total FROM adm_departamentos');

    if (jaMigrou.rows[0].total === 0) {
      // Migrar dados de fin_centro_custo para adm_departamentos
      await turso.execute(`
        INSERT INTO adm_departamentos (codigo, nome, descricao, status, criado_em)
        SELECT codigo, descricao as nome, descricao, 'ATIVO', criado_em
        FROM fin_centro_custo
      `);
    }
  }

  // Garantir departamentos padrão
  const departamentosPadrao = [
    { codigo: 'ADM', nome: 'ADMINISTRATIVO' },
    { codigo: 'FIN', nome: 'FINANCEIRO' },
    { codigo: 'VND', nome: 'VENDAS' },
    { codigo: 'CMP', nome: 'COMPRAS' },
    { codigo: 'EST', nome: 'ESTOQUE' },
    { codigo: 'TI', nome: 'TECNOLOGIA DA INFORMACAO' },
    { codigo: 'RH', nome: 'RECURSOS HUMANOS' },
    { codigo: 'DIR', nome: 'DIRETORIA' },
  ];

  const existentes = await turso.execute('SELECT codigo FROM adm_departamentos');
  const codigosExistentes = existentes.rows?.map(row => row.codigo) || [];

  for (const dep of departamentosPadrao) {
    if (!codigosExistentes.includes(dep.codigo)) {
      await turso.execute({
        sql: 'INSERT INTO adm_departamentos (codigo, nome, status) VALUES (?, ?, ?)',
        args: [dep.codigo, dep.nome, 'ATIVO']
      });
    }
  }
}

export async function GET(request) {
  try {
    await garantirTabelaDepartamentos();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM adm_departamentos WHERE 1=1';
    const args = [];

    if (empresaId) {
      sql += ' AND (empresa_id = ? OR empresa_id IS NULL)';
      args.push(Number(empresaId));
    }

    if (status) {
      sql += ' AND status = ?';
      args.push(status);
    } else {
      sql += ' AND status != ?';
      args.push('INATIVO');
    }

    sql += ' ORDER BY nome ASC';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    return Response.json({ error: 'Erro ao buscar departamentos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelaDepartamentos();
    const data = await request.json();

    // Gerar código sequencial se não fornecido
    let codigo = data.codigo;
    if (!codigo) {
      const ultimoCodigo = await turso.execute(`
        SELECT codigo FROM adm_departamentos
        WHERE codigo LIKE 'DEP-%'
        ORDER BY codigo DESC LIMIT 1
      `);

      if (ultimoCodigo.rows.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[1]) || 0;
        codigo = `DEP-${String(ultimoNumero + 1).padStart(3, '0')}`;
      } else {
        codigo = 'DEP-001';
      }
    }

    codigo = normalizarTexto(codigo);
    const nome = normalizarTexto(data.nome);

    const result = await turso.execute({
      sql: `INSERT INTO adm_departamentos
            (codigo, nome, descricao, responsavel_id, empresa_id, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        nome,
        data.descricao || null,
        data.responsavel_id || null,
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
    console.error('Erro ao criar departamento:', error);
    return Response.json({
      error: 'Erro ao criar departamento: ' + error.message
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await garantirTabelaDepartamentos();
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
    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      args.push(data.descricao);
    }
    if (data.responsavel_id !== undefined) {
      updates.push('responsavel_id = ?');
      args.push(data.responsavel_id || null);
    }
    if (data.status) {
      updates.push('status = ?');
      args.push(data.status);
    }

    updates.push('atualizado_em = CURRENT_TIMESTAMP');
    args.push(data.id);

    await turso.execute({
      sql: `UPDATE adm_departamentos SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error);
    return Response.json({
      error: 'Erro ao atualizar departamento: ' + error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await garantirTabelaDepartamentos();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    // Verificar se a tabela adm_funcionarios existe
    const temTabelaFuncionarios = await turso.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='adm_funcionarios'
    `);

    // Verificar se tem funcionários vinculados (apenas se a tabela existir)
    if (temTabelaFuncionarios.rows.length > 0) {
      const funcionarios = await turso.execute({
        sql: 'SELECT COUNT(*) as total FROM adm_funcionarios WHERE departamento_id = ?',
        args: [id]
      });

      if (funcionarios.rows[0].total > 0) {
        return Response.json({
          error: 'Não é possível excluir departamento com funcionários vinculados'
        }, { status: 400 });
      }
    }

    await turso.execute({
      sql: 'DELETE FROM adm_departamentos WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir departamento:', error);
    return Response.json({
      error: 'Erro ao excluir departamento: ' + error.message
    }, { status: 500 });
  }
}
