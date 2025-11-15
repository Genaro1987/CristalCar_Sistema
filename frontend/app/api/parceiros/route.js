import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT
        id,
        codigo,
        tipo_pessoa,
        tipo_parceiro,
        cpf_cnpj,
        COALESCE(razao_social, nome) as nome_razao_social,
        nome_fantasia,
        telefone,
        celular,
        email,
        endereco,
        cidade,
        estado,
        cep,
        status
      FROM par_parceiros
      ORDER BY COALESCE(razao_social, nome) ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    return Response.json({ error: 'Erro ao buscar parceiros' }, { status: 500 });
  }
}
