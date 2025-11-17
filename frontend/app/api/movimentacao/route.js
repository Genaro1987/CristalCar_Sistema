// frontend/app/api/movimentacao/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// GET - Listar movimentações
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const tipo = searchParams.get("tipo"); // ENTRADA ou SAIDA
    const bancoId = searchParams.get("bancoId");
    const status = searchParams.get("status") || "CONFIRMADO";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        m.id,
        m.tipo,
        m.data_movimento,
        m.data_competencia,
        m.descricao,
        m.documento,
        m.valor,
        m.observacoes,
        m.conciliado,
        m.status,
        pc.codigo_conta,
        pc.descricao as conta_descricao,
        b.nome_banco,
        b.conta as conta_bancaria,
        cc.descricao as centro_custo,
        fp.descricao as forma_pagamento,
        m.criado_em
      FROM mov_financeiro m
      INNER JOIN fin_plano_contas pc ON m.plano_contas_id = pc.id
      LEFT JOIN fin_bancos b ON m.banco_id = b.id
      LEFT JOIN fin_centro_custo cc ON m.centro_custo_id = cc.id
      LEFT JOIN fin_formas_pagamento fp ON m.forma_pagamento_id = fp.id
      WHERE 1=1
    `;

    const args = [];

    if (dataInicio) {
      sql += " AND m.data_movimento >= ?";
      args.push(dataInicio);
    }

    if (dataFim) {
      sql += " AND m.data_movimento <= ?";
      args.push(dataFim);
    }

    if (tipo) {
      sql += " AND m.tipo = ?";
      args.push(tipo);
    }

    if (bancoId) {
      sql += " AND m.banco_id = ?";
      args.push(bancoId);
    }

    if (status) {
      sql += " AND m.status = ?";
      args.push(status);
    }

    // Contar total
    const countSql = sql.replace(
      /SELECT[\s\S]*?FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const countResult = await turso.execute({ sql: countSql, args });
    const total = countResult.rows[0].total;

    // Buscar dados paginados
    sql += " ORDER BY m.data_movimento DESC, m.criado_em DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);

    const result = await turso.execute({ sql, args });

    // Calcular totais
    let totalEntradas = 0;
    let totalSaidas = 0;

    result.rows.forEach((row) => {
      if (row.tipo === "ENTRADA") {
        totalEntradas += parseFloat(row.valor);
      } else {
        totalSaidas += parseFloat(row.valor);
      }
    });

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      resumo: {
        totalEntradas,
        totalSaidas,
        saldo: totalEntradas - totalSaidas,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar movimentações" },
      { status: 500 }
    );
  }
}

// POST - Criar movimentação
export async function POST(request) {
  try {
    const dados = await request.json();

    const {
      tipo,
      data_movimento,
      data_competencia,
      plano_contas_id,
      centro_custo_id,
      banco_id,
      forma_pagamento_id,
      descricao,
      documento,
      valor,
      observacoes,
      usuario_id,
    } = dados;

    // Validações
    if (
      !tipo ||
      !data_movimento ||
      !data_competencia ||
      !plano_contas_id ||
      !descricao ||
      !valor
    ) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    if (!["ENTRADA", "SAIDA"].includes(tipo)) {
      return NextResponse.json(
        { success: false, error: "Tipo inválido" },
        { status: 400 }
      );
    }

    const result = await turso.execute({
      sql: `INSERT INTO mov_financeiro
            (tipo, data_movimento, data_competencia, plano_contas_id, centro_custo_id, banco_id, forma_pagamento_id,
             descricao, documento, valor, observacoes, origem, usuario_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MANUAL', ?, 'CONFIRMADO')`,
      args: [
        tipo,
        data_movimento,
        data_competencia,
        plano_contas_id,
        centro_custo_id || null,
        banco_id || null,
        forma_pagamento_id || null,
        descricao,
        documento || null,
        valor,
        observacoes || null,
        usuario_id || null,
      ],
    });

    // Atualizar saldo do banco se informado
    if (banco_id) {
      const operacao = tipo === "ENTRADA" ? "+" : "-";
      await turso.execute({
        sql: `UPDATE fin_bancos
              SET saldo_atual = saldo_atual ${operacao} ?, atualizado_em = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [valor, banco_id],
      });
    }

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: "Movimentação criada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar movimentação" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar movimentação
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

    // Buscar movimentação atual
    const movAtual = await turso.execute({
      sql: "SELECT * FROM mov_financeiro WHERE id = ?",
      args: [id],
    });

    if (movAtual.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Movimentação não encontrada" },
        { status: 404 }
      );
    }

    const mov = movAtual.rows[0];

    // Reverter saldo do banco anterior
    if (mov.banco_id) {
      const operacao = mov.tipo === "ENTRADA" ? "-" : "+";
      await turso.execute({
        sql: `UPDATE fin_bancos SET saldo_atual = saldo_atual ${operacao} ? WHERE id = ?`,
        args: [mov.valor, mov.banco_id],
      });
    }

    // Atualizar movimentação
    const updates = [];
    const args = [];

    Object.entries(campos).forEach(([key, value]) => {
      if (
        [
          "data_movimento",
          "data_competencia",
          "plano_contas_id",
          "centro_custo_id",
          "banco_id",
          "forma_pagamento_id",
          "descricao",
          "documento",
          "valor",
          "observacoes",
          "conciliado",
        ].includes(key)
      ) {
        updates.push(`${key} = ?`);
        args.push(value);
      }
    });

    args.push(id);

    await turso.execute({
      sql: `UPDATE mov_financeiro SET ${updates.join(", ")}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
      args,
    });

    // Aplicar novo saldo ao banco
    const novoValor = campos.valor || mov.valor;
    const novoBancoId = campos.banco_id || mov.banco_id;

    if (novoBancoId) {
      const operacao = mov.tipo === "ENTRADA" ? "+" : "-";
      await turso.execute({
        sql: `UPDATE fin_bancos SET saldo_atual = saldo_atual ${operacao} ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [novoValor, novoBancoId],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Movimentação atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar movimentação:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar movimentação" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir movimentação
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

    // Buscar movimentação
    const result = await turso.execute({
      sql: "SELECT * FROM mov_financeiro WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Movimentação não encontrada" },
        { status: 404 }
      );
    }

    const mov = result.rows[0];

    // Reverter saldo do banco
    if (mov.banco_id) {
      const operacao = mov.tipo === "ENTRADA" ? "-" : "+";
      await turso.execute({
        sql: `UPDATE fin_bancos SET saldo_atual = saldo_atual ${operacao} ? WHERE id = ?`,
        args: [mov.valor, mov.banco_id],
      });
    }

    // Excluir movimentação
    await turso.execute({
      sql: "UPDATE mov_financeiro SET status = 'CANCELADO', atualizado_em = CURRENT_TIMESTAMP WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Movimentação cancelada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cancelar movimentação:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao cancelar movimentação" },
      { status: 500 }
    );
  }
}
