// frontend/app/api/dre-plano-contas/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// GET - Listar vínculos DRE x Plano de Contas
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const estrutura_dre_id = searchParams.get("estrutura_dre_id");

    let sql = `
      SELECT
        dpc.id,
        dpc.estrutura_dre_id,
        dpc.plano_contas_id,
        dpc.criado_em,
        ed.codigo as dre_codigo,
        ed.descricao as dre_descricao,
        pc.codigo_conta,
        pc.descricao as conta_descricao
      FROM fin_dre_plano_contas dpc
      INNER JOIN fin_estrutura_dre ed ON dpc.estrutura_dre_id = ed.id
      INNER JOIN fin_plano_contas pc ON dpc.plano_contas_id = pc.id
      WHERE 1=1
    `;
    const args = [];

    if (estrutura_dre_id) {
      sql += " AND dpc.estrutura_dre_id = ?";
      args.push(estrutura_dre_id);
    }

    sql += " ORDER BY ed.ordem_exibicao, pc.codigo_conta";

    const result = await turso.execute({ sql, args });

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Erro ao buscar vínculos DRE x Plano de Contas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar vínculos: " + error.message
      },
      { status: 500 }
    );
  }
}

// POST - Criar vínculo entre DRE e Plano de Contas
export async function POST(request) {
  try {
    const { estrutura_dre_id, plano_contas_id } = await request.json();

    // Validações
    if (!estrutura_dre_id || !plano_contas_id) {
      return NextResponse.json(
        { success: false, error: "Estrutura DRE e Plano de Contas são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a estrutura DRE existe
    const dreExiste = await turso.execute({
      sql: "SELECT id FROM fin_estrutura_dre WHERE id = ?",
      args: [estrutura_dre_id],
    });

    if (dreExiste.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Estrutura DRE não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o plano de contas existe
    const pcExiste = await turso.execute({
      sql: "SELECT id FROM fin_plano_contas WHERE id = ?",
      args: [plano_contas_id],
    });

    if (pcExiste.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plano de Contas não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o vínculo já existe
    const vinculoExiste = await turso.execute({
      sql: "SELECT id FROM fin_dre_plano_contas WHERE estrutura_dre_id = ? AND plano_contas_id = ?",
      args: [estrutura_dre_id, plano_contas_id],
    });

    if (vinculoExiste.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Vínculo já existe" },
        { status: 400 }
      );
    }

    console.log('Criando vínculo DRE x Plano de Contas:', {
      estrutura_dre_id,
      plano_contas_id
    });

    const result = await turso.execute({
      sql: `INSERT INTO fin_dre_plano_contas
            (estrutura_dre_id, plano_contas_id)
            VALUES (?, ?)`,
      args: [estrutura_dre_id, plano_contas_id],
    });

    console.log('Vínculo criado com ID:', result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: "Vínculo criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar vínculo:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar vínculo: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir vínculo
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

    await turso.execute({
      sql: "DELETE FROM fin_dre_plano_contas WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Vínculo excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir vínculo:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir vínculo: " + error.message },
      { status: 500 }
    );
  }
}
