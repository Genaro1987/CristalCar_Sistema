import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRow, serializeRows } from '@/lib/db-utils';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirColunasEmpresa() {
  try {
    const info = await turso.execute(`PRAGMA table_info(adm_empresa)`);
    const colunas = info?.rows?.map(row => row.name) || [];

    if (!colunas.includes('logo_url')) {
      await turso.execute(`ALTER TABLE adm_empresa ADD COLUMN logo_url VARCHAR(500)`);
    }

    if (!colunas.includes('cpf_cnpj')) {
      await turso.execute(`ALTER TABLE adm_empresa ADD COLUMN cpf_cnpj VARCHAR(18)`);
    }

    if (!colunas.includes('padrao')) {
      await turso.execute(`ALTER TABLE adm_empresa ADD COLUMN padrao BOOLEAN DEFAULT 0`);
    }
  } catch (error) {
    // Se a coluna já existir, ignorar; outros erros devem ser registrados
    if (!String(error.message).includes('duplicate column name')) {
      console.error('Erro ao garantir colunas de empresa:', error);
    }
  }
}

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

export async function GET(request) {
  try {
    await garantirColunasEmpresa();

    const { searchParams } = new URL(request.url);
    const listarTodas = searchParams.get('all') === 'true';
    const empresaId = searchParams.get('id');

    const sqlBase = `
      SELECT *, COALESCE(logo_url, logo_path) AS logo_path_resolved
      FROM adm_empresa
      ${empresaId ? 'WHERE id = ?' : ''}
      ${listarTodas ? 'ORDER BY COALESCE(padrao, 0) DESC, id ASC' : 'ORDER BY COALESCE(padrao, 0) DESC, id ASC LIMIT 1'}
    `;

    const result = await turso.execute({
      sql: sqlBase,
      args: empresaId ? [empresaId] : []
    });

    if (listarTodas) {
      const empresas = serializeRows(result.rows).map(emp => ({
        ...emp,
        logo_path: emp.logo_path_resolved || emp.logo_path || emp.logo_url || null,
        site: emp.site || emp.website || null,
        padrao: emp.padrao === 1 || emp.padrao === true
      }));
      return Response.json(empresas);
    }

    if (result.rows.length > 0) {
      const empresa = serializeRow(result.rows[0]);
      return Response.json({
        ...empresa,
        logo_path: empresa.logo_path_resolved || empresa.logo_path || empresa.logo_url || null,
        site: empresa.site || empresa.website || null,
        padrao: empresa.padrao === 1 || empresa.padrao === true
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
    await garantirColunasEmpresa();
    const data = await request.json();
    const normalizedData = normalizarDadosEmpresa(data);
    normalizedData.id = normalizedData.id ? Number(normalizedData.id) : null;
    normalizedData.padrao = normalizedData.padrao === true || normalizedData.padrao === 1 || normalizedData.padrao === '1';

    // Se marcar como padrão, remover marcação das demais
    if (normalizedData.padrao) {
      await turso.execute({ sql: `UPDATE adm_empresa SET padrao = 0 WHERE padrao = 1` });
    }

    if (normalizedData.id) {
      // Atualizar empresa existente
      await turso.execute({
        sql: `
          UPDATE adm_empresa
          SET razao_social = ?,
              nome_fantasia = ?,
              cnpj = ?,
              inscricao_estadual = ?,
              inscricao_municipal = ?,
              regime_tributario = ?,
              telefone = ?,
              celular = ?,
              email = ?,
              website = ?,
              endereco = ?,
              numero = ?,
              complemento = ?,
              bairro = ?,
              cidade = ?,
              estado = ?,
              cep = ?,
              logo_url = ?,
              observacoes = ?,
              atualizado_em = CURRENT_TIMESTAMP,
              padrao = ?
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
          normalizedData.padrao ? 1 : 0,
          normalizedData.id
        ]
      });

      return Response.json({ success: true, id: normalizedData.id, action: 'updated' });
    }

    // Inserir nova empresa
    const result = await turso.execute({
      sql: `
        INSERT INTO adm_empresa (
          razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
          regime_tributario, telefone, celular, email, website,
          endereco, numero, complemento, bairro, cidade, estado, cep,
          logo_url,
          observacoes,
          padrao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        normalizedData.padrao ? 1 : 0
      ]
    });

    // Se for padrão, garantir unicidade após inserção
    if (normalizedData.padrao) {
      await turso.execute({
        sql: `UPDATE adm_empresa SET padrao = CASE WHEN id = ? THEN 1 ELSE 0 END`,
        args: [result.lastInsertRowid]
      });
    }

    return Response.json({ success: true, id: Number(result.lastInsertRowid), action: 'created' });
  } catch (error) {
    console.error('Erro ao salvar empresa:', error);
    return Response.json({ error: 'Erro ao salvar dados da empresa: ' + error.message }, { status: 500 });
  }
}
