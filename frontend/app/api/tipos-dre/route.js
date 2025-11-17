import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Modelos básicos fixos de DRE
const modelosBasicos = [
  {
    codigo: 'OFICIAL',
    nome: 'Modelo Oficial',
    descricao: 'Estrutura padrão de DRE conforme legislação contábil brasileira',
    fixo: true,
    ordem: 1
  },
  {
    codigo: 'EBITDA',
    nome: 'Modelo EBITDA',
    descricao: 'Foca no resultado operacional antes de juros, impostos, depreciação e amortização',
    fixo: true,
    ordem: 2
  },
  {
    codigo: 'CUSTEIO_VARIAVEL',
    nome: 'Custeio Variável',
    descricao: 'Separa custos e despesas entre fixos e variáveis',
    fixo: true,
    ordem: 3
  }
];

async function garantirTabela() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fin_tipos_dre (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(50) UNIQUE NOT NULL,
      nome VARCHAR(200) NOT NULL,
      descricao TEXT,
      fixo BOOLEAN DEFAULT 0,
      ordem INTEGER DEFAULT 999,
      empresa_id INTEGER,
      ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (empresa_id) REFERENCES adm_empresa(id)
    )
  `);

  // Adicionar colunas se não existirem
  const colunas = ['fixo', 'ordem', 'empresa_id', 'ativo'];
  for (const coluna of colunas) {
    try {
      let ddl = '';
      if (coluna === 'fixo' || coluna === 'ativo') {
        ddl = `ALTER TABLE fin_tipos_dre ADD COLUMN ${coluna} BOOLEAN DEFAULT 0`;
      } else if (coluna === 'ordem') {
        ddl = `ALTER TABLE fin_tipos_dre ADD COLUMN ${coluna} INTEGER DEFAULT 999`;
      } else {
        ddl = `ALTER TABLE fin_tipos_dre ADD COLUMN ${coluna} INTEGER`;
      }
      await turso.execute(ddl);
    } catch (e) {
      // Coluna já existe
    }
  }
}

async function garantirModelosBasicos() {
  await garantirTabela();

  const existentes = await turso.execute('SELECT codigo FROM fin_tipos_dre WHERE fixo = 1');
  const codigos = existentes.rows?.map((row) => row.codigo) || [];

  for (const modelo of modelosBasicos) {
    if (!codigos.includes(modelo.codigo)) {
      await turso.execute({
        sql: `INSERT INTO fin_tipos_dre (codigo, nome, descricao, fixo, ordem, ativo) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [modelo.codigo, modelo.nome, modelo.descricao, 1, modelo.ordem, 1],
      });
    }
  }
}

export async function GET(request) {
  try {
    await garantirModelosBasicos();
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');

    let sql = 'SELECT * FROM fin_tipos_dre WHERE ativo = 1';
    const args = [];

    if (empresaId) {
      sql += ' AND (fixo = 1 OR empresa_id = ? OR empresa_id IS NULL)';
      args.push(Number(empresaId));
    }

    sql += ' ORDER BY ordem ASC, nome ASC';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return NextResponse.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao listar tipos de DRE:', error);
    return NextResponse.json({ error: 'Erro ao listar tipos de DRE' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabela();
    const data = await request.json();

    // Não permitir criação de tipos fixos via API
    if (data.fixo) {
      return NextResponse.json({ error: 'Não é possível criar modelos fixos via API' }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `INSERT INTO fin_tipos_dre (codigo, nome, descricao, fixo, ordem, empresa_id, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.codigo || `CUSTOM_${Date.now()}`,
        data.nome,
        data.descricao || null,
        0, // Não é fixo
        data.ordem || 999,
        data.empresa_id || null,
        data.ativo !== false ? 1 : 0
      ],
    });

    return NextResponse.json({ success: true, id: serializeValue(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar tipo de DRE:', error);
    return NextResponse.json({ error: 'Erro ao criar tipo de DRE: ' + error.message }, { status: 500 });
  }
}
