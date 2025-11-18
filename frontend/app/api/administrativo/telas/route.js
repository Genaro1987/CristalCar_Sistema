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
      codigo_tela VARCHAR(50) UNIQUE NOT NULL,
      nome_tela VARCHAR(200) NOT NULL,
      descricao TEXT,
      modulo VARCHAR(50) NOT NULL,
      caminho_tela VARCHAR(500),
      icone VARCHAR(50),
      ordem_exibicao INTEGER DEFAULT 999,
      exibir_menu BOOLEAN DEFAULT 1,
      exibir_favoritos BOOLEAN DEFAULT 1,
      ativo BOOLEAN DEFAULT 1,
      registrar_log BOOLEAN DEFAULT 1,
      registrar_visualizacao BOOLEAN DEFAULT 0,
      registrar_inclusao BOOLEAN DEFAULT 1,
      registrar_edicao BOOLEAN DEFAULT 1,
      registrar_exclusao BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrações: garantir que todas as colunas existem
  try {
    const tableInfo = await turso.execute('PRAGMA table_info(adm_telas)');
    const colunas = tableInfo.rows?.map(row => row.name) || [];

    // Migração 1: adicionar coluna codigo_tela se não existir
    if (!colunas.includes('codigo_tela')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN codigo_tela VARCHAR(50)');

      if (colunas.includes('codigo')) {
        await turso.execute('UPDATE adm_telas SET codigo_tela = codigo WHERE codigo_tela IS NULL');
      }

      await turso.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_telas_codigo ON adm_telas(codigo_tela)');
    }

    // Migração 2: adicionar coluna nome_tela se não existir
    if (!colunas.includes('nome_tela')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN nome_tela VARCHAR(200)');

      if (colunas.includes('nome')) {
        await turso.execute('UPDATE adm_telas SET nome_tela = nome WHERE nome_tela IS NULL');
      }
    }

    // Migração 3: adicionar outras colunas se não existirem
    if (!colunas.includes('modulo')) await turso.execute('ALTER TABLE adm_telas ADD COLUMN modulo VARCHAR(50)');
    if (!colunas.includes('descricao')) await turso.execute('ALTER TABLE adm_telas ADD COLUMN descricao TEXT');
    if (!colunas.includes('caminho_tela')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN caminho_tela VARCHAR(500)');

      if (colunas.includes('rota')) {
        await turso.execute('UPDATE adm_telas SET caminho_tela = rota WHERE caminho_tela IS NULL');
      }
    }
    if (!colunas.includes('icone')) await turso.execute('ALTER TABLE adm_telas ADD COLUMN icone VARCHAR(50)');
    if (!colunas.includes('ordem_exibicao')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN ordem_exibicao INTEGER DEFAULT 999');

      if (colunas.includes('ordem')) {
        await turso.execute('UPDATE adm_telas SET ordem_exibicao = ordem WHERE ordem_exibicao IS NULL');
      }
    }
    if (!colunas.includes('exibir_menu')) await turso.execute('ALTER TABLE adm_telas ADD COLUMN exibir_menu BOOLEAN DEFAULT 1');
    if (!colunas.includes('exibir_favoritos')) await turso.execute('ALTER TABLE adm_telas ADD COLUMN exibir_favoritos BOOLEAN DEFAULT 1');
    if (!colunas.includes('ativo')) await turso.execute('ALTER TABLE adm_telas ADD COLUMN ativo BOOLEAN DEFAULT 1');

    // Migração UNIFICAÇÃO LOG: adicionar colunas de configuração de log
    if (!colunas.includes('registrar_log')) {
      console.log('[MIGRAÇÃO] Adicionando colunas de log em adm_telas');
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN registrar_log BOOLEAN DEFAULT 1');
    }
    if (!colunas.includes('registrar_visualizacao')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN registrar_visualizacao BOOLEAN DEFAULT 0');
    }
    if (!colunas.includes('registrar_inclusao')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN registrar_inclusao BOOLEAN DEFAULT 1');
    }
    if (!colunas.includes('registrar_edicao')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN registrar_edicao BOOLEAN DEFAULT 1');
    }
    if (!colunas.includes('registrar_exclusao')) {
      await turso.execute('ALTER TABLE adm_telas ADD COLUMN registrar_exclusao BOOLEAN DEFAULT 1');
    }

    // Migrar dados de adm_configuracao_log para adm_telas (se existir)
    try {
      const tabelaLogExiste = await turso.execute(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='adm_configuracao_log'
      `);

      if (tabelaLogExiste.rows.length > 0) {
        console.log('[MIGRAÇÃO] Migrando dados de adm_configuracao_log para adm_telas');

        // Buscar configurações existentes
        const configs = await turso.execute('SELECT * FROM adm_configuracao_log');

        for (const cfg of configs.rows) {
          // Atualizar adm_telas com as configurações de log
          await turso.execute({
            sql: `UPDATE adm_telas SET
                  registrar_log = ?,
                  registrar_visualizacao = ?,
                  registrar_inclusao = ?,
                  registrar_edicao = ?,
                  registrar_exclusao = ?
                  WHERE modulo = ? AND nome_tela = ?`,
            args: [
              cfg.registrar_log || 0,
              cfg.registrar_visualizacao || 0,
              cfg.registrar_inclusao || 0,
              cfg.registrar_edicao || 0,
              cfg.registrar_exclusao || 0,
              cfg.modulo,
              cfg.tela
            ]
          });
        }

        console.log('[MIGRAÇÃO] Dados migrados com sucesso. Você pode remover adm_configuracao_log manualmente se desejar.');
      }
    } catch (error) {
      console.log('[INFO] Migração adm_configuracao_log:', error.message);
    }
  } catch (error) {
    // Migração já foi aplicada ou erro recuperável
    console.log('Migração colunas adm_telas:', error.message);
  }

  const telasPadroes = [
    { codigo_tela: 'HOME-001', modulo: 'GERAL', nome_tela: 'PAGINA INICIAL', caminho_tela: '/dashboard', icone: '🏠', ordem_exibicao: 0 },
    { codigo_tela: 'ADM-001', modulo: 'ADMINISTRATIVO', nome_tela: 'CADASTRO DA EMPRESA', caminho_tela: '/modules/administrativo/empresa', icone: '🏢', ordem_exibicao: 1 },
    { codigo_tela: 'ADM-002', modulo: 'ADMINISTRATIVO', nome_tela: 'FUNCIONARIOS', caminho_tela: '/modules/administrativo/funcionarios', icone: '👥', ordem_exibicao: 2 },
    { codigo_tela: 'ADM-003', modulo: 'ADMINISTRATIVO', nome_tela: 'LAYOUTS DE IMPORTACAO', caminho_tela: '/modules/administrativo/layouts-importacao', icone: '📋', ordem_exibicao: 3 },
    { codigo_tela: 'ADM-006', modulo: 'ADMINISTRATIVO', nome_tela: 'DEPARTAMENTOS', caminho_tela: '/modules/administrativo/departamentos', icone: '🏛️', ordem_exibicao: 6 },
    { codigo_tela: 'ADM-007', modulo: 'ADMINISTRATIVO', nome_tela: 'PRODUTOS', caminho_tela: '/modules/administrativo/produtos', icone: '📦', ordem_exibicao: 7 },
    { codigo_tela: 'FIN-001', modulo: 'FINANCEIRO', nome_tela: 'PLANO DE CONTAS', caminho_tela: '/modules/modelos-plano/plano-contas', icone: '📊', ordem_exibicao: 1 },
    { codigo_tela: 'FIN-002', modulo: 'FINANCEIRO', nome_tela: 'TIPOS DE DRE', caminho_tela: '/modules/modelos-plano/tipos-dre-lista', icone: '📈', ordem_exibicao: 2 },
    { codigo_tela: 'FIN-003', modulo: 'FINANCEIRO', nome_tela: 'ESTRUTURA DRE', caminho_tela: '/modules/modelos-plano/estrutura-dre-editor', icone: '🎯', ordem_exibicao: 3 },
    { codigo_tela: 'CAD-001', modulo: 'CADASTROS', nome_tela: 'ITENS POR TABELA DE PRECO', caminho_tela: '/modules/cadastros/itens-tabela-preco', icone: '💰', ordem_exibicao: 1 },
    { codigo_tela: 'CAD-002', modulo: 'CADASTROS', nome_tela: 'FORMAS DE PAGAMENTO', caminho_tela: '/modules/cadastros/formas-pagamento', icone: '💳', ordem_exibicao: 2 },
    { codigo_tela: 'CAD-003', modulo: 'CADASTROS', nome_tela: 'CONDICOES DE PAGAMENTO', caminho_tela: '/modules/cadastros/condicoes-pagamento', icone: '📝', ordem_exibicao: 3 },
    { codigo_tela: 'PAR-001', modulo: 'PARCEIROS', nome_tela: 'CADASTRO DE PARCEIROS', caminho_tela: '/modules/parceiros/cadastro', icone: '🤝', ordem_exibicao: 1 },
    { codigo_tela: 'OBJ-001', modulo: 'OBJETIVOS', nome_tela: 'OBJETIVOS TRIMESTRAIS', caminho_tela: '/modules/objetivos/trimestrais', icone: '🎯', ordem_exibicao: 1 },
    { codigo_tela: 'OBJ-002', modulo: 'OBJETIVOS', nome_tela: 'METAS SEMANAIS', caminho_tela: '/modules/objetivos/semanais', icone: '📅', ordem_exibicao: 2 },
    { codigo_tela: 'OBJ-003', modulo: 'OBJETIVOS', nome_tela: 'METAS MENSAIS', caminho_tela: '/modules/objetivos/mensais', icone: '📆', ordem_exibicao: 3 },
    { codigo_tela: 'IMP-001', modulo: 'IMPORTACAO', nome_tela: 'IMPORTACAO DE EXTRATOS', caminho_tela: '/modules/importacao/extratos', icone: '📥', ordem_exibicao: 1 },
    { codigo_tela: 'IMP-002', modulo: 'IMPORTACAO', nome_tela: 'IMPORTACAO XML NF-E', caminho_tela: '/modules/importacao/xml-nfe', icone: '📄', ordem_exibicao: 2 },
    { codigo_tela: 'IND-001', modulo: 'INDICADORES', nome_tela: 'INDICADORES CUSTOMIZAVEIS', caminho_tela: '/modules/indicadores/customizaveis', icone: '📊', ordem_exibicao: 1 },
    { codigo_tela: 'TAB-001', modulo: 'TABELAS', nome_tela: 'TABELAS DE PRECOS', caminho_tela: '/modules/tabelas/precos', icone: '💵', ordem_exibicao: 1 },
    { codigo_tela: 'TAB-002', modulo: 'TABELAS', nome_tela: 'HISTORICO DE ALTERACOES', caminho_tela: '/modules/tabelas/historico', icone: '📜', ordem_exibicao: 2 },
  ];

  // Limpar registros inválidos ou duplicados
  const codigosValidos = telasPadroes.map(t => t.codigo_tela);
  try {
    // Remover telas que não estão na lista de códigos válidos
    const placeholders = codigosValidos.map(() => '?').join(',');
    await turso.execute({
      sql: `DELETE FROM adm_telas WHERE codigo_tela NOT IN (${placeholders})`,
      args: codigosValidos
    });
  } catch (error) {
    console.log('Erro ao limpar telas inválidas:', error.message);
  }

  let codigosExistentes = [];
  try {
    const existentes = await turso.execute('SELECT codigo_tela FROM adm_telas WHERE codigo_tela IS NOT NULL');
    codigosExistentes = existentes.rows?.map(row => row.codigo_tela) || [];
  } catch (error) {
    // Se falhar, array vazio - inserirá todas
    codigosExistentes = [];
  }

  for (const tela of telasPadroes) {
    if (!codigosExistentes.includes(tela.codigo_tela)) {
      await turso.execute({
        sql: `INSERT INTO adm_telas (
          codigo_tela, modulo, nome_tela, caminho_tela, icone, ordem_exibicao,
          exibir_menu, exibir_favoritos, ativo,
          registrar_log, registrar_visualizacao, registrar_inclusao, registrar_edicao, registrar_exclusao
        ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1, 1, 0, 1, 1, 1)`,
        args: [tela.codigo_tela, tela.modulo, tela.nome_tela, tela.caminho_tela, tela.icone, tela.ordem_exibicao]
      });
    } else {
      // Atualizar tela existente para garantir dados corretos
      await turso.execute({
        sql: `UPDATE adm_telas SET
              modulo = ?, nome_tela = ?, caminho_tela = ?, icone = ?, ordem_exibicao = ?
              WHERE codigo_tela = ?`,
        args: [tela.modulo, tela.nome_tela, tela.caminho_tela, tela.icone, tela.ordem_exibicao, tela.codigo_tela]
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
        sql: 'SELECT * FROM adm_telas WHERE codigo_tela = ? AND ativo = 1',
        args: [codigo]
      });
      const tela = result.rows[0];
      return Response.json(
        tela
          ? {
              ...tela,
              codigo: tela.codigo_tela ?? tela.codigo,
              nome: tela.nome_tela ?? tela.nome,
              rota: tela.caminho_tela ?? tela.rota,
              ordem: tela.ordem_exibicao ?? tela.ordem,
            }
          : null
      );
    }

    const result = await turso.execute('SELECT * FROM adm_telas WHERE ativo = 1 ORDER BY ordem_exibicao ASC');
    const telas = serializeRows(result.rows).map((tela) => ({
      ...tela,
      codigo: tela.codigo_tela ?? tela.codigo,
      nome: tela.nome_tela ?? tela.nome,
      rota: tela.caminho_tela ?? tela.rota,
      ordem: tela.ordem_exibicao ?? tela.ordem,
    }));

    return Response.json(telas);
  } catch (error) {
    console.error('Erro ao buscar telas:', error);
    return Response.json({ error: 'Erro ao buscar telas' }, { status: 500 });
  }
}
