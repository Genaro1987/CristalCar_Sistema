import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Lista de tabelas para fazer backup
const TABELAS_BACKUP = [
  // Administrativo
  'adm_empresa',
  'adm_funcionarios',
  'adm_usuarios',
  'adm_telas',
  'adm_perfis_acesso',
  'adm_permissoes',
  'adm_favoritos',
  'adm_configuracao_backup',
  'adm_historico_backup',
  'adm_logs',

  // Parceiros
  'par_parceiros',

  // Financeiro
  'fin_plano_contas',
  'fin_bancos',
  'fin_formas_pagamento',
  'fin_condicoes_pagamento',
  'fin_movimentacao',
];

export async function POST() {
  const inicio = Date.now();
  let status = 'SUCESSO';
  let mensagemErro = null;
  let tamanhoBytes = 0;

  try {
    const backup = {
      versao: '1.0',
      data_exportacao: new Date().toISOString(),
      banco: 'CristalCar_Sistema',
      tabelas: {}
    };

    // Exportar cada tabela
    for (const tabela of TABELAS_BACKUP) {
      try {
        const result = await turso.execute({
          sql: `SELECT * FROM ${tabela}`,
          args: []
        });

        backup.tabelas[tabela] = {
          total_registros: result.rows.length,
          dados: result.rows
        };

        console.log(`✓ Backup da tabela ${tabela}: ${result.rows.length} registros`);
      } catch (error) {
        console.warn(`⚠ Tabela ${tabela} não encontrada ou erro ao exportar:`, error.message);
        backup.tabelas[tabela] = {
          total_registros: 0,
          dados: [],
          erro: error.message
        };
      }
    }

    // Converter para JSON
    const backupJSON = JSON.stringify(backup, null, 2);
    tamanhoBytes = Buffer.byteLength(backupJSON, 'utf8');

    // Calcular tempo de execução
    const tempoExecucao = Math.round((Date.now() - inicio) / 1000);

    // Registrar no histórico
    const dataAtual = new Date();
    const nomeArquivo = `cristalcar_backup_${dataAtual.toISOString().replace(/[:.]/g, '-').substring(0, 19)}.json`;

    try {
      await turso.execute({
        sql: `
          INSERT INTO adm_historico_backup (
            data_backup, status, tipo_backup, local_arquivo,
            tamanho_arquivo_bytes, tempo_execucao_segundos, mensagem_erro
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          dataAtual.toISOString(),
          status,
          'MANUAL',
          nomeArquivo,
          tamanhoBytes,
          tempoExecucao,
          mensagemErro
        ]
      });
    } catch (histError) {
      console.error('Erro ao registrar histórico:', histError);
      // Não falhar o backup se o histórico falhar
    }

    // Atualizar data do último backup
    try {
      await turso.execute({
        sql: `
          UPDATE adm_configuracao_backup
          SET ultimo_backup = ?
          WHERE id = 1
        `,
        args: [dataAtual.toISOString()]
      });
    } catch (updateError) {
      console.error('Erro ao atualizar último backup:', updateError);
    }

    // Retornar o arquivo JSON para download
    return new Response(backupJSON, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
        'Content-Length': tamanhoBytes.toString()
      }
    });

  } catch (error) {
    status = 'ERRO';
    mensagemErro = error.message;

    const tempoExecucao = Math.round((Date.now() - inicio) / 1000);

    // Tentar registrar erro no histórico
    try {
      await turso.execute({
        sql: `
          INSERT INTO adm_historico_backup (
            data_backup, status, tipo_backup, tempo_execucao_segundos, mensagem_erro
          ) VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          new Date().toISOString(),
          status,
          'MANUAL',
          tempoExecucao,
          mensagemErro
        ]
      });
    } catch (histError) {
      console.error('Erro ao registrar erro no histórico:', histError);
    }

    console.error('Erro ao executar backup:', error);
    return Response.json({
      error: 'Erro ao executar backup: ' + error.message,
      status: 'ERRO'
    }, { status: 500 });
  }
}
