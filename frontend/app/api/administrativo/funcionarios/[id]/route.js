import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

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
          horario_entrada = ?,
          horario_saida = ?,
          horario_almoco_inicio = ?,
          horario_almoco_fim = ?,
          dias_trabalho = ?,
          status = ?,
          observacoes = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.codigo_unico,
        data.nome_completo,
        data.cpf,
        data.rg || null,
        data.data_nascimento || null,
        data.telefone || null,
        data.celular || null,
        data.email || null,
        data.endereco || null,
        data.cidade || null,
        data.estado || null,
        data.cep || null,
        data.cargo || null,
        data.departamento || null,
        data.data_admissao || null,
        data.data_demissao || null,
        data.salario || null,
        data.horario_entrada || null,
        data.horario_saida || null,
        data.horario_almoco_inicio || null,
        data.horario_almoco_fim || null,
        data.dias_trabalho ? data.dias_trabalho.join(',') : null,
        data.status || 'ATIVO',
        data.observacoes || null,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return Response.json({ error: 'Erro ao atualizar funcionário' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await turso.execute({
      sql: 'DELETE FROM adm_funcionarios WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    return Response.json({ error: 'Erro ao excluir funcionário' }, { status: 500 });
  }
}
