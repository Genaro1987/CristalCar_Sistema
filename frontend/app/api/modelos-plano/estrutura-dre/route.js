import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

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

  // Migrações: garantir que colunas essenciais existem
  try {
    const tableInfo = await turso.execute('PRAGMA table_info(fin_estrutura_dre)');
    const colunas = tableInfo.rows?.map(row => row.name) || [];

    if (!colunas.includes('tipo_dre_id')) {
      console.log('Adicionando coluna tipo_dre_id à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN tipo_dre_id INTEGER');
    }
    if (!colunas.includes('nome')) {
      console.log('Adicionando coluna nome à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN nome VARCHAR(200)');
      await turso.execute('UPDATE fin_estrutura_dre SET nome = codigo WHERE nome IS NULL');
    }
    if (!colunas.includes('codigo')) {
      console.log('Adicionando coluna codigo à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN codigo VARCHAR(20)');
      const linhas = await turso.execute('SELECT id FROM fin_estrutura_dre WHERE codigo IS NULL');
      for (const linha of linhas.rows) {
        await turso.execute({
          sql: 'UPDATE fin_estrutura_dre SET codigo = ? WHERE id = ?',
          args: [`LIN-${linha.id}`, linha.id]
        });
      }
    }
    if (!colunas.includes('nivel')) {
      console.log('Adicionando coluna nivel à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN nivel INTEGER DEFAULT 1');
    }
    if (!colunas.includes('tipo_linha')) {
      console.log('Adicionando coluna tipo_linha à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN tipo_linha VARCHAR(20) DEFAULT "TITULO"');
    }
    if (!colunas.includes('pai_id')) {
      console.log('Adicionando coluna pai_id à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN pai_id INTEGER');
    }
    if (!colunas.includes('ordem')) {
      console.log('Adicionando coluna ordem à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN ordem INTEGER DEFAULT 999');
    }
    if (!colunas.includes('formula')) {
      console.log('Adicionando coluna formula à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN formula TEXT');
    }
    if (!colunas.includes('negativo')) {
      console.log('Adicionando coluna negativo à fin_estrutura_dre');
      await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN negativo BOOLEAN DEFAULT 0');
    }

    // Migração especial: se descricao existe com NOT NULL, preencher
    if (colunas.includes('descricao')) {
      try {
        await turso.execute('UPDATE fin_estrutura_dre SET descricao = nome WHERE descricao IS NULL');
      } catch (e) {
        console.log('[INFO] Coluna descricao:', e.message);
      }
    }

    // Migração: se existe coluna 'tipo' com NOT NULL, preencher com valor padrão
    if (colunas.includes('tipo')) {
      console.log('[MIGRAÇÃO] Coluna tipo encontrada - preenchendo valores NULL');
      try {
        await turso.execute("UPDATE fin_estrutura_dre SET tipo = 'TITULO' WHERE tipo IS NULL");
      } catch (e) {
        console.log('[INFO] Coluna tipo:', e.message);
      }
    }
  } catch (error) {
    console.error('[ERRO] Migração estrutura DRE:', error);
    throw error;
  }

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

  // Criar estruturas padrão para os tipos fixos
  await criarEstruturasBaseDRE();
}

async function criarEstruturasBaseDRE() {
  // Buscar os IDs dos tipos fixos
  const tipoOficial = await turso.execute({
    sql: 'SELECT id FROM fin_tipos_dre WHERE codigo = ?',
    args: ['DRE-OFICIAL']
  });

  const tipoEBITDA = await turso.execute({
    sql: 'SELECT id FROM fin_tipos_dre WHERE codigo = ?',
    args: ['DRE-EBITDA']
  });

  const tipoCusteio = await turso.execute({
    sql: 'SELECT id FROM fin_tipos_dre WHERE codigo = ?',
    args: ['DRE-CUSTEIO']
  });

  // Verificar se estruturas já existem para cada tipo
  if (tipoOficial.rows.length > 0) {
    const tipoId = tipoOficial.rows[0].id;
    const estruturasExistentes = await turso.execute({
      sql: 'SELECT COUNT(*) as total FROM fin_estrutura_dre WHERE tipo_dre_id = ?',
      args: [tipoId]
    });

    if (estruturasExistentes.rows[0].total === 0) {
      console.log('[SEED] Criando estrutura base DRE OFICIAL');
      await criarEstruturaDREOficial(tipoId);
    }
  }

  if (tipoEBITDA.rows.length > 0) {
    const tipoId = tipoEBITDA.rows[0].id;
    const estruturasExistentes = await turso.execute({
      sql: 'SELECT COUNT(*) as total FROM fin_estrutura_dre WHERE tipo_dre_id = ?',
      args: [tipoId]
    });

    if (estruturasExistentes.rows[0].total === 0) {
      console.log('[SEED] Criando estrutura base DRE EBITDA');
      await criarEstruturaDREEBITDA(tipoId);
    }
  }

  if (tipoCusteio.rows.length > 0) {
    const tipoId = tipoCusteio.rows[0].id;
    const estruturasExistentes = await turso.execute({
      sql: 'SELECT COUNT(*) as total FROM fin_estrutura_dre WHERE tipo_dre_id = ?',
      args: [tipoId]
    });

    if (estruturasExistentes.rows[0].total === 0) {
      console.log('[SEED] Criando estrutura base DRE CUSTEIO VARIAVEL');
      await criarEstruturaDRECusteio(tipoId);
    }
  }
}

async function criarEstruturaDREOficial(tipoId) {
  const estrutura = [
    { codigo: '1', nome: 'RECEITA BRUTA', nivel: 1, pai_id: null, ordem: 10, tipo_linha: 'CONTA', negativo: 0 },
    { codigo: '2', nome: 'DEDUCOES E ABATIMENTOS', nivel: 1, pai_id: null, ordem: 20, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '3', nome: 'RECEITA LIQUIDA', nivel: 1, pai_id: null, ordem: 30, tipo_linha: 'FORMULA', formula: '1 - 2', negativo: 0 },
    { codigo: '4', nome: 'CUSTO DAS VENDAS/SERVICOS', nivel: 1, pai_id: null, ordem: 40, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '5', nome: 'LUCRO BRUTO', nivel: 1, pai_id: null, ordem: 50, tipo_linha: 'FORMULA', formula: '3 - 4', negativo: 0 },
    { codigo: '6', nome: 'DESPESAS OPERACIONAIS', nivel: 1, pai_id: null, ordem: 60, tipo_linha: 'TITULO', negativo: 1 },
    { codigo: '6.1', nome: 'DESPESAS COM VENDAS', nivel: 2, pai_id: null, ordem: 61, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '6.2', nome: 'DESPESAS ADMINISTRATIVAS', nivel: 2, pai_id: null, ordem: 62, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '6.3', nome: 'OUTRAS DESPESAS OPERACIONAIS', nivel: 2, pai_id: null, ordem: 63, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '7', nome: 'RESULTADO OPERACIONAL (EBIT)', nivel: 1, pai_id: null, ordem: 70, tipo_linha: 'FORMULA', formula: '5 - 6', negativo: 0 },
    { codigo: '8', nome: 'RESULTADO FINANCEIRO', nivel: 1, pai_id: null, ordem: 80, tipo_linha: 'TITULO', negativo: 0 },
    { codigo: '8.1', nome: 'RECEITAS FINANCEIRAS', nivel: 2, pai_id: null, ordem: 81, tipo_linha: 'CONTA', negativo: 0 },
    { codigo: '8.2', nome: 'DESPESAS FINANCEIRAS', nivel: 2, pai_id: null, ordem: 82, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '9', nome: 'RESULTADO ANTES IR/CSLL', nivel: 1, pai_id: null, ordem: 90, tipo_linha: 'FORMULA', formula: '7 + 8', negativo: 0 },
    { codigo: '10', nome: 'PROVISAO PARA IR E CSLL', nivel: 1, pai_id: null, ordem: 100, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '11', nome: 'RESULTADO LIQUIDO DO EXERCICIO', nivel: 1, pai_id: null, ordem: 110, tipo_linha: 'FORMULA', formula: '9 - 10', negativo: 0 },
  ];

  for (const linha of estrutura) {
    await turso.execute({
      sql: `INSERT INTO fin_estrutura_dre
            (tipo_dre_id, codigo, nome, nivel, pai_id, ordem, tipo_linha, formula, negativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [tipoId, linha.codigo, linha.nome, linha.nivel, linha.pai_id, linha.ordem,
             linha.tipo_linha, linha.formula || null, linha.negativo]
    });
  }
}

async function criarEstruturaDREEBITDA(tipoId) {
  const estrutura = [
    { codigo: '1', nome: 'RECEITA LIQUIDA', nivel: 1, pai_id: null, ordem: 10, tipo_linha: 'CONTA', negativo: 0 },
    { codigo: '2', nome: 'CUSTO DAS VENDAS', nivel: 1, pai_id: null, ordem: 20, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '3', nome: 'LUCRO BRUTO', nivel: 1, pai_id: null, ordem: 30, tipo_linha: 'FORMULA', formula: '1 - 2', negativo: 0 },
    { codigo: '4', nome: 'DESPESAS OPERACIONAIS (EXCETO DEPREC.)', nivel: 1, pai_id: null, ordem: 40, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '5', nome: 'EBITDA', nivel: 1, pai_id: null, ordem: 50, tipo_linha: 'FORMULA', formula: '3 - 4', negativo: 0 },
    { codigo: '6', nome: 'DEPRECIACAO E AMORTIZACAO', nivel: 1, pai_id: null, ordem: 60, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '7', nome: 'EBIT', nivel: 1, pai_id: null, ordem: 70, tipo_linha: 'FORMULA', formula: '5 - 6', negativo: 0 },
    { codigo: '8', nome: 'RESULTADO FINANCEIRO', nivel: 1, pai_id: null, ordem: 80, tipo_linha: 'CONTA', negativo: 0 },
    { codigo: '9', nome: 'RESULTADO ANTES IR/CSLL', nivel: 1, pai_id: null, ordem: 90, tipo_linha: 'FORMULA', formula: '7 + 8', negativo: 0 },
    { codigo: '10', nome: 'IR E CSLL', nivel: 1, pai_id: null, ordem: 100, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '11', nome: 'LUCRO LIQUIDO', nivel: 1, pai_id: null, ordem: 110, tipo_linha: 'FORMULA', formula: '9 - 10', negativo: 0 },
  ];

  for (const linha of estrutura) {
    await turso.execute({
      sql: `INSERT INTO fin_estrutura_dre
            (tipo_dre_id, codigo, nome, nivel, pai_id, ordem, tipo_linha, formula, negativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [tipoId, linha.codigo, linha.nome, linha.nivel, linha.pai_id, linha.ordem,
             linha.tipo_linha, linha.formula || null, linha.negativo]
    });
  }
}

async function criarEstruturaDRECusteio(tipoId) {
  const estrutura = [
    { codigo: '1', nome: 'RECEITA LIQUIDA', nivel: 1, pai_id: null, ordem: 10, tipo_linha: 'CONTA', negativo: 0 },
    { codigo: '2', nome: 'CUSTOS VARIAVEIS', nivel: 1, pai_id: null, ordem: 20, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '3', nome: 'MARGEM DE CONTRIBUICAO', nivel: 1, pai_id: null, ordem: 30, tipo_linha: 'FORMULA', formula: '1 - 2', negativo: 0 },
    { codigo: '4', nome: 'CUSTOS FIXOS', nivel: 1, pai_id: null, ordem: 40, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '5', nome: 'RESULTADO OPERACIONAL', nivel: 1, pai_id: null, ordem: 50, tipo_linha: 'FORMULA', formula: '3 - 4', negativo: 0 },
    { codigo: '6', nome: 'RESULTADO FINANCEIRO', nivel: 1, pai_id: null, ordem: 60, tipo_linha: 'CONTA', negativo: 0 },
    { codigo: '7', nome: 'RESULTADO ANTES IR/CSLL', nivel: 1, pai_id: null, ordem: 70, tipo_linha: 'FORMULA', formula: '5 + 6', negativo: 0 },
    { codigo: '8', nome: 'IR E CSLL', nivel: 1, pai_id: null, ordem: 80, tipo_linha: 'CONTA', negativo: 1 },
    { codigo: '9', nome: 'LUCRO LIQUIDO', nivel: 1, pai_id: null, ordem: 90, tipo_linha: 'FORMULA', formula: '7 - 8', negativo: 0 },
  ];

  for (const linha of estrutura) {
    await turso.execute({
      sql: `INSERT INTO fin_estrutura_dre
            (tipo_dre_id, codigo, nome, nivel, pai_id, ordem, tipo_linha, formula, negativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [tipoId, linha.codigo, linha.nome, linha.nivel, linha.pai_id, linha.ordem,
             linha.tipo_linha, linha.formula || null, linha.negativo]
    });
  }
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
    const descricao = data.descricao ? normalizarTexto(data.descricao) : nome;

    // Verificar quais colunas existem na tabela
    const tableInfo = await turso.execute('PRAGMA table_info(fin_estrutura_dre)');
    const colunas = tableInfo.rows?.map(row => row.name) || [];
    const temDescricao = colunas.includes('descricao');
    const temTipo = colunas.includes('tipo');

    let sql, args;

    // Montar SQL dinamicamente baseado nas colunas que existem
    const campos = ['tipo_dre_id', 'codigo', 'nome'];
    const valores = [data.tipo_dre_id, data.codigo || `LIN-${Date.now()}`, nome];

    if (temDescricao) {
      campos.push('descricao');
      valores.push(descricao);
    }

    if (temTipo) {
      campos.push('tipo');
      valores.push(data.tipo_linha || 'TITULO'); // usar tipo_linha para preencher tipo
    }

    campos.push('nivel', 'pai_id', 'ordem', 'tipo_linha', 'formula', 'negativo');
    valores.push(
      data.nivel || 1,
      data.pai_id || null,
      data.ordem || 999,
      data.tipo_linha || 'TITULO',
      data.formula || null,
      data.negativo ? 1 : 0
    );

    const placeholders = campos.map(() => '?').join(', ');
    sql = `INSERT INTO fin_estrutura_dre (${campos.join(', ')}) VALUES (${placeholders})`;
    args = valores;

    const result = await turso.execute({ sql, args });

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
