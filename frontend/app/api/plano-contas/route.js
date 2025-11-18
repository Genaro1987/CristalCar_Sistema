// frontend/app/api/plano-contas/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { normalizarTexto } from "@/lib/text-utils";

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function garantirColunasNecessarias() {
  const info = await turso.execute('PRAGMA table_info(fin_plano_contas)');
  const colunas = info.rows || [];

  // Garantir coluna empresa_id
  const possuiEmpresa = colunas.some((c) => c.name === 'empresa_id');
  if (!possuiEmpresa) {
    await turso.execute('ALTER TABLE fin_plano_contas ADD COLUMN empresa_id INTEGER');
    await turso.execute('CREATE INDEX IF NOT EXISTS idx_plano_contas_empresa ON fin_plano_contas(empresa_id)');
  }

  // Garantir coluna compoe_dre (o schema pode ter considera_resultado)
  const possuiCompoeDre = colunas.some((c) => c.name === 'compoe_dre');
  const possuiConsideraResultado = colunas.some((c) => c.name === 'considera_resultado');

  if (!possuiCompoeDre && !possuiConsideraResultado) {
    // Nenhuma das duas existe, criar compoe_dre
    await turso.execute('ALTER TABLE fin_plano_contas ADD COLUMN compoe_dre BOOLEAN DEFAULT 1');
  } else if (!possuiCompoeDre && possuiConsideraResultado) {
    // Existe considera_resultado mas não compoe_dre, criar alias/copiar
    await turso.execute('ALTER TABLE fin_plano_contas ADD COLUMN compoe_dre BOOLEAN DEFAULT 1');
    await turso.execute('UPDATE fin_plano_contas SET compoe_dre = considera_resultado WHERE compoe_dre IS NULL');
  }
}

// GET - Listar plano de contas
export async function GET(request) {
  try {
    await garantirColunasNecessarias();
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo"); // RECEITA ou DESPESA
    const apenasLancaveis = searchParams.get("lancaveis") === "true";
    const utilizadoObjetivo = searchParams.get("utilizado_objetivo");
    const status = searchParams.get("status") || "ATIVO";
    const empresaId = searchParams.get('empresa_id');

    let sql = `
      SELECT
        pc.id,
        pc.codigo_conta,
        pc.descricao,
        pc.tipo,
        pc.nivel,
        pc.conta_pai_id,
        pc.compoe_dre,
        pc.compoe_dre as considera_resultado,
        pc.tipo_gasto,
        pc.utilizado_objetivo,
        pc.aceita_lancamento,
        pc.status,
        pc.empresa_id,
        pai.codigo_conta as codigo_pai,
        pai.descricao as descricao_pai
      FROM fin_plano_contas pc
      LEFT JOIN fin_plano_contas pai ON pc.conta_pai_id = pai.id
      WHERE 1=1
    `;

    const args = [];

    if (tipo) {
      sql += " AND pc.tipo = ?";
      args.push(tipo);
    }

    if (apenasLancaveis) {
      sql += " AND pc.aceita_lancamento = 1";
    }

    if (utilizadoObjetivo === "true" || utilizadoObjetivo === "1") {
      sql += " AND pc.utilizado_objetivo = 1";
    }

    if (status) {
      sql += " AND pc.status = ?";
      args.push(status);
    }

    if (empresaId) {
      sql += " AND IFNULL(pc.empresa_id, 0) = ?";
      args.push(Number(empresaId));
    }

    sql += " ORDER BY pc.codigo_conta";

    const result = await turso.execute({ sql, args });

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Erro ao buscar plano de contas:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar plano de contas" },
      { status: 500 }
    );
  }
}

// POST - Criar nova conta
export async function POST(request) {
  try {
    await garantirColunasNecessarias();
    const dados = await request.json();

    let {
      codigo_conta,
      descricao,
      tipo,
      nivel,
      conta_pai_id,
      considera_resultado,
      tipo_gasto,
      utilizado_objetivo,
      aceita_lancamento,
    } = dados;

    const compoeDre = considera_resultado ?? dados.compoe_dre ?? true;

    // Normalizar texto: MAIÚSCULO sem acentos
    descricao = normalizarTexto(descricao);
    tipo = normalizarTexto(tipo);
    if (tipo_gasto) tipo_gasto = normalizarTexto(tipo_gasto);

    // Validações
    if (!codigo_conta || !descricao || !tipo || !nivel) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Verificar se código já existe
    const existe = await turso.execute({
      sql: "SELECT id FROM fin_plano_contas WHERE codigo_conta = ? AND IFNULL(empresa_id, 0) = IFNULL(?, 0)",
      args: [codigo_conta, dados.empresa_id || null],
    });

    if (existe.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Código de conta já existe" },
        { status: 400 }
      );
    }

    console.log('Inserindo plano de contas:', {
      codigo_conta,
      descricao,
      tipo,
      nivel,
      conta_pai_id: conta_pai_id || null
    });

    const result = await turso.execute({
      sql: `INSERT INTO fin_plano_contas
            (codigo_conta, descricao, tipo, nivel, conta_pai_id, compoe_dre, tipo_gasto, utilizado_objetivo, aceita_lancamento, status, empresa_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO', ?)` ,
      args: [
        codigo_conta,
        descricao,
        tipo,
        nivel,
        conta_pai_id || null,
        compoeDre ? 1 : 0,
        tipo_gasto || null,
        utilizado_objetivo ? 1 : 0,
        aceita_lancamento ? 1 : 0,
        dados.empresa_id || null,
      ],
    });

    console.log('Conta criada com ID:', result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      id: Number(result.lastInsertRowid),
      message: "Conta criada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { success: false, error: "Erro ao criar conta: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar conta
export async function PUT(request) {
  try {
    await garantirColunasNecessarias();
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

    const mapeamentos = {
      considera_resultado: "compoe_dre",
      compoe_dre: "compoe_dre",
      descricao: "descricao",
      tipo_gasto: "tipo_gasto",
      utilizado_objetivo: "utilizado_objetivo",
      aceita_lancamento: "aceita_lancamento",
      status: "status",
      empresa_id: "empresa_id",
    };

    Object.entries(campos).forEach(([key, value]) => {
      const coluna = mapeamentos[key];
      if (coluna) {
        updates.push(`${coluna} = ?`);
        if (["compoe_dre", "utilizado_objetivo", "aceita_lancamento"].includes(coluna)) {
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
      sql: `UPDATE fin_plano_contas SET ${updates.join(", ")}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
      args,
    });

    return NextResponse.json({
      success: true,
      message: "Conta atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar conta" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir conta permanentemente
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    console.log('[API DELETE Plano Contas] ID recebido:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não fornecido" },
        { status: 400 }
      );
    }

    // Verificar se tem lançamentos
    const temLancamentos = await turso.execute({
      sql: "SELECT COUNT(*) as total FROM mov_financeiro WHERE plano_contas_id = ?",
      args: [id],
    });

    console.log('[API DELETE Plano Contas] Lançamentos encontrados:', temLancamentos.rows[0].total);

    if (temLancamentos.rows[0].total > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é possível excluir conta com lançamentos associados",
        },
        { status: 400 }
      );
    }

    // Verificar se tem contas filhas
    const temFilhas = await turso.execute({
      sql: "SELECT COUNT(*) as total FROM fin_plano_contas WHERE conta_pai_id = ?",
      args: [id],
    });

    console.log('[API DELETE Plano Contas] Contas filhas encontradas:', temFilhas.rows[0].total);

    if (temFilhas.rows[0].total > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é possível excluir conta que possui contas filhas",
        },
        { status: 400 }
      );
    }

    // Excluir vínculos com DRE antes de deletar a conta
    await turso.execute({
      sql: "DELETE FROM fin_dre_plano_contas WHERE plano_contas_id = ?",
      args: [id],
    });

    console.log('[API DELETE Plano Contas] Vínculos DRE removidos');

    // Excluir conta permanentemente
    const result = await turso.execute({
      sql: "DELETE FROM fin_plano_contas WHERE id = ?",
      args: [id],
    });

    console.log('[API DELETE Plano Contas] Conta excluída permanentemente. Rows affected:', result.rowsAffected);

    return NextResponse.json({
      success: true,
      message: "Conta excluída com sucesso",
      id: Number(id)
    });
  } catch (error) {
    console.error("[API DELETE Plano Contas] Erro ao excluir conta:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir conta: " + error.message },
      { status: 500 }
    );
  }
}
