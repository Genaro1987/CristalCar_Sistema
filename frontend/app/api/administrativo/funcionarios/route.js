import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';

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

export async function GET(request) {
  try {
    await garantirColunaEmpresa();
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');

    const result = await turso.execute({
      sql: `
        SELECT * FROM adm_funcionarios
        ${empresaId ? 'WHERE IFNULL(empresa_id, 0) = IFNULL(?, 0)' : ''}
        ORDER BY nome_completo ASC
      `,
      args: empresaId ? [Number(empresaId)] : [],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return Response.json({ error: 'Erro ao buscar funcionários' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirColunaEmpresa();
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
          salario, status, observacoes, empresa_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ]
    });

    return Response.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return Response.json({ error: 'Erro ao criar funcionário: ' + error.message }, { status: 500 });
  }
}
