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
        SET tipo_parceiro = ?,
            tipo_pessoa = ?,
            nome_fantasia = ?,
            razao_social = ?,
            nome_completo = ?,
            cnpj = ?,
            cpf = ?,
            inscricao_estadual = ?,
            inscricao_municipal = ?,
            rg = ?,
            email = ?,
            telefone = ?,
            celular = ?,
            website = ?,
            cep = ?,
            endereco = ?,
            numero = ?,
            complemento = ?,
            bairro = ?,
            cidade = ?,
            estado = ?,
            banco = ?,
            agencia = ?,
            conta = ?,
            tipo_conta = ?,
            pix_chave = ?,
            pix_tipo = ?,
            limite_credito = ?,
            observacoes = ?,
            status = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.tipo_parceiro || data.tipo || 'CLIENTE',
        data.tipo_pessoa || 'JURIDICA',
        data.nome_fantasia || null,
        data.razao_social || null,
        data.nome_completo || data.nome || null,
        data.cnpj || (data.tipo_pessoa === 'JURIDICA' ? data.cpf_cnpj : null),
        data.cpf || (data.tipo_pessoa === 'FISICA' ? data.cpf_cnpj : null),
        data.inscricao_estadual || data.ie_rg || null,
        data.inscricao_municipal || null,
        data.rg || null,
        data.email || null,
        data.telefone || null,
        data.celular || null,
        data.website || data.site || null,
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
        data.tipo_conta || null,
        data.pix_chave || data.pix || null,
        data.pix_tipo || null,
        data.limite_credito || 0,
        data.observacoes || null,
        data.status || (data.ativo ? 'ATIVO' : 'INATIVO'),
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
