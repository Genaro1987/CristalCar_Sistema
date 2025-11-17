import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function ensureConfigRow(modulo, tela) {
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

  await turso.execute({
    sql: `INSERT OR IGNORE INTO adm_configuracao_log (modulo, tela) VALUES (?, ?)`,
    args: [modulo, tela],
  });
}

async function shouldLog(modulo, tela, acao) {
  await ensureConfigRow(modulo, tela);
  const result = await turso.execute({
    sql: `SELECT registrar_log, registrar_visualizacao, registrar_inclusao, registrar_edicao, registrar_exclusao
          FROM adm_configuracao_log WHERE modulo = ? AND tela = ?`,
    args: [modulo, tela],
  });
  if (result.rows.length === 0) return false;
  const cfg = result.rows[0];
  if (!cfg.registrar_log) return false;
  const map = {
    VISUALIZAR: cfg.registrar_visualizacao,
    INCLUIR: cfg.registrar_inclusao,
    EDITAR: cfg.registrar_edicao,
    EXCLUIR: cfg.registrar_exclusao,
  };
  return map[acao] !== undefined ? !!map[acao] : true;
}

export async function registrarLogAcao({
  modulo,
  tela,
  acao,
  registroId = null,
  dadosNovos = null,
  dadosAnteriores = null,
  usuarioId = null,
  ipAddress = null,
  userAgent = null,
}) {
  const deveRegistrar = await shouldLog(modulo, tela, acao);
  if (!deveRegistrar) return { success: false, reason: 'LOG_DESATIVADO' };

  await turso.execute({
    sql: `INSERT INTO adm_log_acoes (
            usuario_id, modulo, tela, acao, registro_id,
            dados_anteriores, dados_novos, ip_address, user_agent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    args: [
      usuarioId,
      modulo,
      tela,
      acao,
      registroId,
      dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
      dadosNovos ? JSON.stringify(dadosNovos) : null,
      ipAddress,
      userAgent,
    ],
  });
  return { success: true };
}

export async function listarConfiguracoesLog() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS adm_telas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_tela VARCHAR(50) UNIQUE,
      nome_tela VARCHAR(200),
      modulo VARCHAR(100),
      caminho_tela VARCHAR(255),
      icone VARCHAR(50),
      ordem_exibicao INTEGER DEFAULT 0,
      ativo BOOLEAN DEFAULT 1
    )
  `);
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

  const telas = await turso.execute(`SELECT id, codigo_tela, nome_tela, modulo FROM adm_telas WHERE ativo = 1`);
  const configs = await turso.execute(`SELECT * FROM adm_configuracao_log`);
  const configMap = new Map(configs.rows.map((c) => [`${c.modulo}::${c.tela}`, c]));

  return telas.rows.map((tela) => {
    const chave = `${tela.modulo}::${tela.nome_tela}`;
    const existente = configMap.get(chave);
    return {
      id: existente?.id || tela.id,
      modulo: tela.modulo,
      tela: tela.nome_tela,
      codigo: tela.codigo_tela,
      registrar_log: existente?.registrar_log ?? false,
      registrar_visualizacao: existente?.registrar_visualizacao ?? true,
      registrar_inclusao: existente?.registrar_inclusao ?? true,
      registrar_edicao: existente?.registrar_edicao ?? true,
      registrar_exclusao: existente?.registrar_exclusao ?? true,
    };
  });
}
