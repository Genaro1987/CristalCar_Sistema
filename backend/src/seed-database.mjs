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
              (codigo_conta, descricao, tipo, nivel, conta_pai_id, considera_resultado, tipo_gasto, aceita_lancamento, status)
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

    // 3. CRIAR ESTRUTURA DO DRE
    console.log("📊 Criando estrutura do DRE...");

    const estruturaDre = [
      {
        codigo: "DRE-01",
        descricao: "RECEITA OPERACIONAL BRUTA",
        nivel: 1,
        tipo: "RECEITA_BRUTA",
        ordem: 1,
        formula: null,
        negativo: false,
        negrito: true,
      },
      {
        codigo: "DRE-02",
        descricao: "(-) DEDUÇÕES DA RECEITA",
        nivel: 1,
        tipo: "DEDUCOES",
        ordem: 2,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-03",
        descricao: "(=) RECEITA OPERACIONAL LÍQUIDA",
        nivel: 1,
        tipo: "RECEITA_LIQUIDA",
        ordem: 3,
        formula: "DRE-01 - DRE-02",
        negativo: false,
        negrito: true,
      },
      {
        codigo: "DRE-04",
        descricao: "(-) CUSTOS DIRETOS",
        nivel: 1,
        tipo: "CUSTOS_DIRETOS",
        ordem: 4,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-05",
        descricao: "(=) LUCRO BRUTO",
        nivel: 1,
        tipo: "LUCRO_BRUTO",
        ordem: 5,
        formula: "DRE-03 - DRE-04",
        negativo: false,
        negrito: true,
      },
      {
        codigo: "DRE-06",
        descricao: "(-) DESPESAS OPERACIONAIS",
        nivel: 1,
        tipo: "DESPESAS_OPERACIONAIS",
        ordem: 6,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-06.1",
        descricao: "Despesas com Pessoal",
        nivel: 2,
        tipo: "DESPESAS_PESSOAL",
        ordem: 7,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-06.2",
        descricao: "Despesas Administrativas",
        nivel: 2,
        tipo: "DESPESAS_ADMINISTRATIVAS",
        ordem: 8,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-06.3",
        descricao: "Despesas com Veículos",
        nivel: 2,
        tipo: "DESPESAS_VEICULOS",
        ordem: 9,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-07",
        descricao: "(=) RESULTADO OPERACIONAL (EBITDA)",
        nivel: 1,
        tipo: "EBITDA",
        ordem: 10,
        formula: "DRE-05 - DRE-06",
        negativo: false,
        negrito: true,
      },
      {
        codigo: "DRE-08",
        descricao: "(-) DESPESAS FINANCEIRAS",
        nivel: 1,
        tipo: "DESPESAS_FINANCEIRAS",
        ordem: 11,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-09",
        descricao: "(+) RECEITAS FINANCEIRAS",
        nivel: 1,
        tipo: "RECEITAS_FINANCEIRAS",
        ordem: 12,
        formula: null,
        negativo: false,
        negrito: false,
      },
      {
        codigo: "DRE-10",
        descricao: "(=) RESULTADO ANTES DOS TRIBUTOS",
        nivel: 1,
        tipo: "RESULTADO_ANTES_TRIBUTOS",
        ordem: 13,
        formula: "DRE-07 - DRE-08 + DRE-09",
        negativo: false,
        negrito: true,
      },
      {
        codigo: "DRE-11",
        descricao: "(-) TRIBUTOS",
        nivel: 1,
        tipo: "TRIBUTOS",
        ordem: 14,
        formula: null,
        negativo: true,
        negrito: false,
      },
      {
        codigo: "DRE-12",
        descricao: "(=) RESULTADO LÍQUIDO",
        nivel: 1,
        tipo: "RESULTADO_LIQUIDO",
        ordem: 15,
        formula: "DRE-10 - DRE-11",
        negativo: false,
        negrito: true,
      },
    ];

    const dreIds = {};
    for (const item of estruturaDre) {
      const result = await turso.execute({
        sql: `INSERT INTO fin_estrutura_dre
              (codigo, descricao, nivel, tipo, ordem_exibicao, formula, exibir_negativo, negrito)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.codigo,
          item.descricao,
          item.nivel,
          item.tipo,
          item.ordem,
          item.formula,
          item.negativo ? 1 : 0,
          item.negrito ? 1 : 0,
        ],
      });
      dreIds[item.codigo] = result.lastInsertRowid;
    }
    console.log(`✅ ${estruturaDre.length} itens da estrutura DRE criados\n`);

    // 4. VINCULAR PLANO DE CONTAS AO DRE
    console.log("🔗 Vinculando plano de contas ao DRE...");

    const vinculos = [
      { dre: "DRE-01", contas: ["1.1.1", "1.1.2", "1.1.3"] }, // Receitas operacionais
      { dre: "DRE-04", contas: ["2.2.1", "2.2.2"] }, // Custos diretos
      { dre: "DRE-06.1", contas: ["2.1.1.01", "2.1.1.02", "2.1.1.03"] }, // Despesas pessoal
      {
        dre: "DRE-06.2",
        contas: ["2.1.2.01", "2.1.2.02", "2.1.2.03", "2.1.2.04", "2.1.2.05"],
      }, // Despesas adm
      { dre: "DRE-06.3", contas: ["2.1.3.01", "2.1.3.02"] }, // Despesas veículos
      { dre: "DRE-08", contas: ["2.3.1", "2.3.2"] }, // Despesas financeiras
      { dre: "DRE-09", contas: ["1.2.1"] }, // Receitas financeiras
      { dre: "DRE-11", contas: ["2.4.1", "2.4.2", "2.4.3"] }, // Tributos
    ];

    let vinculosCount = 0;
    for (const vinculo of vinculos) {
      for (const codigoConta of vinculo.contas) {
        if (contasIds[codigoConta] && dreIds[vinculo.dre]) {
          await turso.execute({
            sql: `INSERT INTO fin_dre_plano_contas (estrutura_dre_id, plano_contas_id) VALUES (?, ?)`,
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
