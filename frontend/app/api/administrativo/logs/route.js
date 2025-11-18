import { createClient } from '@libsql/client';
import { listarConfiguracoesLog } from '@/lib/log-utils';
import { serializeRows } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const dynamic = 'force-dynamic';

async function ensureTables() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS adm_configuracao_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modulo VARCHAR(100) NOT NULL,
      tela VARCHAR(100) NOT NULL,
      registrar_log BOOLEAN DEFAULT 1,
      registrar_visualizacao BOOLEAN DEFAULT 0,
      registrar_inclusao BOOLEAN DEFAULT 1,
      registrar_edicao BOOLEAN DEFAULT 1,
      registrar_exclusao BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(modulo, tela)
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS adm_log_acoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      modulo VARCHAR(100) NOT NULL,
      tela VARCHAR(100) NOT NULL,
      acao VARCHAR(50) NOT NULL,
      registro_id INTEGER,
      dados_anteriores TEXT,
      dados_novos TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET(request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(request.url);
    const includeLogs = searchParams.get('logs') === '1';

    const configs = await listarConfiguracoesLog();
    let logs = [];

    if (includeLogs) {
      const result = await turso.execute({
        sql: `SELECT * FROM adm_log_acoes ORDER BY criado_em DESC LIMIT 200`,
      });
      logs = serializeRows(result.rows);
    }

    return Response.json({ success: true, configs, logs });
  } catch (error) {
    console.error('Erro ao buscar configurações de log:', error);
    return Response.json({ error: 'Erro ao buscar configurações de log' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await ensureTables();
    const { configs } = await request.json();

    if (!Array.isArray(configs)) {
      return Response.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // OTIMIZAÇÃO: Atualizar diretamente em adm_telas (tabela unificada)
    for (const cfg of configs) {
      await turso.execute({
        sql: `
          UPDATE adm_telas SET
            registrar_log = ?,
            registrar_visualizacao = ?,
            registrar_inclusao = ?,
            registrar_edicao = ?,
            registrar_exclusao = ?,
            atualizado_em = CURRENT_TIMESTAMP
          WHERE modulo = ? AND nome_tela = ?
        `,
        args: [
          cfg.registrar_log ? 1 : 0,
          cfg.registrar_visualizacao ? 1 : 0,
          cfg.registrar_inclusao ? 1 : 0,
          cfg.registrar_edicao ? 1 : 0,
          cfg.registrar_exclusao ? 1 : 0,
          cfg.modulo,
          cfg.tela,
        ],
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar configurações de log:', error);
    return Response.json({ error: 'Erro ao salvar configurações de log' }, { status: 500 });
  }
}
