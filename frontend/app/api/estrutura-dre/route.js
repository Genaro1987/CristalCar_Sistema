// frontend/app/api/estrutura-dre/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { normalizarTexto } from "@/lib/text-utils";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// GET - Listar estrutura DRE
export async function GET(request) {
  try {
    const sql = `
      SELECT *
      FROM fin_estrutura_dre
      ORDER BY ordem_exibicao
    `;

    const result = await turso.execute({ sql, args: [] });

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Erro ao buscar estrutura DRE:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar estrutura DRE" },
      { status: 500 }
    );
  }
}

// POST - Criar novo item
export async function POST(request) {
  try {
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
    } = dados;

    // Normalizar texto: MAIÚSCULO sem acentos
    descricao = normalizarTexto(descricao);
    tipo = normalizarTexto(tipo);

    // Validações
    if (!codigo || !descricao || !tipo) {
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

    // Se ordem_exibicao não fornecida, usar a próxima disponível
    if (!ordem_exibicao) {
      const maxOrdem = await turso.execute({
        sql: "SELECT COALESCE(MAX(ordem_exibicao), 0) as max_ordem FROM fin_estrutura_dre",
        args: [],
      });
      ordem_exibicao = (maxOrdem.rows[0]?.max_ordem || 0) + 1;
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
            (codigo, descricao, nivel, tipo, ordem_exibicao, formula, exibir_negativo, negrito)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codigo,
        descricao,
        nivel || 1,
        tipo,
        ordem_exibicao,
        formula || null,
        exibir_negativo ? 1 : 0,
        negrito ? 1 : 0,
      ],
    });

    console.log('Item DRE criado com ID:', result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: "Item DRE criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar item DRE:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { success: false, error: "Erro ao criar item DRE: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar item
export async function PUT(request) {
  try {
    const dados = await request.json();
    const { id, ...campos } = dados;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não fornecido" },
        { status: 400 }
      );
    }

    const updates = [];
    const args = [];

    // Normalizar campos de texto se fornecidos
    if (campos.descricao) {
      campos.descricao = normalizarTexto(campos.descricao);
    }
    if (campos.tipo) {
      campos.tipo = normalizarTexto(campos.tipo);
    }

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
        ].includes(key)
      ) {
        updates.push(`${key} = ?`);
        args.push(value);
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
      message: "Item DRE atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar item DRE:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar item DRE" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir item
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

    // Excluir item
    await turso.execute({
      sql: "DELETE FROM fin_estrutura_dre WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Item DRE excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir item DRE:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir item DRE" },
      { status: 500 }
    );
  }
}
