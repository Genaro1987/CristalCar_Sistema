import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT * FROM par_parceiros
      ORDER BY status DESC, nome_fantasia ASC
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

    // Gerar código único se não fornecido
    const codigo = data.codigo || `PAR${Date.now()}`;

    const result = await turso.execute({
      sql: `
        INSERT INTO par_parceiros (
          codigo, tipo_pessoa, tipo_parceiro, nome_fantasia, razao_social, nome,
          cpf_cnpj, rg_inscricao_estadual, inscricao_municipal, email, telefone, celular, site,
          cep, endereco, numero, complemento, bairro,
          cidade, estado,
          banco, agencia, conta, pix,
          limite_credito, observacoes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        codigo,
        data.tipo_pessoa || 'JURIDICA',
        data.tipo_parceiro || data.tipo || 'CLIENTE',
        data.nome_fantasia || null,
        data.razao_social || null,
        data.nome || null,
        data.cpf_cnpj,
        data.rg_inscricao_estadual || data.ie_rg || null,
        data.inscricao_municipal || null,
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
        data.banco || null,
        data.agencia || null,
        data.conta || null,
        data.pix || null,
        data.limite_credito || 0,
        data.observacoes || null,
        data.status || (data.ativo ? 'ATIVO' : 'INATIVO')
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar parceiro:', error);
    return Response.json({ error: 'Erro ao criar parceiro' }, { status: 500 });
  }
}
