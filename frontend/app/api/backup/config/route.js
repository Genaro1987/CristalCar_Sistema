import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute('SELECT * FROM adm_configuracao_backup LIMIT 1');

    if (result.rows.length > 0) {
      return Response.json(result.rows[0]);
    } else {
      // Retorna configuração padrão se não existir
      return Response.json({
        id: null,
        tipo_backup: 'LOCAL',
        diretorio_local: '',
        google_drive_folder_id: '',
        google_drive_credentials: '',
        frequencia: 'DIARIA',
        horario_execucao: '02:00',
        dia_semana: 0,
        dia_mes: 1,
        quantidade_manter: 30,
        backup_automatico: false,
        ultimo_backup: null,
        proximo_backup: null,
        status: 'INATIVO',
        observacoes: ''
      });
    }
  } catch (error) {
    console.error('Erro ao buscar configuração de backup:', error);
    return Response.json({ error: 'Erro ao buscar configuração' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Verifica se já existe configuração
    const existing = await turso.execute('SELECT id FROM adm_configuracao_backup LIMIT 1');

    if (existing.rows.length > 0) {
      // Atualiza configuração existente
      await turso.execute({
        sql: `
          UPDATE adm_configuracao_backup SET
            tipo_backup = ?,
            diretorio_local = ?,
            google_drive_folder_id = ?,
            frequencia = ?,
            horario_execucao = ?,
            dia_semana = ?,
            dia_mes = ?,
            quantidade_manter = ?,
            backup_automatico = ?,
            status = ?,
            observacoes = ?,
            atualizado_em = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        args: [
          data.tipo_backup || 'LOCAL',
          data.diretorio_local || null,
          data.google_drive_folder_id || null,
          data.frequencia || 'DIARIA',
          data.horario_execucao || '02:00',
          data.dia_semana || 0,
          data.dia_mes || 1,
          data.quantidade_manter || 30,
          data.backup_automatico ? 1 : 0,
          data.backup_automatico ? 'ATIVO' : 'INATIVO',
          data.observacoes || null,
          existing.rows[0].id
        ]
      });

      return Response.json({ success: true, id: existing.rows[0].id });
    } else {
      // Cria nova configuração
      const result = await turso.execute({
        sql: `
          INSERT INTO adm_configuracao_backup (
            tipo_backup, diretorio_local, google_drive_folder_id,
            frequencia, horario_execucao, dia_semana, dia_mes,
            quantidade_manter, backup_automatico, status, observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          data.tipo_backup || 'LOCAL',
          data.diretorio_local || null,
          data.google_drive_folder_id || null,
          data.frequencia || 'DIARIA',
          data.horario_execucao || '02:00',
          data.dia_semana || 0,
          data.dia_mes || 1,
          data.quantidade_manter || 30,
          data.backup_automatico ? 1 : 0,
          data.backup_automatico ? 'ATIVO' : 'INATIVO',
          data.observacoes || null
        ]
      });

      return Response.json({ success: true, id: result.lastInsertRowid });
    }
  } catch (error) {
    console.error('Erro ao salvar configuração de backup:', error);
    return Response.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
  }
}
