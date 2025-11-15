import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM adm_funcionarios
      ORDER BY nome_completo ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return Response.json({ error: 'Erro ao buscar funcionários' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await turso.execute({
      sql: `
        INSERT INTO adm_funcionarios (
          codigo_unico, nome_completo, cpf, rg, data_nascimento,
          telefone, celular, email,
          endereco, cidade, estado, cep,
          cargo, departamento, data_admissao, data_demissao,
          salario, horario_entrada, horario_saida,
          horario_almoco_inicio, horario_almoco_fim,
          dias_trabalho, status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        data.observacoes || null
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return Response.json({ error: 'Erro ao criar funcionário' }, { status: 500 });
  }
}
