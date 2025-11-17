import { createClient } from '@libsql/client';
import { serializeRows, serializeValue } from '@/lib/db-utils';

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

  const telasPadroes = [
    { codigo: 'ADM-001', modulo: 'ADMINISTRATIVO', nome: 'CADASTRO DA EMPRESA', rota: '/modules/administrativo/empresa', icone: '🏢', ordem: 1 },
    { codigo: 'ADM-002', modulo: 'ADMINISTRATIVO', nome: 'FUNCIONARIOS', rota: '/modules/administrativo/funcionarios', icone: '👥', ordem: 2 },
    { codigo: 'ADM-006', modulo: 'ADMINISTRATIVO', nome: 'DEPARTAMENTOS', rota: '/modules/administrativo/departamentos', icone: '🏛️', ordem: 6 },
    { codigo: 'FIN-001', modulo: 'FINANCEIRO', nome: 'PLANO DE CONTAS', rota: '/modules/modelos-plano/plano-contas', icone: '📊', ordem: 1 },
    { codigo: 'FIN-002', modulo: 'FINANCEIRO', nome: 'TIPOS DE DRE', rota: '/modules/modelos-plano/planos-padroes', icone: '📈', ordem: 2 },
    { codigo: 'FIN-003', modulo: 'FINANCEIRO', nome: 'ESTRUTURA DRE', rota: '/modules/modelos-plano/estrutura-dre', icone: '🎯', ordem: 3 },
    { codigo: 'PAR-001', modulo: 'PARCEIROS', nome: 'CADASTRO DE PARCEIROS', rota: '/modules/parceiros/cadastro', icone: '🤝', ordem: 1 },
    { codigo: 'OBJ-001', modulo: 'OBJETIVOS', nome: 'OBJETIVOS TRIMESTRAIS', rota: '/modules/objetivos/trimestrais', icone: '🎯', ordem: 1 },
    { codigo: 'OBJ-002', modulo: 'OBJETIVOS', nome: 'METAS SEMANAIS', rota: '/modules/objetivos/semanais', icone: '📅', ordem: 2 },
    { codigo: 'IMP-001', modulo: 'IMPORTACAO', nome: 'IMPORTACAO DE EXTRATOS', rota: '/modules/importacao/extratos', icone: '📥', ordem: 1 },
    { codigo: 'IMP-002', modulo: 'IMPORTACAO', nome: 'IMPORTACAO XML NF-E', rota: '/modules/importacao/xml-nfe', icone: '📄', ordem: 2 },
    { codigo: 'IND-001', modulo: 'INDICADORES', nome: 'INDICADORES CUSTOMIZAVEIS', rota: '/modules/indicadores/customizaveis', icone: '📊', ordem: 1 },
    { codigo: 'HOME-001', modulo: 'GERAL', nome: 'PAGINA INICIAL', rota: '/dashboard', icone: '🏠', ordem: 0 },
  ];

  const existentes = await turso.execute('SELECT codigo FROM adm_telas');
  const codigosExistentes = existentes.rows?.map(row => row.codigo) || [];

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
