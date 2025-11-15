// frontend/app/api/relatorios/dre/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// Força a rota a ser dinâmica (não pre-renderizada)
export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        {
          success: false,
          error: "Data de início e fim são obrigatórias",
        },
        { status: 400 }
      );
    }

    // 1. Buscar estrutura do DRE
    const estruturaResult = await turso.execute({
      sql: `SELECT * FROM fin_estrutura_dre ORDER BY ordem_exibicao`,
      args: [],
    });

    const estrutura = estruturaResult.rows;

    // 2. Buscar vinculações DRE x Plano de Contas
    const vinculosResult = await turso.execute({
      sql: `SELECT dpc.estrutura_dre_id, dpc.plano_contas_id, pc.codigo_conta, pc.descricao
            FROM fin_dre_plano_contas dpc
            INNER JOIN fin_plano_contas pc ON dpc.plano_contas_id = pc.id`,
      args: [],
    });

    // Criar mapa de vínculos
    const vinculosPorDre = {};
    vinculosResult.rows.forEach((v) => {
      if (!vinculosPorDre[v.estrutura_dre_id]) {
        vinculosPorDre[v.estrutura_dre_id] = [];
      }
      vinculosPorDre[v.estrutura_dre_id].push(v.plano_contas_id);
    });

    // 3. Buscar movimentações do período
    const movimentacoesResult = await turso.execute({
      sql: `
        SELECT
          m.plano_contas_id,
          m.tipo,
          SUM(m.valor) as total
        FROM mov_financeiro m
        WHERE m.data_competencia BETWEEN ? AND ?
          AND m.status = 'CONFIRMADO'
        GROUP BY m.plano_contas_id, m.tipo
      `,
      args: [dataInicio, dataFim],
    });

    // Criar mapa de valores por conta
    const valoresPorConta = {};
    movimentacoesResult.rows.forEach((m) => {
      valoresPorConta[m.plano_contas_id] = parseFloat(m.total);
    });

    // 4. Calcular valores para cada item do DRE
    const dreCalculado = [];
    const valoresCalculados = {}; // Para armazenar valores de fórmulas

    for (const item of estrutura) {
      let valor = 0;

      if (item.formula) {
        // Item calculado por fórmula
        valor = calcularFormula(item.formula, valoresCalculados);
      } else {
        // Item com contas vinculadas
        const contasVinculadas = vinculosPorDre[item.id] || [];
        valor = contasVinculadas.reduce((sum, contaId) => {
          return sum + (valoresPorConta[contaId] || 0);
        }, 0);
      }

      // Aplicar sinal negativo se necessário
      if (item.exibir_negativo && valor > 0) {
        valor = -valor;
      }

      // Armazenar valor calculado para uso em fórmulas
      valoresCalculados[item.codigo] = valor;

      dreCalculado.push({
        codigo: item.codigo,
        descricao: item.descricao,
        nivel: item.nivel,
        tipo: item.tipo,
        ordem: item.ordem_exibicao,
        valor: valor,
        negrito: Boolean(item.negrito),
        formula: item.formula,
      });
    }

    // 5. Calcular percentuais sobre receita líquida
    const receitaLiquida =
      valoresCalculados["DRE-03"] || valoresCalculados["RECEITA_LIQUIDA"] || 0;

    dreCalculado.forEach((item) => {
      item.percentual =
        receitaLiquida !== 0 ? (item.valor / receitaLiquida) * 100 : 0;
    });

    return NextResponse.json({
      success: true,
      periodo: {
        dataInicio,
        dataFim,
      },
      dre: dreCalculado,
      resumo: {
        receitaBruta: valoresCalculados["DRE-01"] || 0,
        receitaLiquida: valoresCalculados["DRE-03"] || 0,
        lucroBruto: valoresCalculados["DRE-05"] || 0,
        ebitda: valoresCalculados["DRE-07"] || 0,
        resultadoLiquido: valoresCalculados["DRE-12"] || 0,
        margemBruta:
          receitaLiquida !== 0
            ? ((valoresCalculados["DRE-05"] || 0) / receitaLiquida) * 100
            : 0,
        margemOperacional:
          receitaLiquida !== 0
            ? ((valoresCalculados["DRE-07"] || 0) / receitaLiquida) * 100
            : 0,
        margemLiquida:
          receitaLiquida !== 0
            ? ((valoresCalculados["DRE-12"] || 0) / receitaLiquida) * 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar DRE:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao gerar DRE" },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular fórmulas
function calcularFormula(formula, valores) {
  try {
    // Substituir códigos pelos valores
    let formulaCalc = formula;

    Object.entries(valores).forEach(([codigo, valor]) => {
      const regex = new RegExp(codigo.replace(".", "\\."), "g");
      formulaCalc = formulaCalc.replace(regex, valor.toString());
    });

    // Avaliar fórmula matemática simples
    // Remover espaços
    formulaCalc = formulaCalc.replace(/\s/g, "");

    // Avaliar (cuidado com segurança - usar apenas com dados confiáveis)
    // Em produção, considere usar biblioteca específica para parsing de fórmulas
    const resultado = eval(formulaCalc);

    return resultado || 0;
  } catch (error) {
    console.error("Erro ao calcular fórmula:", formula, error);
    return 0;
  }
}
