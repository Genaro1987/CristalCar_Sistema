import { createClient } from '@libsql/client';
import { normalizarDadosParceiro } from '@/lib/text-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id } = params;

    // Normalizar dados: MAIÚSCULO sem acentos
    const normalizedData = normalizarDadosParceiro(data);

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
        normalizedData.tipo_parceiro || normalizedData.tipo || 'CLIENTE',
        normalizedData.tipo_pessoa || 'JURIDICA',
        normalizedData.nome_fantasia || null,
        normalizedData.razao_social || null,
        normalizedData.nome_completo || normalizedData.nome || null,
        normalizedData.cnpj || (normalizedData.tipo_pessoa === 'JURIDICA' ? normalizedData.cpf_cnpj : null),
        normalizedData.cpf || (normalizedData.tipo_pessoa === 'FISICA' ? normalizedData.cpf_cnpj : null),
        normalizedData.inscricao_estadual || normalizedData.ie_rg || null,
        normalizedData.inscricao_municipal || null,
        normalizedData.rg || null,
        normalizedData.email || null,
        normalizedData.telefone || null,
        normalizedData.celular || null,
        normalizedData.website || normalizedData.site || null,
        normalizedData.cep || null,
        normalizedData.endereco || null,
        normalizedData.numero || null,
        normalizedData.complemento || null,
        normalizedData.bairro || null,
        normalizedData.cidade || null,
        normalizedData.estado || null,
        normalizedData.banco || null,
        normalizedData.agencia || null,
        normalizedData.conta || null,
        normalizedData.tipo_conta || null,
        normalizedData.pix_chave || normalizedData.pix || null,
        normalizedData.pix_tipo || null,
        normalizedData.limite_credito || 0,
        normalizedData.observacoes || null,
        normalizedData.status || (normalizedData.ativo ? 'ATIVO' : 'INATIVO'),
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
