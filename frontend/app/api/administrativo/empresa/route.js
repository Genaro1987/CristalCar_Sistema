import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRow } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Normalizar dados de empresa
function normalizarDadosEmpresa(data) {
  const normalized = { ...data };

  // Campos que devem ser normalizados (MAIÚSCULO sem acentos)
  const camposTexto = [
    'razao_social',
    'nome_fantasia',
    'endereco',
    'complemento',
    'bairro',
    'cidade',
    'estado',
    'regime_tributario',
    'observacoes'
  ];

  camposTexto.forEach(campo => {
    if (normalized[campo]) {
      normalized[campo] = normalizarTexto(normalized[campo]);
    }
  });

  // Email e website sempre minúsculo
  if (normalized.email) {
    normalized.email = normalized.email.toLowerCase().trim();
  }
  if (normalized.website || normalized.site) {
    normalized.website = (normalized.website || normalized.site).toLowerCase().trim();
  }

  // Remover espaços extras
  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] === 'string') {
      normalized[key] = normalized[key].trim();
    }
  });

  return normalized;
}

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `SELECT *, COALESCE(logo_url, logo_path) AS logo_path_resolved FROM adm_empresa LIMIT 1`,
      args: []
    });

    if (result.rows.length > 0) {
      const empresa = serializeRow(result.rows[0]);
      return Response.json({
        ...empresa,
        logo_path: empresa.logo_path_resolved || empresa.logo_path || empresa.logo_url || null,
        site: empresa.site || empresa.website || null,
      });
    }

    return Response.json(null);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return Response.json({ error: 'Erro ao buscar dados da empresa' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const normalizedData = normalizarDadosEmpresa(data);

    // Verificar se já existe empresa cadastrada
    const existente = await turso.execute({
      sql: `SELECT id FROM adm_empresa LIMIT 1`,
      args: []
    });

    if (existente.rows.length > 0) {
      // Atualizar empresa existente
      await turso.execute({
        sql: `
          UPDATE adm_empresa
          SET razao_social = ?,
              nome_fantasia = ?,
              cpf_cnpj = ?,
              inscricao_estadual = ?,
              inscricao_municipal = ?,
              regime_tributario = ?,
              telefone = ?,
              celular = ?,
              email = ?,
              site = ?,
              endereco = ?,
              numero = ?,
              complemento = ?,
              bairro = ?,
              cidade = ?,
              estado = ?,
              cep = ?,
              logo_url = ?,
              observacoes = ?,
              atualizado_em = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        args: [
          normalizedData.razao_social,
          normalizedData.nome_fantasia || null,
          normalizedData.cnpj || normalizedData.cpf_cnpj || null,
          normalizedData.inscricao_estadual || null,
          normalizedData.inscricao_municipal || null,
          normalizedData.regime_tributario || 'SIMPLES_NACIONAL',
          normalizedData.telefone || null,
          normalizedData.celular || null,
          normalizedData.email || null,
          normalizedData.website || normalizedData.site || null,
          normalizedData.endereco || null,
          normalizedData.numero || null,
          normalizedData.complemento || null,
          normalizedData.bairro || null,
          normalizedData.cidade || null,
          normalizedData.estado || null,
          normalizedData.cep || null,
          normalizedData.logo_path || normalizedData.logo_url || null,
          normalizedData.observacoes || null,
          existente.rows[0].id
        ]
      });

      return Response.json({ success: true, id: existente.rows[0].id, action: 'updated' });
    } else {
      // Inserir nova empresa
      const result = await turso.execute({
        sql: `
          INSERT INTO adm_empresa (
            razao_social, nome_fantasia, cpf_cnpj, inscricao_estadual, inscricao_municipal,
            regime_tributario, telefone, celular, email, site,
            endereco, numero, complemento, bairro, cidade, estado, cep,
            logo_url,
            observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          normalizedData.razao_social,
          normalizedData.nome_fantasia || null,
          normalizedData.cnpj || normalizedData.cpf_cnpj || null,
          normalizedData.inscricao_estadual || null,
          normalizedData.inscricao_municipal || null,
          normalizedData.regime_tributario || 'SIMPLES_NACIONAL',
          normalizedData.telefone || null,
          normalizedData.celular || null,
          normalizedData.email || null,
          normalizedData.website || normalizedData.site || null,
          normalizedData.endereco || null,
          normalizedData.numero || null,
          normalizedData.complemento || null,
          normalizedData.bairro || null,
          normalizedData.cidade || null,
          normalizedData.estado || null,
          normalizedData.cep || null,
          normalizedData.logo_path || normalizedData.logo_url || null,
          normalizedData.observacoes || null
        ]
      });

      return Response.json({ success: true, id: Number(result.lastInsertRowid), action: 'created' });
    }
  } catch (error) {
    console.error('Erro ao salvar empresa:', error);
    return Response.json({ error: 'Erro ao salvar dados da empresa: ' + error.message }, { status: 500 });
  }
}
