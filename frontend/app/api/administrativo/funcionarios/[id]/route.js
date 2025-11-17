import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { registrarLogAcao } from '@/lib/log-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirColunaEmpresa() {
  const info = await turso.execute('PRAGMA table_info(adm_funcionarios)');
  const possuiEmpresa = info.rows?.some((c) => c.name === 'empresa_id');
  if (!possuiEmpresa) {
    await turso.execute('ALTER TABLE adm_funcionarios ADD COLUMN empresa_id INTEGER');
    await turso.execute('CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON adm_funcionarios(empresa_id)');
  }
}

export async function PUT(request, { params }) {
  try {
    await garantirColunaEmpresa();
    const { id } = params;
    const data = await request.json();
    const existente = await turso.execute({
      sql: 'SELECT * FROM adm_funcionarios WHERE id = ?',
      args: [id],
    });

    // Normalizar campos de texto (MAIÚSCULO sem acentos)
    const nome_completo = normalizarTexto(data.nome_completo);
    const endereco = data.endereco ? normalizarTexto(data.endereco) : null;
    const cidade = data.cidade ? normalizarTexto(data.cidade) : null;
    const cargo = data.cargo ? normalizarTexto(data.cargo) : null;
    const departamento = data.departamento ? normalizarTexto(data.departamento) : null;
    const observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null;

    await turso.execute({
      sql: `
        UPDATE adm_funcionarios SET
          codigo_unico = ?,
          nome_completo = ?,
          cpf = ?,
          rg = ?,
          data_nascimento = ?,
          telefone = ?,
          celular = ?,
          email = ?,
          endereco = ?,
          cidade = ?,
          estado = ?,
          cep = ?,
          cargo = ?,
          departamento = ?,
          data_admissao = ?,
          data_demissao = ?,
          salario = ?,
          status = ?,
          observacoes = ?,
          empresa_id = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.codigo_unico,
        nome_completo,
        data.cpf,
        data.rg || null,
        data.data_nascimento || null,
        data.telefone || null,
        data.celular || null,
        data.email?.toLowerCase() || null,
        endereco,
        cidade,
        data.estado || null,
        data.cep || null,
        cargo,
        departamento,
        data.data_admissao || null,
        data.data_demissao || null,
        data.salario || null,
        data.status || 'ATIVO',
        observacoes,
        data.empresa_id || null,
        id
      ]
    });

    await registrarLogAcao({
      modulo: 'ADMINISTRATIVO',
      tela: 'FUNCIONARIOS',
      acao: 'EDITAR',
      registroId: Number(id),
      dadosAnteriores: existente.rows?.[0] || null,
      dadosNovos: data,
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return Response.json({ error: 'Erro ao atualizar funcionário: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const existente = await turso.execute({
      sql: 'SELECT * FROM adm_funcionarios WHERE id = ?',
      args: [id],
    });
    await turso.execute({
      sql: 'DELETE FROM adm_funcionarios WHERE id = ?',
      args: [id]
    });

    await registrarLogAcao({
      modulo: 'ADMINISTRATIVO',
      tela: 'FUNCIONARIOS',
      acao: 'EXCLUIR',
      registroId: Number(id),
      dadosAnteriores: existente.rows?.[0] || null,
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    return Response.json({ error: 'Erro ao excluir funcionário' }, { status: 500 });
  }
}
