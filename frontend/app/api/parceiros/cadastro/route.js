import { createClient } from '@libsql/client';
import { normalizarDadosParceiro } from '@/lib/text-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `SELECT * FROM par_parceiros ORDER BY status DESC, nome_fantasia ASC`,
      args: []
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    return Response.json({ error: 'Erro ao buscar parceiros' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Normalizar dados: MAIÚSCULO sem acentos
    const normalizedData = normalizarDadosParceiro(data);

    // Gerar código único se não fornecido
    const codigo_unico = normalizedData.codigo_unico || normalizedData.codigo || `PAR${Date.now()}`;

    const result = await turso.execute({
      sql: `
        INSERT INTO par_parceiros (
          codigo_unico, tipo_pessoa, tipo_parceiro, nome_fantasia, razao_social, nome_completo,
          cnpj, cpf, inscricao_estadual, inscricao_municipal, rg, email, telefone, celular, website,
          cep, endereco, numero, complemento, bairro, cidade, estado,
          banco, agencia, conta, tipo_conta, pix_chave, pix_tipo,
          limite_credito, observacoes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        codigo_unico,
        normalizedData.tipo_pessoa || 'JURIDICA',
        normalizedData.tipo_parceiro || normalizedData.tipo || 'CLIENTE',
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
        normalizedData.status || (normalizedData.ativo ? 'ATIVO' : 'INATIVO')
      ]
    });

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar parceiro:', error);
    return Response.json({ error: 'Erro ao criar parceiro' }, { status: 500 });
  }
}
