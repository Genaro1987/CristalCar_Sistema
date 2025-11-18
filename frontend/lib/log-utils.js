import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function ensureConfigRow(modulo, tela) {
  // OTIMIZAÇÃO: adm_telas já contém as configurações de log
  // Não precisa mais criar linhas separadas em adm_configuracao_log

  // Garantir que a tela existe em adm_telas
  const telaExiste = await turso.execute({
    sql: `SELECT id FROM adm_telas WHERE modulo = ? AND nome_tela = ?`,
    args: [modulo, tela],
  });

  // Se não existir, os valores padrão da tabela serão usados
  if (telaExiste.rows.length === 0) {
    console.log(`[AVISO] Tela ${modulo}::${tela} não encontrada em adm_telas`);
  }
}

async function shouldLog(modulo, tela, acao) {
  await ensureConfigRow(modulo, tela);

  // OTIMIZAÇÃO: Ler diretamente de adm_telas (tabela unificada)
  const result = await turso.execute({
    sql: `SELECT registrar_log, registrar_visualizacao, registrar_inclusao, registrar_edicao, registrar_exclusao
          FROM adm_telas WHERE modulo = ? AND nome_tela = ?`,
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
  // OTIMIZAÇÃO: Agora usamos apenas adm_telas (unificado com configurações de log)
  // Não precisamos mais fazer JOIN em memória entre 2 tabelas!

  const telas = await turso.execute(`
    SELECT
      id, codigo_tela, nome_tela, modulo,
      registrar_log, registrar_visualizacao, registrar_inclusao,
      registrar_edicao, registrar_exclusao
    FROM adm_telas
    WHERE ativo = 1
    ORDER BY ordem_exibicao ASC
  `);

  return telas.rows.map((tela) => ({
    id: tela.id,
    modulo: tela.modulo,
    tela: tela.nome_tela,
    codigo: tela.codigo_tela,
    registrar_log: tela.registrar_log ?? 1,
    registrar_visualizacao: tela.registrar_visualizacao ?? 0,
    registrar_inclusao: tela.registrar_inclusao ?? 1,
    registrar_edicao: tela.registrar_edicao ?? 1,
    registrar_exclusao: tela.registrar_exclusao ?? 1,
  }));
}
