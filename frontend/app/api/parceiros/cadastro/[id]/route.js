import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id } = params;

    await turso.execute({
      sql: `
        UPDATE par_parceiros
        SET tipo = ?,
            tipo_pessoa = ?,
            nome_fantasia = ?,
            razao_social = ?,
            cpf_cnpj = ?,
            ie_rg = ?,
            email = ?,
            telefone = ?,
            celular = ?,
            site = ?,
            cep = ?,
            endereco = ?,
            numero = ?,
            complemento = ?,
            bairro = ?,
            cidade = ?,
            estado = ?,
            pais = ?,
            banco = ?,
            agencia = ?,
            conta = ?,
            pix = ?,
            limite_credito = ?,
            observacoes = ?,
            ativo = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
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
        data.ativo ? 1 : 0,
        id
      ]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar parceiro:', error);
    return Response.json({ error: 'Erro ao atualizar parceiro' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Verificar se o parceiro está sendo usado em vendas ou compras
    const checkVendas = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM mov_vendas WHERE parceiro_id = ?',
      args: [id]
    });

    const checkCompras = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM mov_compras WHERE parceiro_id = ?',
      args: [id]
    });

    if (checkVendas.rows[0].count > 0 || checkCompras.rows[0].count > 0) {
      return Response.json(
        { error: 'Não é possível excluir. Este parceiro está sendo usado em vendas ou compras.' },
        { status: 400 }
      );
    }

    await turso.execute({
      sql: 'DELETE FROM par_parceiros WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir parceiro:', error);
    return Response.json({ error: 'Erro ao excluir parceiro' }, { status: 500 });
  }
}
