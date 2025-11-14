// frontend/app/api/relatorios/fluxo-caixa/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const tipo = searchParams.get("tipo") || "realizado"; // realizado, projetado, consolidado
    const bancoId = searchParams.get("bancoId");

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { success: false, error: "Período obrigatório" },
        { status: 400 }
      );
    }

    // 1. SALDO INICIAL
    let saldoInicial = 0;

    if (bancoId) {
      // Saldo de um banco específico
      const bancoResult = await turso.execute({
        sql: `SELECT saldo_inicial, data_saldo_inicial FROM fin_bancos WHERE id = ?`,
        args: [bancoId],
      });

      if (bancoResult.rows.length > 0) {
        const banco = bancoResult.rows[0];
        saldoInicial = parseFloat(banco.saldo_inicial);

        // Buscar movimentações antes do período para calcular saldo inicial
        const movAnterioresResult = await turso.execute({
          sql: `
            SELECT
              SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE -valor END) as saldo
            FROM mov_financeiro
            WHERE banco_id = ?
              AND data_movimento >= ?
              AND data_movimento < ?
              AND status = 'CONFIRMADO'
          `,
          args: [bancoId, banco.data_saldo_inicial, dataInicio],
        });

        if (
          movAnterioresResult.rows.length > 0 &&
          movAnterioresResult.rows[0].saldo
        ) {
          saldoInicial += parseFloat(movAnterioresResult.rows[0].saldo);
        }
      }
    } else {
      // Saldo consolidado de todos os bancos
      const bancosResult = await turso.execute({
        sql: `SELECT SUM(saldo_inicial) as total FROM fin_bancos WHERE status = 'ATIVO'`,
        args: [],
      });

      saldoInicial = bancosResult.rows[0].total
        ? parseFloat(bancosResult.rows[0].total)
        : 0;

      // Movimentações anteriores ao período
      const movAnterioresResult = await turso.execute({
        sql: `
          SELECT
            SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE -valor END) as saldo
          FROM mov_financeiro
          WHERE data_movimento < ?
            AND status = 'CONFIRMADO'
            ${bancoId ? "AND banco_id = ?" : ""}
        `,
        args: bancoId ? [dataInicio, bancoId] : [dataInicio],
      });

      if (
        movAnterioresResult.rows.length > 0 &&
        movAnterioresResult.rows[0].saldo
      ) {
        saldoInicial += parseFloat(movAnterioresResult.rows[0].saldo);
      }
    }

    // 2. MOVIMENTAÇÕES DO PERÍODO (REALIZADAS)
    let sqlMov = `
      SELECT
        m.data_movimento,
        m.tipo,
        m.descricao,
        m.valor,
        m.documento,
        pc.codigo_conta,
        pc.descricao as conta,
        b.nome_banco,
        m.conciliado
      FROM mov_financeiro m
      INNER JOIN fin_plano_contas pc ON m.plano_contas_id = pc.id
      LEFT JOIN fin_bancos b ON m.banco_id = b.id
      WHERE m.data_movimento BETWEEN ? AND ?
        AND m.status = 'CONFIRMADO'
    `;

    const argsMov = [dataInicio, dataFim];

    if (bancoId) {
      sqlMov += " AND m.banco_id = ?";
      argsMov.push(bancoId);
    }

    sqlMov += " ORDER BY m.data_movimento, m.id";

    const movRealizadasResult = await turso.execute({
      sql: sqlMov,
      args: argsMov,
    });

    // 3. CONTAS A RECEBER (PROJETADAS)
    let sqlReceber = `
      SELECT
        c.data_vencimento as data,
        'ENTRADA' as tipo,
        c.descricao,
        c.valor_saldo as valor,
        c.numero_documento as documento,
        cl.nome_fantasia as origem,
        'A Receber' as status
      FROM fat_cobrancas c
      INNER JOIN fat_clientes cl ON c.cliente_id = cl.id
      WHERE c.data_vencimento BETWEEN ? AND ?
        AND c.status IN ('ABERTO', 'PAGO_PARCIAL', 'VENCIDO')
    `;

    const contasReceberResult = await turso.execute({
      sql: sqlReceber,
      args: [dataInicio, dataFim],
    });

    // 4. CONTAS A PAGAR (PROJETADAS)
    let sqlPagar = `
      SELECT
        p.data_vencimento as data,
        'SAIDA' as tipo,
        p.descricao,
        p.valor_saldo as valor,
        p.numero_documento as documento,
        f.nome_fantasia as origem,
        'A Pagar' as status
      FROM com_pagamentos p
      INNER JOIN com_fornecedores f ON p.fornecedor_id = f.id
      WHERE p.data_vencimento BETWEEN ? AND ?
        AND p.status IN ('ABERTO', 'PAGO_PARCIAL', 'VENCIDO')
    `;

    const contasPagarResult = await turso.execute({
      sql: sqlPagar,
      args: [dataInicio, dataFim],
    });

    // 5. CONSOLIDAR DADOS
    const movimentacoes = [];
    let saldoAcumulado = saldoInicial;
    let totalEntradas = 0;
    let totalSaidas = 0;

    // Processar movimentações realizadas
    movRealizadasResult.rows.forEach((mov) => {
      const valor = parseFloat(mov.valor);
      if (mov.tipo === "ENTRADA") {
        saldoAcumulado += valor;
        totalEntradas += valor;
      } else {
        saldoAcumulado -= valor;
        totalSaidas += valor;
      }

      movimentacoes.push({
        data: mov.data_movimento,
        tipo: mov.tipo,
        descricao: mov.descricao,
        documento: mov.documento,
        conta: `${mov.codigo_conta} - ${mov.conta}`,
        banco: mov.nome_banco,
        entrada: mov.tipo === "ENTRADA" ? valor : 0,
        saida: mov.tipo === "SAIDA" ? valor : 0,
        saldo: saldoAcumulado,
        conciliado: Boolean(mov.conciliado),
        origem: "Realizado",
      });
    });

    // Se tipo for projetado ou consolidado, adicionar contas a receber/pagar
    if (tipo === "projetado" || tipo === "consolidado") {
      // Contas a receber
      contasReceberResult.rows.forEach((conta) => {
        const valor = parseFloat(conta.valor);
        saldoAcumulado += valor;

        movimentacoes.push({
          data: conta.data,
          tipo: "ENTRADA",
          descricao: conta.descricao,
          documento: conta.documento,
          conta: conta.origem,
          banco: null,
          entrada: valor,
          saida: 0,
          saldo: saldoAcumulado,
          conciliado: false,
          origem: "Projetado - A Receber",
        });
      });

      // Contas a pagar
      contasPagarResult.rows.forEach((conta) => {
        const valor = parseFloat(conta.valor);
        saldoAcumulado -= valor;

        movimentacoes.push({
          data: conta.data,
          tipo: "SAIDA",
          descricao: conta.descricao,
          documento: conta.documento,
          conta: conta.origem,
          banco: null,
          entrada: 0,
          saida: valor,
          saldo: saldoAcumulado,
          conciliado: false,
          origem: "Projetado - A Pagar",
        });
      });

      // Reordenar por data
      movimentacoes.sort((a, b) => new Date(a.data) - new Date(b.data));

      // Recalcular saldos acumulados
      saldoAcumulado = saldoInicial;
      movimentacoes.forEach((mov) => {
        if (mov.tipo === "ENTRADA") {
          saldoAcumulado += mov.entrada;
        } else {
          saldoAcumulado -= mov.saida;
        }
        mov.saldo = saldoAcumulado;
      });
    }

    // 6. AGRUPAR POR DIA
    const fluxoDiario = {};
    movimentacoes.forEach((mov) => {
      if (!fluxoDiario[mov.data]) {
        fluxoDiario[mov.data] = {
          data: mov.data,
          entradas: 0,
          saidas: 0,
          saldo: 0,
          movimentacoes: [],
        };
      }

      fluxoDiario[mov.data].entradas += mov.entrada;
      fluxoDiario[mov.data].saidas += mov.saida;
      fluxoDiario[mov.data].saldo = mov.saldo;
      fluxoDiario[mov.data].movimentacoes.push(mov);
    });

    return NextResponse.json({
      success: true,
      periodo: {
        dataInicio,
        dataFim,
        tipo,
      },
      resumo: {
        saldoInicial,
        totalEntradas,
        totalSaidas,
        saldoFinal: saldoAcumulado,
        saldoProjetado: tipo !== "realizado" ? saldoAcumulado : null,
      },
      fluxoDiario: Object.values(fluxoDiario).sort(
        (a, b) => new Date(a.data) - new Date(b.data)
      ),
      movimentacoes,
    });
  } catch (error) {
    console.error("Erro ao gerar fluxo de caixa:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao gerar fluxo de caixa" },
      { status: 500 }
    );
  }
}
