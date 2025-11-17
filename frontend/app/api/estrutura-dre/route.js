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

// GET - Listar estrutura do DRE
export async function GET(request) {
  try {
    await garantirColunaModelo();
    await garantirColunaEmpresa();
    await garantirColunaTipoEstrutura();

    const { searchParams } = new URL(request.url);
    const modeloId = searchParams.get("modelo_id");
    const empresaId = searchParams.get('empresa_id');

    const sql = `
      SELECT * FROM fin_estrutura_dre
      WHERE codigo != '0'
      ${empresaId ? "AND IFNULL(empresa_id, 0) = ?" : ""}
      ${modeloId ? "AND IFNULL(modelo_dre_id, 0) = ?" : ""}
      ORDER BY ordem_exibicao
    `;

    const args = [];
    if (empresaId) args.push(Number(empresaId));
    if (modeloId) args.push(modeloId);

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
            (codigo, descricao, nivel, tipo, ordem_exibicao, formula, exibir_negativo, negrito, modelo_dre_id, empresa_id, tipo_estrutura_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
