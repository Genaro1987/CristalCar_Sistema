import { createClient } from '@libsql/client';
import { normalizarTexto } from '@/lib/text-utils';
import { serializeRows, serializeValue } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirTabelasXMLNFe() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS imp_nfe_xml (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(20) UNIQUE NOT NULL,
      empresa_id INTEGER,
      numero_nfe VARCHAR(50),
      serie VARCHAR(10),
      chave_acesso VARCHAR(50),
      fornecedor_cnpj VARCHAR(18),
      fornecedor_nome VARCHAR(200),
      data_emissao DATE,
      valor_total DECIMAL(15,2),
      valor_produtos DECIMAL(15,2),
      valor_impostos DECIMAL(15,2),
      parceiro_id INTEGER,
      parceiro_criado BOOLEAN DEFAULT 0,
      status VARCHAR(20) DEFAULT 'IMPORTADO',
      xml_conteudo TEXT,
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parceiro_id) REFERENCES par_parceiros(id)
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS imp_nfe_produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nfe_id INTEGER NOT NULL,
      codigo_produto VARCHAR(50),
      descricao TEXT,
      ncm VARCHAR(10),
      cfop VARCHAR(10),
      unidade VARCHAR(10),
      quantidade DECIMAL(15,4),
      valor_unitario DECIMAL(15,2),
      valor_total DECIMAL(15,2),
      FOREIGN KEY (nfe_id) REFERENCES imp_nfe_xml(id) ON DELETE CASCADE
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS imp_nfe_impostos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nfe_id INTEGER NOT NULL,
      tipo_imposto VARCHAR(20),
      base_calculo DECIMAL(15,2),
      aliquota DECIMAL(10,4),
      valor DECIMAL(15,2),
      FOREIGN KEY (nfe_id) REFERENCES imp_nfe_xml(id) ON DELETE CASCADE
    )
  `);
}

async function buscarOuCriarParceiro(cnpj, razaoSocial, data) {
  // Buscar parceiro existente
  const existente = await turso.execute({
    sql: 'SELECT id FROM par_parceiros WHERE cnpj_cpf = ?',
    args: [cnpj]
  });

  if (existente.rows.length > 0) {
    return { id: existente.rows[0].id, criado: false };
  }

  // Criar novo parceiro
  const codigo = `PARC-${Date.now()}`;
  const nome = normalizarTexto(razaoSocial);

  const result = await turso.execute({
    sql: `INSERT INTO par_parceiros
          (codigo, tipo, cnpj_cpf, razao_social, nome_fantasia, status, criado_em)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    args: [
      codigo,
      'FORNECEDOR',
      cnpj,
      nome,
      nome,
      'ATIVO'
    ]
  });

  return { id: serializeValue(result.lastInsertRowid), criado: true };
}

export async function GET(request) {
  try {
    await garantirTabelasXMLNFe();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const nfeId = searchParams.get('nfe_id');

    if (nfeId) {
      // Buscar detalhes da NF-e
      const nfe = await turso.execute({
        sql: `SELECT n.*, p.razao_social as fornecedor
              FROM imp_nfe_xml n
              LEFT JOIN par_parceiros p ON p.id = n.parceiro_id
              WHERE n.id = ?`,
        args: [Number(nfeId)]
      });

      if (nfe.rows.length === 0) {
        return Response.json({ error: 'NF-e não encontrada' }, { status: 404 });
      }

      const produtos = await turso.execute({
        sql: 'SELECT * FROM imp_nfe_produtos WHERE nfe_id = ?',
        args: [Number(nfeId)]
      });

      const impostos = await turso.execute({
        sql: 'SELECT * FROM imp_nfe_impostos WHERE nfe_id = ?',
        args: [Number(nfeId)]
      });

      return Response.json({
        ...serializeRows(nfe.rows)[0],
        produtos: serializeRows(produtos.rows),
        impostos: serializeRows(impostos.rows)
      });
    }

    // Listar NF-es
    let sql = `
      SELECT n.*, p.razao_social as fornecedor
      FROM imp_nfe_xml n
      LEFT JOIN par_parceiros p ON p.id = n.parceiro_id
      WHERE 1=1
    `;
    const args = [];

    if (empresaId) {
      sql += ' AND (n.empresa_id = ? OR n.empresa_id IS NULL)';
      args.push(Number(empresaId));
    }

    sql += ' ORDER BY n.data_emissao DESC, n.criado_em DESC LIMIT 100';

    const result = args.length > 0
      ? await turso.execute({ sql, args })
      : await turso.execute(sql);

    return Response.json(serializeRows(result.rows));
  } catch (error) {
    console.error('Erro ao buscar NF-es:', error);
    return Response.json({ error: 'Erro ao buscar NF-es' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await garantirTabelasXMLNFe();
    const data = await request.json();

    if (!data.numero_nfe || !data.fornecedor_cnpj) {
      return Response.json({
        error: 'Campos obrigatórios: numero_nfe, fornecedor_cnpj'
      }, { status: 400 });
    }

    // Buscar ou criar parceiro
    const parceiro = await buscarOuCriarParceiro(
      data.fornecedor_cnpj,
      data.fornecedor_nome || 'FORNECEDOR',
      data
    );

    // Gerar código
    const ultimoCodigo = await turso.execute(`
      SELECT codigo FROM imp_nfe_xml
      WHERE codigo LIKE 'NFE-%'
      ORDER BY codigo DESC LIMIT 1
    `);

    let codigo;
    if (ultimoCodigo.rows.length > 0) {
      const ultimoNumero = parseInt(ultimoCodigo.rows[0].codigo.split('-')[1]) || 0;
      codigo = `NFE-${String(ultimoNumero + 1).padStart(5, '0')}`;
    } else {
      codigo = 'NFE-00001';
    }

    // Inserir NF-e
    const result = await turso.execute({
      sql: `INSERT INTO imp_nfe_xml
            (codigo, empresa_id, numero_nfe, serie, chave_acesso,
             fornecedor_cnpj, fornecedor_nome, data_emissao,
             valor_total, valor_produtos, valor_impostos,
             parceiro_id, parceiro_criado, status, xml_conteudo, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        data.empresa_id || null,
        data.numero_nfe,
        data.serie || '1',
        data.chave_acesso || null,
        data.fornecedor_cnpj,
        normalizarTexto(data.fornecedor_nome || ''),
        data.data_emissao || new Date().toISOString().split('T')[0],
        data.valor_total || 0,
        data.valor_produtos || 0,
        data.valor_impostos || 0,
        parceiro.id,
        parceiro.criado ? 1 : 0,
        'IMPORTADO',
        data.xml_conteudo || null,
        data.observacoes || null
      ]
    });

    const nfeId = serializeValue(result.lastInsertRowid);

    // Inserir produtos
    if (data.produtos && Array.isArray(data.produtos)) {
      for (const produto of data.produtos) {
        await turso.execute({
          sql: `INSERT INTO imp_nfe_produtos
                (nfe_id, codigo_produto, descricao, ncm, cfop, unidade, quantidade, valor_unitario, valor_total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            nfeId,
            produto.codigo || null,
            normalizarTexto(produto.descricao || ''),
            produto.ncm || null,
            produto.cfop || null,
            produto.unidade || 'UN',
            produto.quantidade || 0,
            produto.valor_unitario || 0,
            produto.valor_total || 0
          ]
        });
      }
    }

    // Inserir impostos
    if (data.impostos && Array.isArray(data.impostos)) {
      for (const imposto of data.impostos) {
        await turso.execute({
          sql: `INSERT INTO imp_nfe_impostos
                (nfe_id, tipo_imposto, base_calculo, aliquota, valor)
                VALUES (?, ?, ?, ?, ?)`,
          args: [
            nfeId,
            imposto.tipo || 'ICMS',
            imposto.base_calculo || 0,
            imposto.aliquota || 0,
            imposto.valor || 0
          ]
        });
      }
    }

    return Response.json({
      success: true,
      id: nfeId,
      codigo: codigo,
      parceiro_criado: parceiro.criado,
      parceiro_id: parceiro.id
    });
  } catch (error) {
    console.error('Erro ao importar NF-e:', error);
    return Response.json({ error: 'Erro ao importar NF-e: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM imp_nfe_xml WHERE id = ?',
      args: [id]
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir NF-e:', error);
    return Response.json({ error: 'Erro ao excluir NF-e: ' + error.message }, { status: 500 });
  }
}
