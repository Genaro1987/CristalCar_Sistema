import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `SELECT * FROM adm_configuracao_backup LIMIT 1`,
      args: []
    });

    if (result.rows.length > 0) {
      return Response.json(result.rows[0]);
    }

    // Retornar configuração padrão se não existir
    return Response.json({
      id: null,
      backup_automatico: 0,
      tipo_backup: 'LOCAL',
      diretorio_local: '',
      google_drive_folder_id: '',
      frequencia: 'DIARIA',
      horario_execucao: '02:00',
      dia_semana: 0,
      dia_mes: 1,
      quantidade_manter: 30,
      ultimo_backup: null,
      proximo_backup: null
    });
  } catch (error) {
    console.error('Erro ao buscar configuração de backup:', error);
    return Response.json({ error: 'Erro ao buscar configuração' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Verificar se já existe configuração
    const existing = await turso.execute({
      sql: `SELECT id FROM adm_configuracao_backup LIMIT 1`,
      args: []
    });

    if (existing.rows.length > 0) {
      // Atualizar configuração existente
      await turso.execute({
        sql: `
          UPDATE adm_configuracao_backup
          SET tipo_backup = ?,
              diretorio_local = ?,
              google_drive_folder_id = ?,
              frequencia = ?,
              horario_execucao = ?,
              dia_semana = ?,
              dia_mes = ?,
              quantidade_manter = ?,
              backup_automatico = ?,
              atualizado_em = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        args: [
          data.tipo_backup || 'LOCAL',
          data.diretorio_local || '',
          data.google_drive_folder_id || '',
          data.frequencia || 'DIARIA',
          data.horario_execucao || '02:00',
          data.dia_semana || 0,
          data.dia_mes || 1,
          data.quantidade_manter || 30,
          data.backup_automatico ? 1 : 0,
          existing.rows[0].id
        ]
      });

      return Response.json({ success: true, id: existing.rows[0].id });
    } else {
      // Criar nova configuração
      const result = await turso.execute({
        sql: `
          INSERT INTO adm_configuracao_backup (
            tipo_backup, diretorio_local, google_drive_folder_id,
            frequencia, horario_execucao, dia_semana, dia_mes,
            quantidade_manter, backup_automatico
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          data.tipo_backup || 'LOCAL',
          data.diretorio_local || '',
          data.google_drive_folder_id || '',
          data.frequencia || 'DIARIA',
          data.horario_execucao || '02:00',
          data.dia_semana || 0,
          data.dia_mes || 1,
          data.quantidade_manter || 30,
          data.backup_automatico ? 1 : 0
        ]
      });

      return Response.json({ success: true, id: result.lastInsertRowid });
    }
  } catch (error) {
    console.error('Erro ao salvar configuração de backup:', error);
    return Response.json({ error: 'Erro ao salvar configuração: ' + error.message }, { status: 500 });
  }
}
