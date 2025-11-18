// backend/src/seed-database.mjs
import { turso } from "./db.mjs";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando população do banco de dados...\n");

    // 1. CRIAR USUÁRIO ADMINISTRADOR PADRÃO
    console.log("👤 Criando usuário administrador...");
    const senhaHash = await bcrypt.hash("admin123", 10);

    await turso.execute({
      sql: `INSERT INTO adm_usuarios (codigo_unico, username, senha_hash, email, nome_completo, perfil, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "USR001",
        "admin",
        senhaHash,
        "admin@cristalcar.com.br",
        "Administrador do Sistema",
        "ADMINISTRADOR",
        "ATIVO",
      ],
    });
    console.log("✅ Usuário admin criado (senha: admin123)\n");

    // 2. CRIAR PLANO DE CONTAS BÁSICO
    console.log("💰 Criando plano de contas básico...");

    const planoContas = [
      // RECEITAS - Nível 1
      {
        codigo: "1",
        descricao: "RECEITAS",
        tipo: "RECEITA",
        nivel: 1,
        pai: null,
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "1.1",
        descricao: "RECEITAS OPERACIONAIS",
        tipo: "RECEITA",
        nivel: 2,
        pai: "1",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "1.1.1",
        descricao: "VENDAS DE SERVIÇOS",
        tipo: "RECEITA",
        nivel: 3,
        pai: "1.1",
        resultado: 1,
        gasto: null,
        lancamento: 1,
      },
      {
        codigo: "1.1.2",
        descricao: "VENDAS DE PEÇAS",
        tipo: "RECEITA",
        nivel: 3,
        pai: "1.1",
        resultado: 1,
        gasto: null,
        lancamento: 1,
      },
      {
        codigo: "1.1.3",
        descricao: "VENDAS DE PRODUTOS",
        tipo: "RECEITA",
        nivel: 3,
        pai: "1.1",
        resultado: 1,
        gasto: null,
        lancamento: 1,
      },
      {
        codigo: "1.2",
        descricao: "OUTRAS RECEITAS",
        tipo: "RECEITA",
        nivel: 2,
        pai: "1",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "1.2.1",
        descricao: "JUROS RECEBIDOS",
        tipo: "RECEITA",
        nivel: 3,
        pai: "1.2",
        resultado: 1,
        gasto: null,
        lancamento: 1,
      },

      // DESPESAS - Nível 1
      {
        codigo: "2",
        descricao: "DESPESAS",
        tipo: "DESPESA",
        nivel: 1,
        pai: null,
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "2.1",
        descricao: "DESPESAS OPERACIONAIS",
        tipo: "DESPESA",
        nivel: 2,
        pai: "2",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },

      // Despesas com Pessoal
      {
        codigo: "2.1.1",
        descricao: "DESPESAS COM PESSOAL",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.1",
        resultado: 1,
        gasto: "FIXO",
        lancamento: 0,
      },
      {
        codigo: "2.1.1.01",
        descricao: "SALÁRIOS",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.1",
        resultado: 1,
        gasto: "FIXO",
        lancamento: 1,
      },
      {
        codigo: "2.1.1.02",
        descricao: "ENCARGOS SOCIAIS",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.1",
        resultado: 1,
        gasto: "FIXO",
        lancamento: 1,
      },
      {
        codigo: "2.1.1.03",
        descricao: "BENEFÍCIOS",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.1",
        resultado: 1,
        gasto: "FIXO",
        lancamento: 1,
      },

      // Despesas Administrativas
      {
        codigo: "2.1.2",
        descricao: "DESPESAS ADMINISTRATIVAS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.1",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "2.1.2.01",
        descricao: "ALUGUEL",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.2",
        resultado: 1,
        gasto: "FIXO",
        lancamento: 1,
      },
      {
        codigo: "2.1.2.02",
        descricao: "ÁGUA",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.2",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
      {
        codigo: "2.1.2.03",
        descricao: "ENERGIA ELÉTRICA",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.2",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
      {
        codigo: "2.1.2.04",
        descricao: "TELEFONE/INTERNET",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.2",
        resultado: 1,
        gasto: "FIXO",
        lancamento: 1,
      },
      {
        codigo: "2.1.2.05",
        descricao: "MATERIAL DE ESCRITÓRIO",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.2",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },

      // Despesas com Veículos
      {
        codigo: "2.1.3",
        descricao: "DESPESAS COM VEÍCULOS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.1",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "2.1.3.01",
        descricao: "COMBUSTÍVEL",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.3",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
      {
        codigo: "2.1.3.02",
        descricao: "MANUTENÇÃO DE VEÍCULOS",
        tipo: "DESPESA",
        nivel: 4,
        pai: "2.1.3",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },

      // Custos Diretos
      {
        codigo: "2.2",
        descricao: "CUSTOS DIRETOS",
        tipo: "DESPESA",
        nivel: 2,
        pai: "2",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "2.2.1",
        descricao: "CUSTO DE PEÇAS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.2",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
      {
        codigo: "2.2.2",
        descricao: "CUSTO DE PRODUTOS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.2",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },

      // Despesas Financeiras
      {
        codigo: "2.3",
        descricao: "DESPESAS FINANCEIRAS",
        tipo: "DESPESA",
        nivel: 2,
        pai: "2",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "2.3.1",
        descricao: "JUROS PAGOS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.3",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
      {
        codigo: "2.3.2",
        descricao: "TARIFAS BANCÁRIAS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.3",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },

      // Tributos
      {
        codigo: "2.4",
        descricao: "TRIBUTOS",
        tipo: "DESPESA",
        nivel: 2,
        pai: "2",
        resultado: 1,
        gasto: null,
        lancamento: 0,
      },
      {
        codigo: "2.4.1",
        descricao: "IMPOSTOS FEDERAIS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.4",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
      {
        codigo: "2.4.2",
        descricao: "IMPOSTOS ESTADUAIS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.4",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
      {
        codigo: "2.4.3",
        descricao: "IMPOSTOS MUNICIPAIS",
        tipo: "DESPESA",
        nivel: 3,
        pai: "2.4",
        resultado: 1,
        gasto: "VARIAVEL",
        lancamento: 1,
      },
    ];

    // Inserir plano de contas
    const contasIds = {};
    for (const conta of planoContas) {
      const result = await turso.execute({
        sql: `INSERT INTO fin_plano_contas
              (codigo_conta, descricao, tipo, nivel, conta_pai_id, compoe_dre, tipo_gasto, aceita_lancamento, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO')`,
        args: [
          conta.codigo,
          conta.descricao,
          conta.tipo,
          conta.nivel,
          conta.pai ? contasIds[conta.pai] : null,
          conta.resultado,
          conta.gasto,
          conta.lancamento,
        ],
      });
      contasIds[conta.codigo] = result.lastInsertRowid;
    }
    console.log(`✅ ${planoContas.length} contas criadas\n`);

    // 3. CRIAR TIPOS E ESTRUTURAS DO DRE OFICIAL/EBITDA/CUSTEIO
    console.log("📊 Criando estruturas padrão de DRE (Oficial, EBITDA e Custeio)...");

    const tiposDrePadrao = [
      {
        codigo: "DRE-OFICIAL",
        nome: "DRE OFICIAL",
        descricao:
          "Estrutura padrão de DRE conforme legislação contábil brasileira. Ideal para demonstrativos formais.",
      },
      {
        codigo: "DRE-EBITDA",
        nome: "DRE EBITDA",
        descricao:
          "Modelo focado em resultado operacional antes de juros, impostos, depreciação e amortização.",
      },
      {
        codigo: "DRE-CUSTEIO",
        nome: "DRE CUSTEIO VARIAVEL",
        descricao:
          "Estrutura voltada para análise de custos e despesas fixas/variáveis e cálculo de margem de contribuição.",
      },
    ];

    for (const tipo of tiposDrePadrao) {
      await turso.execute({
      sql: `INSERT INTO fin_tipos_dre (codigo, nome, descricao)
              VALUES (?, ?, ?)
              ON CONFLICT(codigo) DO UPDATE SET nome = excluded.nome, descricao = excluded.descricao`,
        args: [tipo.codigo, tipo.nome, tipo.descricao],
      });
    }

    const tiposMap = {};
    const tiposRows = (
      await turso.execute({
      sql: "SELECT id, codigo FROM fin_tipos_dre WHERE codigo IN ('DRE-OFICIAL','DRE-EBITDA','DRE-CUSTEIO')",
      })
    ).rows;
    for (const row of tiposRows) {
      tiposMap[row.codigo] = row.id;
    }

    const estruturasPadrao = [
      {
        tipoCodigo: "DRE-OFICIAL",
        linhas: [
          {
            codigo: "1",
            descricao: "(=) Receita Bruta",
            nivel: 1,
            tipo: "RECEITA_BRUTA",
            ordem: 1,
            formula: null,
            negativo: false,
            negrito: true,
          },
          {
            codigo: "2",
            descricao: "(-) Deduções e Impostos",
            nivel: 1,
            tipo: "DEDUCOES_IMPOSTOS",
            ordem: 2,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "3",
            descricao: "(=) Receita Líquida",
            nivel: 1,
            tipo: "RECEITA_LIQUIDA",
            ordem: 3,
            formula: "1 - 2",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "4",
            descricao: "(-) CPV/CMV",
            nivel: 1,
            tipo: "CPV_CMV",
            ordem: 4,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "5",
            descricao: "(=) Lucro Bruto",
            nivel: 1,
            tipo: "LUCRO_BRUTO",
            ordem: 5,
            formula: "3 - 4",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "6",
            descricao: "(-) Despesas Operacionais",
            nivel: 1,
            tipo: "DESPESAS_OPERACIONAIS",
            ordem: 6,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "7",
            descricao: "(-) Despesas Financeiras",
            nivel: 1,
            tipo: "DESPESAS_FINANCEIRAS",
            ordem: 7,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "8",
            descricao: "(+) Receitas Financeiras",
            nivel: 1,
            tipo: "RECEITAS_FINANCEIRAS",
            ordem: 8,
            formula: null,
            negativo: false,
            negrito: false,
          },
          {
            codigo: "9",
            descricao: "(+) Outras Receitas Operacionais",
            nivel: 1,
            tipo: "OUTRAS_RECEITAS_OPERACIONAIS",
            ordem: 9,
            formula: null,
            negativo: false,
            negrito: false,
          },
          {
            codigo: "10",
            descricao: "(=) Resultado Antes do IRPJ e CSLL",
            nivel: 1,
            tipo: "RESULTADO_ANTES_IRPJ_CSLL",
            ordem: 10,
            formula: "5 - 6 - 7 + 8 + 9",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "11",
            descricao: "(-) IRPJ / CSLL",
            nivel: 1,
            tipo: "IRPJ_CSLL",
            ordem: 11,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "12",
            descricao: "(=) Lucro Líquido do Exercício",
            nivel: 1,
            tipo: "LUCRO_LIQUIDO",
            ordem: 12,
            formula: "10 - 11",
            negativo: false,
            negrito: true,
          },
        ],
      },
      {
        tipoCodigo: "DRE-EBITDA",
        linhas: [
          {
            codigo: "1",
            descricao: "(+) Receita de Vendas",
            nivel: 1,
            tipo: "RECEITA_VENDAS",
            ordem: 1,
            formula: null,
            negativo: false,
            negrito: true,
          },
          {
            codigo: "2",
            descricao: "(-) Deduções e Impostos",
            nivel: 1,
            tipo: "DEDUCOES_IMPOSTOS",
            ordem: 2,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "3",
            descricao: "(=) Receita Líquida",
            nivel: 1,
            tipo: "RECEITA_LIQUIDA",
            ordem: 3,
            formula: "1 - 2",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "4",
            descricao: "(-) Custo Variável (CPV ou CMV)",
            nivel: 1,
            tipo: "CUSTO_VARIAVEL",
            ordem: 4,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "5",
            descricao: "(=) Margem Bruta",
            nivel: 1,
            tipo: "MARGEM_BRUTA",
            ordem: 5,
            formula: "3 - 4",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "6",
            descricao: "(-) Despesas Variáveis",
            nivel: 1,
            tipo: "DESPESAS_VARIAVEIS",
            ordem: 6,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "7",
            descricao: "(=) Margem de Contribuição",
            nivel: 1,
            tipo: "MARGEM_CONTRIBUICAO",
            ordem: 7,
            formula: "5 - 6",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "8",
            descricao: "(-) Gastos com Pessoal",
            nivel: 1,
            tipo: "GASTOS_PESSOAL",
            ordem: 8,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "9",
            descricao: "(-) Despesas Operacionais",
            nivel: 1,
            tipo: "DESPESAS_OPERACIONAIS",
            ordem: 9,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "10",
            descricao: "(=) EBITDA",
            nivel: 1,
            tipo: "EBITDA",
            ordem: 10,
            formula: "7 - 8 - 9",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "11",
            descricao: "(-) Depreciação, Amortização ou Exaustão",
            nivel: 1,
            tipo: "DEPRECIACAO_AMORTIZACAO",
            ordem: 11,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "12",
            descricao: "(-) Outras Receitas e Despesas",
            nivel: 1,
            tipo: "OUTRAS_RECEITAS_DESPESAS",
            ordem: 12,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "13",
            descricao: "(=) Resultado Antes do IRPJ e CSLL",
            nivel: 1,
            tipo: "RESULTADO_ANTES_IRPJ_CSLL",
            ordem: 13,
            formula: "10 - 11 - 12",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "14",
            descricao: "(-) IRPJ e CSLL",
            nivel: 1,
            tipo: "IRPJ_CSLL",
            ordem: 14,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "15",
            descricao: "(=) Resultado Líquido",
            nivel: 1,
            tipo: "RESULTADO_LIQUIDO",
            ordem: 15,
            formula: "13 - 14",
            negativo: false,
            negrito: true,
          },
        ],
      },
      {
        tipoCodigo: "DRE-CUSTEIO",
        linhas: [
          {
            codigo: "1",
            descricao: "Receita de Vendas",
            nivel: 1,
            tipo: "RECEITA_VENDAS",
            ordem: 1,
            formula: null,
            negativo: false,
            negrito: true,
          },
          {
            codigo: "2",
            descricao: "(-) Custos Variáveis",
            nivel: 1,
            tipo: "CUSTOS_VARIAVEIS",
            ordem: 2,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "3",
            descricao: "(-) Despesas Variáveis",
            nivel: 1,
            tipo: "DESPESAS_VARIAVEIS",
            ordem: 3,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "4",
            descricao: "(=) Margem de Contribuição Total",
            nivel: 1,
            tipo: "MARGEM_CONTRIBUICAO",
            ordem: 4,
            formula: "1 - 2 - 3",
            negativo: false,
            negrito: true,
          },
          {
            codigo: "5",
            descricao: "(-) Custos Fixos",
            nivel: 1,
            tipo: "CUSTOS_FIXOS",
            ordem: 5,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "6",
            descricao: "(-) Despesas Fixas",
            nivel: 1,
            tipo: "DESPESAS_FIXAS",
            ordem: 6,
            formula: null,
            negativo: true,
            negrito: false,
          },
          {
            codigo: "7",
            descricao: "(=) Lucro Líquido",
            nivel: 1,
            tipo: "LUCRO_LIQUIDO",
            ordem: 7,
            formula: "4 - 5 - 6",
            negativo: false,
            negrito: true,
          },
        ],
      },
    ];

    for (const estrutura of estruturasPadrao) {
      const tipoId = tiposMap[estrutura.tipoCodigo];
      if (!tipoId) continue;

      await turso.execute({
        sql: "DELETE FROM fin_estrutura_dre WHERE tipo_dre_id = ?",
        args: [tipoId],
      });

      for (const linha of estrutura.linhas) {
        await turso.execute({
          sql: `INSERT INTO fin_estrutura_dre
                (codigo, nome, nivel, tipo_linha, tipo_dre_id, ordem, formula, negativo, editavel)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            linha.codigo,
            linha.descricao,
            linha.nivel,
            linha.tipo,
            tipoId,
            linha.ordem,
            linha.formula,
            linha.negativo,
            1,
          ],
        });
      }
    }
    console.log("✅ Estruturas de DRE padrão cadastradas\n");

    // 4. VINCULAR PLANO DE CONTAS AO DRE
    console.log("🔗 Vinculando plano de contas ao DRE...");

    const dreIds = {};
    const linhasOficiais = (
      await turso.execute({
        sql: "SELECT id, codigo FROM fin_estrutura_dre WHERE tipo_dre_id = ?",
        args: [tiposMap["DRE-OFICIAL"]],
      })
    ).rows;

    for (const linha of linhasOficiais) {
      dreIds[linha.codigo] = linha.id;
    }

    const vinculos = [
      { dre: "1", contas: ["1.1.1", "1.1.2", "1.1.3"] }, // Receita Bruta
      { dre: "4", contas: ["2.2.1", "2.2.2"] }, // CPV/CMV
      { dre: "6", contas: ["2.1.1.01", "2.1.1.02", "2.1.1.03", "2.1.2.01", "2.1.2.02", "2.1.2.03", "2.1.2.04", "2.1.2.05", "2.1.3.01", "2.1.3.02"] }, // Despesas operacionais
      { dre: "7", contas: ["2.3.1", "2.3.2"] }, // Despesas financeiras
      { dre: "8", contas: ["1.2.1"] }, // Receitas financeiras
      { dre: "11", contas: ["2.4.1", "2.4.2", "2.4.3"] }, // IRPJ/CSLL
    ];

    let vinculosCount = 0;
    for (const vinculo of vinculos) {
      for (const codigoConta of vinculo.contas) {
        if (contasIds[codigoConta] && dreIds[vinculo.dre]) {
          await turso.execute({
            sql: `INSERT INTO fin_dre_plano_contas (estrutura_id, plano_contas_id) VALUES (?, ?)`,
            args: [dreIds[vinculo.dre], contasIds[codigoConta]],
          });
          vinculosCount++;
        }
      }
    }
    console.log(`✅ ${vinculosCount} vínculos criados\n`);

    // 5. CRIAR FORMAS DE PAGAMENTO
    console.log("💳 Criando formas de pagamento...");

    const formasPagamento = [
      { descricao: "Dinheiro", tipo: "DINHEIRO", taxa: 0, dias: 0 },
      { descricao: "PIX", tipo: "PIX", taxa: 0, dias: 0 },
      { descricao: "Cartão de Débito", tipo: "CARTAO_DEBITO", taxa: 2.5, dias: 1 },
      {
        descricao: "Cartão de Crédito à Vista",
        tipo: "CARTAO_CREDITO",
        taxa: 3.5,
        dias: 30,
      },
      { descricao: "Boleto Bancário", tipo: "BOLETO", taxa: 3.0, dias: 2 },
      {
        descricao: "Transferência Bancária",
        tipo: "TRANSFERENCIA",
        taxa: 0,
        dias: 1,
      },
    ];

    for (const forma of formasPagamento) {
      await turso.execute({
        sql: `INSERT INTO fin_formas_pagamento (descricao, tipo, taxa_percentual, dias_recebimento, status)
              VALUES (?, ?, ?, ?, 'ATIVO')`,
        args: [forma.descricao, forma.tipo, forma.taxa, forma.dias],
      });
    }
    console.log(`✅ ${formasPagamento.length} formas de pagamento criadas\n`);

    // 6. CRIAR CENTRO DE CUSTO
    console.log("📍 Criando centros de custo...");

    const centrosCusto = [
      { codigo: "CC-001", descricao: "ADMINISTRAÇÃO" },
      { codigo: "CC-002", descricao: "OFICINA" },
      { codigo: "CC-003", descricao: "VENDAS" },
      { codigo: "CC-004", descricao: "FINANCEIRO" },
    ];

    for (const cc of centrosCusto) {
      await turso.execute({
        sql: `INSERT INTO fin_centro_custo (codigo, descricao, status) VALUES (?, ?, 'ATIVO')`,
        args: [cc.codigo, cc.descricao],
      });
    }
    console.log(`✅ ${centrosCusto.length} centros de custo criados\n`);

    // 7. CRIAR BANCO EXEMPLO
    console.log("🏦 Criando banco exemplo...");

    await turso.execute({
      sql: `INSERT INTO fin_bancos
            (codigo_banco, nome_banco, agencia, conta, tipo_conta, saldo_inicial, saldo_atual, data_saldo_inicial, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO')`,
      args: [
        "001",
        "Banco do Brasil",
        "1234-5",
        "12345-6",
        "CORRENTE",
        10000.0,
        10000.0,
        new Date().toISOString().split("T")[0],
      ],
    });
    console.log("✅ Banco exemplo criado\n");

    console.log("=".repeat(60));
    console.log("✅ DATABASE POPULATED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📋 DADOS DE ACESSO:");
    console.log("  Usuário: admin");
    console.log("  Senha: admin123");
    console.log("\n🎉 Sistema pronto para uso!\n");
  } catch (error) {
    console.error("❌ Erro ao popular banco de dados:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Processo concluído!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Processo finalizado com erro:", error);
      process.exit(1);
    });
}

export { seedDatabase };
