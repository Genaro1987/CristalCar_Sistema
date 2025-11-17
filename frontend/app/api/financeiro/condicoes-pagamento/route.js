import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasCondicoes() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL DEFAULT '',
      descricao TEXT,
      tipo VARCHAR(20) NOT NULL DEFAULT 'A_VISTA',
      forma_pagamento_id INTEGER,
      quantidade_parcelas INTEGER DEFAULT 1,
      dias_primeira_parcela INTEGER DEFAULT 0,
      dias_entre_parcelas INTEGER DEFAULT 30,
      percentual_desconto DECIMAL(10,2) DEFAULT 0,
      percentual_acrescimo DECIMAL(10,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'ATIVO',
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (forma_pagamento_id) REFERENCES fin_formas_pagamento(id)
    )
  `);

  // Garantir colunas adicionais
  const tableInfo = await turso.execute('PRAGMA table_info(fin_condicoes_pagamento)');
  const colunas = tableInfo?.rows?.map((row) => row.name) || [];

  const colunasObrigatorias = [
    { nome: 'nome', ddl: 'ALTER TABLE fin_condicoes_pagamento ADD COLUMN nome VARCHAR(200) NOT NULL DEFAULT ""' },
    { nome: 'descricao', ddl: 'ALTER TABLE fin_condicoes_pagamento ADD COLUMN descricao TEXT' },
    { nome: 'observacoes', ddl: 'ALTER TABLE fin_condicoes_pagamento ADD COLUMN observacoes TEXT' },
    { nome: 'empresa_id', ddl: 'ALTER TABLE fin_condicoes_pagamento ADD COLUMN empresa_id INTEGER' },
    { nome: 'forma_pagamento_id', ddl: 'ALTER TABLE fin_condicoes_pagamento ADD COLUMN forma_pagamento_id INTEGER' },
  ];

  for (const coluna of colunasObrigatorias) {
    if (!colunas.includes(coluna.nome)) {
      try {
        await turso.execute(coluna.ddl);
      } catch (e) {
        // Coluna já existe
      }
    }
  }
}

export async function GET() {
  try {
    await garantirTabelasCondicoes();
    const result = await turso.execute(`
      SELECT cp.*, fp.descricao AS forma_pagamento_nome
      FROM fin_condicoes_pagamento cp
      LEFT JOIN fin_formas_pagamento fp ON fp.id = cp.forma_pagamento_id
      ORDER BY cp.status DESC, cp.nome ASC
    `);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar condições:', error);
    return Response.json({ error: 'Erro ao buscar condições' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasCondicoes();
    const data = await request.json();

    // Normalizar campos de texto (MAIÚSCULO sem acentos)
    const nome = normalizarTexto(data.nome || 'SEM NOME');
    const descricao = data.descricao ? normalizarTexto(data.descricao) : '';
    const observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null;

    const result = await turso.execute({
      sql: `
        INSERT INTO fin_condicoes_pagamento (
          codigo, nome, descricao, tipo, forma_pagamento_id,
          quantidade_parcelas, dias_primeira_parcela, dias_entre_parcelas,
          percentual_desconto, percentual_acrescimo,
          status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        data.codigo || `COND${Date.now()}`,
        nome,
        descricao,
        data.tipo,
        data.forma_pagamento_id,
        data.quantidade_parcelas || data.qtd_parcelas || 1,
        data.dias_primeira_parcela || 0,
        data.dias_entre_parcelas || 30,
        data.percentual_desconto || data.desconto_percentual || 0,
        data.percentual_acrescimo || data.acrescimo_percentual || 0,
        data.status || (data.ativo ? 'ATIVO' : 'INATIVO'),
        observacoes
      ]
    });

    return Response.json({ success: true, id: serializeValue(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar condição:', error);
    return Response.json({ error: 'Erro ao criar condição: ' + error.message }, { status: 500 });
  }
}
