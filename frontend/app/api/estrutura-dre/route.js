// frontend/app/api/estrutura-dre/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { normalizarTexto } from "@/lib/text-utils";
import { serializeRows, serializeValue } from "@/lib/db-utils";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirColunaModelo() {
  try {
    await turso.execute(`ALTER TABLE fin_estrutura_dre ADD COLUMN modelo_dre_id INTEGER`);
  } catch (error) {
    if (!error.message.includes("duplicate column name")) {
      throw error;
    }
  }
}

async function garantirColunaEmpresa() {
  const info = await turso.execute('PRAGMA table_info(fin_estrutura_dre)');
  const possuiEmpresa = info.rows?.some((c) => c.name === 'empresa_id');
  if (!possuiEmpresa) {
    await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN empresa_id INTEGER');
    await turso.execute('CREATE INDEX IF NOT EXISTS idx_estrutura_dre_empresa ON fin_estrutura_dre(empresa_id)');
  }
}

async function garantirColunaTipoEstrutura() {
  const info = await turso.execute('PRAGMA table_info(fin_estrutura_dre)');
  const possuiTipoEstrutura = info.rows?.some((c) => c.name === 'tipo_estrutura_id');
  if (!possuiTipoEstrutura) {
    await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN tipo_estrutura_id INTEGER');
    await turso.execute('CREATE INDEX IF NOT EXISTS idx_estrutura_dre_tipo ON fin_estrutura_dre(tipo_estrutura_id)');
  }
}

async function garantirColunaTipoDRE() {
  const info = await turso.execute('PRAGMA table_info(fin_estrutura_dre)');
  const possuiTipoDRE = info.rows?.some((c) => c.name === 'tipo_dre_id');
  if (!possuiTipoDRE) {
    await turso.execute('ALTER TABLE fin_estrutura_dre ADD COLUMN tipo_dre_id INTEGER');
    await turso.execute('CREATE INDEX IF NOT EXISTS idx_estrutura_dre_tipo_dre ON fin_estrutura_dre(tipo_dre_id)');
  }
}

async function garantirModelosPadrao() {
  try {
    // Buscar os 3 tipos de DRE fixos
    const tiposDRE = await turso.execute('SELECT id, codigo FROM fin_tipos_dre WHERE fixo = 1 ORDER BY ordem');

    if (!tiposDRE.rows || tiposDRE.rows.length === 0) return;

    // Buscar tipos de estrutura para mapear códigos para IDs
    const tiposEstrutura = await turso.execute('SELECT id, codigo FROM fin_tipos_estrutura_dre');
    const estruturaMap = {};
    tiposEstrutura.rows?.forEach(row => {
      estruturaMap[row.codigo] = row.id;
    });

    // Verificar se já existem dados para cada tipo
    for (const tipoDRE of tiposDRE.rows) {
      const existentes = await turso.execute({
        sql: 'SELECT COUNT(*) as total FROM fin_estrutura_dre WHERE tipo_dre_id = ?',
        args: [tipoDRE.id]
      });

      if (existentes.rows[0].total > 0) continue; // Já populado

      // Popular estrutura baseado no tipo
      let estruturas = [];

      if (tipoDRE.codigo === 'OFICIAL') {
        estruturas = [
          { codigo: 'OF-01', descricao: 'RECEITA BRUTA', tipo_estrutura_codigo: 'RECEITA_BRUTA', tipo: 'ANALITICA', nivel: 1, ordem: 1 },
          { codigo: 'OF-02', descricao: 'DEDUCOES E IMPOSTOS', tipo_estrutura_codigo: 'DEDUCOES', tipo: 'ANALITICA', nivel: 1, ordem: 2 },
          { codigo: 'OF-03', descricao: 'RECEITA LIQUIDA', tipo_estrutura_codigo: 'RECEITA_LIQUIDA', tipo: 'CALCULADA', nivel: 1, ordem: 3, formula: 'OF-01 - OF-02', negrito: 1 },
          { codigo: 'OF-04', descricao: 'CPV/CMV', tipo_estrutura_codigo: 'CPV', tipo: 'ANALITICA', nivel: 1, ordem: 4 },
          { codigo: 'OF-05', descricao: 'LUCRO BRUTO', tipo_estrutura_codigo: 'LUCRO_BRUTO', tipo: 'CALCULADA', nivel: 1, ordem: 5, formula: 'OF-03 - OF-04', negrito: 1 },
          { codigo: 'OF-06', descricao: 'DESPESAS OPERACIONAIS', tipo_estrutura_codigo: 'DESPESAS_OPERACIONAIS', tipo: 'ANALITICA', nivel: 1, ordem: 6 },
          { codigo: 'OF-07', descricao: 'DESPESAS FINANCEIRAS', tipo_estrutura_codigo: 'DESPESAS_FINANCEIRAS', tipo: 'ANALITICA', nivel: 1, ordem: 7 },
          { codigo: 'OF-08', descricao: 'RECEITAS FINANCEIRAS', tipo_estrutura_codigo: 'RECEITAS_FINANCEIRAS', tipo: 'ANALITICA', nivel: 1, ordem: 8 },
          { codigo: 'OF-09', descricao: 'OUTRAS RECEITAS OPERACIONAIS', tipo_estrutura_codigo: 'OUTRAS_RECEITAS', tipo: 'ANALITICA', nivel: 1, ordem: 9 },
          { codigo: 'OF-10', descricao: 'RESULTADO ANTES DO IRPJ E CSLL', tipo_estrutura_codigo: 'RESULTADO_ANTES_IR', tipo: 'CALCULADA', nivel: 1, ordem: 10, formula: 'OF-05 - OF-06 - OF-07 + OF-08 + OF-09', negrito: 1 },
          { codigo: 'OF-11', descricao: 'IRPJ E CSLL', tipo_estrutura_codigo: 'IR_CSLL', tipo: 'ANALITICA', nivel: 1, ordem: 11 },
          { codigo: 'OF-12', descricao: 'LUCRO LIQUIDO DO EXERCICIO', tipo_estrutura_codigo: 'LUCRO_LIQUIDO', tipo: 'CALCULADA', nivel: 1, ordem: 12, formula: 'OF-10 - OF-11', negrito: 1 },
        ];
      } else if (tipoDRE.codigo === 'EBITDA') {
        estruturas = [
          { codigo: 'EB-01', descricao: 'RECEITA DE VENDAS', tipo_estrutura_codigo: 'RECEITA_VENDAS', tipo: 'ANALITICA', nivel: 1, ordem: 1 },
          { codigo: 'EB-02', descricao: 'DEDUCOES E IMPOSTOS', tipo_estrutura_codigo: 'DEDUCOES', tipo: 'ANALITICA', nivel: 1, ordem: 2 },
          { codigo: 'EB-03', descricao: 'RECEITA LIQUIDA', tipo_estrutura_codigo: 'RECEITA_LIQUIDA', tipo: 'CALCULADA', nivel: 1, ordem: 3, formula: 'EB-01 - EB-02', negrito: 1 },
          { codigo: 'EB-04', descricao: 'CUSTO VARIAVEL (CPV OU CMV)', tipo_estrutura_codigo: 'CPV', tipo: 'ANALITICA', nivel: 1, ordem: 4 },
          { codigo: 'EB-05', descricao: 'MARGEM BRUTA', tipo_estrutura_codigo: 'MARGEM_BRUTA', tipo: 'CALCULADA', nivel: 1, ordem: 5, formula: 'EB-03 - EB-04', negrito: 1 },
          { codigo: 'EB-06', descricao: 'DESPESAS VARIAVEIS', tipo_estrutura_codigo: 'DESPESAS_VARIAVEIS', tipo: 'ANALITICA', nivel: 1, ordem: 6 },
          { codigo: 'EB-07', descricao: 'MARGEM DE CONTRIBUICAO', tipo_estrutura_codigo: 'MARGEM_CONTRIBUICAO', tipo: 'CALCULADA', nivel: 1, ordem: 7, formula: 'EB-05 - EB-06', negrito: 1 },
          { codigo: 'EB-08', descricao: 'GASTOS COM PESSOAL', tipo_estrutura_codigo: 'GASTOS_PESSOAL', tipo: 'ANALITICA', nivel: 1, ordem: 8 },
          { codigo: 'EB-09', descricao: 'DESPESAS OPERACIONAIS', tipo_estrutura_codigo: 'DESPESAS_OPERACIONAIS', tipo: 'ANALITICA', nivel: 1, ordem: 9 },
          { codigo: 'EB-10', descricao: 'EBITDA', tipo_estrutura_codigo: 'EBITDA', tipo: 'CALCULADA', nivel: 1, ordem: 10, formula: 'EB-07 - EB-08 - EB-09', negrito: 1 },
          { codigo: 'EB-11', descricao: 'DEPRECIACAO, AMORTIZACAO OU EXAUSTAO', tipo_estrutura_codigo: 'DEPRECIACAO_AMORTIZACAO', tipo: 'ANALITICA', nivel: 1, ordem: 11 },
          { codigo: 'EB-12', descricao: 'OUTRAS RECEITAS E DESPESAS', tipo_estrutura_codigo: 'OUTRAS_RECEITAS_DESPESAS', tipo: 'ANALITICA', nivel: 1, ordem: 12 },
          { codigo: 'EB-13', descricao: 'RESULTADO ANTES DO IRPJ E CSLL', tipo_estrutura_codigo: 'RESULTADO_ANTES_IR', tipo: 'CALCULADA', nivel: 1, ordem: 13, formula: 'EB-10 - EB-11 + EB-12', negrito: 1 },
          { codigo: 'EB-14', descricao: 'IRPJ E CSLL', tipo_estrutura_codigo: 'IR_CSLL', tipo: 'ANALITICA', nivel: 1, ordem: 14 },
          { codigo: 'EB-15', descricao: 'RESULTADO LIQUIDO', tipo_estrutura_codigo: 'RESULTADO_LIQUIDO', tipo: 'CALCULADA', nivel: 1, ordem: 15, formula: 'EB-13 - EB-14', negrito: 1 },
        ];
      } else if (tipoDRE.codigo === 'CUSTEIO_VARIAVEL') {
        estruturas = [
          { codigo: 'CV-01', descricao: 'RECEITA DE VENDAS', tipo_estrutura_codigo: 'RECEITA_VENDAS', tipo: 'ANALITICA', nivel: 1, ordem: 1 },
          { codigo: 'CV-02', descricao: 'CUSTOS VARIAVEIS', tipo_estrutura_codigo: 'CUSTOS_VARIAVEIS', tipo: 'ANALITICA', nivel: 1, ordem: 2 },
          { codigo: 'CV-03', descricao: 'DESPESAS VARIAVEIS', tipo_estrutura_codigo: 'DESPESAS_VARIAVEIS', tipo: 'ANALITICA', nivel: 1, ordem: 3 },
          { codigo: 'CV-04', descricao: 'MARGEM DE CONTRIBUICAO TOTAL', tipo_estrutura_codigo: 'MARGEM_CONTRIBUICAO_TOTAL', tipo: 'CALCULADA', nivel: 1, ordem: 4, formula: 'CV-01 - CV-02 - CV-03', negrito: 1 },
          { codigo: 'CV-05', descricao: 'CUSTOS FIXOS', tipo_estrutura_codigo: 'CUSTOS_FIXOS', tipo: 'ANALITICA', nivel: 1, ordem: 5 },
          { codigo: 'CV-06', descricao: 'DESPESAS FIXAS', tipo_estrutura_codigo: 'DESPESAS_FIXAS', tipo: 'ANALITICA', nivel: 1, ordem: 6 },
          { codigo: 'CV-07', descricao: 'LUCRO LIQUIDO', tipo_estrutura_codigo: 'LUCRO_LIQUIDO', tipo: 'CALCULADA', nivel: 1, ordem: 7, formula: 'CV-04 - CV-05 - CV-06', negrito: 1 },
        ];
      }

      // Inserir estruturas
      for (const est of estruturas) {
        const tipo_estrutura_id = estruturaMap[est.tipo_estrutura_codigo] || null;

        await turso.execute({
          sql: `INSERT INTO fin_estrutura_dre (codigo, descricao, nivel, tipo, ordem_exibicao, formula, exibir_negativo, negrito, tipo_dre_id, tipo_estrutura_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            est.codigo,
            est.descricao,
            est.nivel,
            est.tipo,
            est.ordem,
            est.formula || null,
            0, // exibir_negativo
            est.negrito || 0,
            tipoDRE.id,
            tipo_estrutura_id
          ]
        });
      }
    }
  } catch (error) {
    console.error('Erro ao garantir modelos padrão:', error);
    // Não lançar erro para não quebrar a aplicação
  }
}

// GET - Listar estrutura do DRE
export async function GET(request) {
  try {
    await garantirColunaModelo();
    await garantirColunaEmpresa();
    await garantirColunaTipoEstrutura();
    await garantirColunaTipoDRE();
    await garantirModelosPadrao(); // Popular os 3 modelos fixos se ainda não existirem

    const { searchParams } = new URL(request.url);
    const modeloId = searchParams.get("modelo_id");
    const empresaId = searchParams.get('empresa_id');
    const tipoDreId = searchParams.get('tipo_dre_id');

    const sql = `
      SELECT * FROM fin_estrutura_dre
      WHERE codigo != '0'
      ${empresaId ? "AND IFNULL(empresa_id, 0) = ?" : ""}
      ${modeloId ? "AND IFNULL(modelo_dre_id, 0) = ?" : ""}
      ${tipoDreId ? "AND IFNULL(tipo_dre_id, 0) = ?" : ""}
      ORDER BY ordem_exibicao
    `;

    const args = [];
    if (empresaId) args.push(Number(empresaId));
    if (modeloId) args.push(modeloId);
    if (tipoDreId) args.push(Number(tipoDreId));

    const result = await turso.execute({ sql, args });

    const dados = serializeRows(result.rows);

    return NextResponse.json({
      success: true,
      data: dados,
      total: dados.length,
    });
  } catch (error) {
    console.error("Erro ao buscar estrutura DRE:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar estrutura DRE: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo item da estrutura DRE
export async function POST(request) {
  try {
    await garantirColunaModelo();
    await garantirColunaEmpresa();
    await garantirColunaTipoEstrutura();
    const dados = await request.json();

    let {
      codigo,
      descricao,
      nivel,
      tipo,
      ordem_exibicao,
      formula,
      exibir_negativo,
      negrito,
      tipo_estrutura_id,
    } = dados;

    // Normalizar texto: MAIÚSCULO sem acentos
    codigo = normalizarTexto(codigo);
    descricao = normalizarTexto(descricao);
    if (tipo) tipo = normalizarTexto(tipo);

    // Validações
    if (!codigo || !descricao || !nivel || !tipo || !ordem_exibicao) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Verificar se código já existe
    const existe = await turso.execute({
      sql: "SELECT id FROM fin_estrutura_dre WHERE codigo = ?",
      args: [codigo],
    });

    if (existe.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Código já existe" },
        { status: 400 }
      );
    }

    console.log('Inserindo estrutura DRE:', {
      codigo,
      descricao,
      tipo,
      nivel,
      ordem_exibicao
    });

    const result = await turso.execute({
      sql: `INSERT INTO fin_estrutura_dre
            (codigo, descricao, nivel, tipo, ordem_exibicao, formula, exibir_negativo, negrito, modelo_dre_id, empresa_id, tipo_estrutura_id, tipo_dre_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ,
      args: [
        codigo,
        descricao,
        nivel,
        tipo,
        ordem_exibicao,
        formula || null,
        exibir_negativo ? 1 : 0,
        negrito ? 1 : 0,
        dados.modelo_dre_id || null,
        dados.empresa_id || null,
        tipo_estrutura_id || null,
        dados.tipo_dre_id || null,
      ],
    });

    console.log('Estrutura DRE criada com ID:', result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      id: serializeValue(result.lastInsertRowid),
      message: "Estrutura DRE criada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar estrutura DRE:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { success: false, error: "Erro ao criar estrutura DRE: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar estrutura DRE
export async function PUT(request) {
  try {
    await garantirColunaModelo();
    await garantirColunaEmpresa();
    await garantirColunaTipoEstrutura();
    const dados = await request.json();
    const { id, ...campos } = dados;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não fornecido" },
        { status: 400 }
      );
    }

    // Normalizar campos de texto
    if (campos.descricao) campos.descricao = normalizarTexto(campos.descricao);
    if (campos.tipo) campos.tipo = normalizarTexto(campos.tipo);

    const updates = [];
    const args = [];

    Object.entries(campos).forEach(([key, value]) => {
      if (
        [
          "descricao",
          "nivel",
          "tipo",
          "ordem_exibicao",
          "formula",
          "exibir_negativo",
          "negrito",
          "modelo_dre_id",
          "empresa_id",
          "tipo_estrutura_id",
        ].includes(key)
      ) {
        updates.push(`${key} = ?`);

        // Converter booleans para INTEGER (0 ou 1)
        if (key === 'exibir_negativo' || key === 'negrito') {
          args.push(value ? 1 : 0);
        } else {
          args.push(value);
        }
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    args.push(id);

    await turso.execute({
      sql: `UPDATE fin_estrutura_dre SET ${updates.join(", ")}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
      args,
    });

    return NextResponse.json({
      success: true,
      message: "Estrutura DRE atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar estrutura DRE:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar estrutura DRE: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir estrutura DRE
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não fornecido" },
        { status: 400 }
      );
    }

    // Verificar se tem vínculos com plano de contas
    const temVinculos = await turso.execute({
      sql: "SELECT COUNT(*) as total FROM fin_dre_plano_contas WHERE estrutura_dre_id = ?",
      args: [id],
    });

    if (temVinculos.rows[0].total > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é possível excluir estrutura com vínculos ao plano de contas",
        },
        { status: 400 }
      );
    }

    // Excluir estrutura
    await turso.execute({
      sql: "DELETE FROM fin_estrutura_dre WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Estrutura DRE excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir estrutura DRE:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir estrutura DRE: " + error.message },
      { status: 500 }
    );
  }
}
