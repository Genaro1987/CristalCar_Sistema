import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM par_parceiros
      ORDER BY ativo DESC, nome_fantasia ASC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    return Response.json({ error: 'Erro ao buscar parceiros' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await turso.execute({
      sql: `
        INSERT INTO par_parceiros (
          tipo, tipo_pessoa, nome_fantasia, razao_social,
          cpf_cnpj, ie_rg, email, telefone, celular, site,
          cep, endereco, numero, complemento, bairro,
          cidade, estado, pais,
          banco, agencia, conta, pix,
          limite_credito, observacoes, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        data.tipo,
        data.tipo_pessoa,
        data.nome_fantasia,
        data.razao_social || null,
        data.cpf_cnpj,
        data.ie_rg || null,
        data.email || null,
        data.telefone || null,
        data.celular || null,
        data.site || null,
        data.cep || null,
        data.endereco || null,
        data.numero || null,
        data.complemento || null,
        data.bairro || null,
        data.cidade || null,
        data.estado || null,
        data.pais || 'Brasil',
        data.banco || null,
        data.agencia || null,
        data.conta || null,
        data.pix || null,
        data.limite_credito || 0,
        data.observacoes || null,
        data.ativo ? 1 : 0
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar parceiro:', error);
    return Response.json({ error: 'Erro ao criar parceiro' }, { status: 500 });
  }
}
