import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT
          id,
          codigo_unico,
          tipo_pessoa,
          tipo_parceiro,
          COALESCE(cnpj, cpf) as par_cpf_cnpj,
          cnpj as par_cnpj,
          cpf as par_cpf,
          COALESCE(razao_social, nome_completo) as par_nome_razao_social,
          nome_fantasia as par_nome_fantasia,
          telefone as par_telefone,
          celular as par_celular,
          email as par_email,
          endereco as par_endereco,
          cidade as par_cidade,
          estado as par_estado,
          cep as par_cep,
          status as par_status
        FROM par_parceiros
        ORDER BY COALESCE(razao_social, nome_fantasia, nome_completo) ASC
      `,
      args: []
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    return Response.json({ error: 'Erro ao buscar parceiros' }, { status: 500 });
  }
}
