import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';

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

    // Normalizar campos de texto (MAIÚSCULO sem acentos)
    const nome_completo = normalizarTexto(data.nome_completo);
    const endereco = data.endereco ? normalizarTexto(data.endereco) : null;
    const cidade = data.cidade ? normalizarTexto(data.cidade) : null;
    const cargo = data.cargo ? normalizarTexto(data.cargo) : null;
    const departamento = data.departamento ? normalizarTexto(data.departamento) : null;
    const observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null;

    const result = await turso.execute({
      sql: `
        INSERT INTO adm_funcionarios (
          codigo_unico, nome_completo, cpf, rg, data_nascimento,
          telefone, celular, email,
          endereco, cidade, estado, cep,
          cargo, departamento, data_admissao, data_demissao,
          salario, status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        observacoes
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return Response.json({ error: 'Erro ao criar funcionário: ' + error.message }, { status: 500 });
  }
}
