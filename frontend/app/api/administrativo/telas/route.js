import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelaTelas() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS adm_telas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      modulo VARCHAR(50) NOT NULL,
      nome VARCHAR(200) NOT NULL,
      descricao TEXT,
      rota VARCHAR(500),
      icone VARCHAR(50),
      ordem INTEGER DEFAULT 999,
      ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrações: garantir que todas as colunas existem
  try {
    const tableInfo = await turso.execute('PRAGMA table_info(adm_telas)');
    const colunas = tableInfo.rows?.map(row => row.name) || [];

    // Migração 1: adicionar coluna nome se não existir
    if (!colunas.includes('nome')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN nome VARCHAR(200)');
    }

    // Migração 2: adicionar coluna codigo se não existir
    if (!colunas.includes('codigo')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN codigo VARCHAR(20)');

      // Preencher com valores temporários únicos
      const registros = await turso.execute('SELECT id FROM adm_telas');
      for (const reg of registros.rows) {
        await turso.execute({
          sql: 'UPDATE adm_telas SET codigo = ? WHERE id = ?',
          args: [`TEMP-${reg.id}`, reg.id]
        });
      }

      // Criar índice único
      await turso.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_telas_codigo ON adm_telas(codigo)');
    }

    // Migração 3: adicionar outras colunas se não existirem
    if (!colunas.includes('modulo')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN modulo VARCHAR(50)');
    }
    if (!colunas.includes('descricao')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN descricao TEXT');
    }
    if (!colunas.includes('rota')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN rota VARCHAR(500)');
    }
    if (!colunas.includes('icone')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN icone VARCHAR(50)');
    }
    if (!colunas.includes('ordem')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN ordem INTEGER DEFAULT 999');
    }
    if (!colunas.includes('ativo')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN ativo BOOLEAN DEFAULT 1');
    }
  } catch (error) {
    // Migração já foi aplicada ou erro recuperável
    console.log('Migração colunas adm_telas:', error.message);
  }

  const telasPadroes = [
    { codigo: 'ADM-001', modulo: 'ADMINISTRATIVO', nome: 'CADASTRO DA EMPRESA', rota: '/modules/administrativo/empresa', icone: '🏢', ordem: 1 },
    { codigo: 'ADM-002', modulo: 'ADMINISTRATIVO', nome: 'FUNCIONARIOS', rota: '/modules/administrativo/funcionarios', icone: '👥', ordem: 2 },
    { codigo: 'ADM-006', modulo: 'ADMINISTRATIVO', nome: 'DEPARTAMENTOS', rota: '/modules/administrativo/departamentos', icone: '🏛️', ordem: 6 },
    { codigo: 'ADM-007', modulo: 'ADMINISTRATIVO', nome: 'PRODUTOS', rota: '/modules/administrativo/produtos', icone: '📦', ordem: 7 },
    { codigo: 'FIN-001', modulo: 'FINANCEIRO', nome: 'PLANO DE CONTAS', rota: '/modules/modelos-plano/plano-contas', icone: '📊', ordem: 1 },
    { codigo: 'FIN-002', modulo: 'FINANCEIRO', nome: 'TIPOS DE DRE', rota: '/modules/modelos-plano/tipos-dre-lista', icone: '📈', ordem: 2 },
    { codigo: 'FIN-003', modulo: 'FINANCEIRO', nome: 'ESTRUTURA DRE', rota: '/modules/modelos-plano/estrutura-dre-editor', icone: '🎯', ordem: 3 },
    { codigo: 'PAR-001', modulo: 'PARCEIROS', nome: 'CADASTRO DE PARCEIROS', rota: '/modules/parceiros/cadastro', icone: '🤝', ordem: 1 },
    { codigo: 'OBJ-001', modulo: 'OBJETIVOS', nome: 'OBJETIVOS TRIMESTRAIS', rota: '/modules/objetivos/trimestrais', icone: '🎯', ordem: 1 },
    { codigo: 'OBJ-002', modulo: 'OBJETIVOS', nome: 'METAS SEMANAIS', rota: '/modules/objetivos/semanais', icone: '📅', ordem: 2 },
    { codigo: 'IMP-001', modulo: 'IMPORTACAO', nome: 'IMPORTACAO DE EXTRATOS', rota: '/modules/importacao/extratos', icone: '📥', ordem: 1 },
    { codigo: 'IMP-002', modulo: 'IMPORTACAO', nome: 'IMPORTACAO XML NF-E', rota: '/modules/importacao/xml-nfe', icone: '📄', ordem: 2 },
    { codigo: 'IND-001', modulo: 'INDICADORES', nome: 'INDICADORES CUSTOMIZAVEIS', rota: '/modules/indicadores/customizaveis', icone: '📊', ordem: 1 },
    { codigo: 'HOME-001', modulo: 'GERAL', nome: 'PAGINA INICIAL', rota: '/dashboard', icone: '🏠', ordem: 0 },
  ];

  let codigosExistentes = [];
  try {
    const existentes = await turso.execute('SELECT codigo FROM adm_telas WHERE codigo IS NOT NULL');
    codigosExistentes = existentes.rows?.map(row => row.codigo) || [];
  } catch (error) {
    // Se falhar, array vazio - inserirá todas
    codigosExistentes = [];
  }

  for (const tela of telasPadroes) {
    if (!codigosExistentes.includes(tela.codigo)) {
      await turso.execute({
        sql: 'INSERT INTO adm_telas (codigo, modulo, nome, rota, icone, ordem, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [tela.codigo, tela.modulo, tela.nome, tela.rota, tela.icone, tela.ordem, 1]
      });
    }
  }
}

export async function GET(request) {
  try {
    await garantirTabelaTelas();
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');

    if (codigo) {
      const result = await turso.execute({
        sql: 'SELECT * FROM adm_telas WHERE codigo = ? AND ativo = 1',
        args: [codigo]
      });
      return Response.json(result.rows[0] || null);
    }

    const result = await turso.execute('SELECT * FROM adm_telas WHERE ativo = 1 ORDER BY ordem ASC');
    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar telas:', error);
    return Response.json({ error: 'Erro ao buscar telas' }, { status: 500 });
  }
}
