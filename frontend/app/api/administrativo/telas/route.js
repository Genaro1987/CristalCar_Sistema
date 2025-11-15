import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Telas do sistema
const telasDoSistema = [
  // ADMINISTRATIVO
  { codigo_tela: 'ADM_EMPRESA', nome_tela: 'CADASTRO DE EMPRESA', modulo: 'ADMINISTRATIVO', caminho_tela: '/modules/administrativo/empresa', icone: 'Building', ordem_exibicao: 1 },
  { codigo_tela: 'ADM_FUNCIONARIOS', nome_tela: 'FUNCIONARIOS', modulo: 'ADMINISTRATIVO', caminho_tela: '/modules/administrativo/funcionarios', icone: 'Users', ordem_exibicao: 2 },
  { codigo_tela: 'ADM_USUARIOS', nome_tela: 'USUARIOS DO SISTEMA', modulo: 'ADMINISTRATIVO', caminho_tela: '/modules/administrativo/usuarios', icone: 'UserCog', ordem_exibicao: 3 },
  { codigo_tela: 'ADM_BACKUP', nome_tela: 'CONFIGURACAO DE BACKUP', modulo: 'ADMINISTRATIVO', caminho_tela: '/modules/administrativo/backup', icone: 'Database', ordem_exibicao: 4 },

  // FINANCEIRO
  { codigo_tela: 'FIN_PLANO_CONTAS', nome_tela: 'PLANO DE CONTAS', modulo: 'FINANCEIRO', caminho_tela: '/modules/financeiro/plano-contas', icone: 'List', ordem_exibicao: 10 },
  { codigo_tela: 'FIN_BANCOS', nome_tela: 'CADASTRO DE BANCOS', modulo: 'FINANCEIRO', caminho_tela: '/modules/financeiro/bancos', icone: 'Landmark', ordem_exibicao: 11 },
  { codigo_tela: 'FIN_FORMAS_PAGAMENTO', nome_tela: 'FORMAS DE PAGAMENTO', modulo: 'FINANCEIRO', caminho_tela: '/modules/financeiro/formas-pagamento', icone: 'CreditCard', ordem_exibicao: 12 },
  { codigo_tela: 'FIN_CONDICOES_PAGAMENTO', nome_tela: 'CONDICOES DE PAGAMENTO', modulo: 'FINANCEIRO', caminho_tela: '/modules/financeiro/condicoes-pagamento', icone: 'Calendar', ordem_exibicao: 13 },
  { codigo_tela: 'FIN_MOVIMENTACAO', nome_tela: 'MOVIMENTACAO FINANCEIRA', modulo: 'FINANCEIRO', caminho_tela: '/modules/financeiro/movimentacao', icone: 'ArrowLeftRight', ordem_exibicao: 14 },
  { codigo_tela: 'FIN_CONCILIACAO', nome_tela: 'CONCILIACAO BANCARIA', modulo: 'FINANCEIRO', caminho_tela: '/modules/financeiro/conciliacao', icone: 'CheckSquare', ordem_exibicao: 15 },

  // PARCEIROS
  { codigo_tela: 'PAR_CADASTRO', nome_tela: 'CADASTRO DE PARCEIROS', modulo: 'PARCEIROS', caminho_tela: '/modules/parceiros/cadastro', icone: 'Users', ordem_exibicao: 20 },
  { codigo_tela: 'PAR_CONSULTA', nome_tela: 'CONSULTA DE PARCEIROS', modulo: 'PARCEIROS', caminho_tela: '/modules/parceiros/consulta', icone: 'Search', ordem_exibicao: 21 },

  // FATURAMENTO
  { codigo_tela: 'FAT_CLIENTES', nome_tela: 'CADASTRO DE CLIENTES', modulo: 'FATURAMENTO', caminho_tela: '/modules/faturamento/clientes', icone: 'UserCheck', ordem_exibicao: 30 },
  { codigo_tela: 'FAT_NOTAS_FISCAIS', nome_tela: 'NOTAS FISCAIS DE VENDA', modulo: 'FATURAMENTO', caminho_tela: '/modules/faturamento/notas-fiscais', icone: 'FileText', ordem_exibicao: 31 },
  { codigo_tela: 'FAT_COBRANCAS', nome_tela: 'CONTAS A RECEBER', modulo: 'FATURAMENTO', caminho_tela: '/modules/faturamento/cobrancas', icone: 'DollarSign', ordem_exibicao: 32 },

  // COMPRAS
  { codigo_tela: 'COM_FORNECEDORES', nome_tela: 'CADASTRO DE FORNECEDORES', modulo: 'COMPRAS', caminho_tela: '/modules/compras/fornecedores', icone: 'Truck', ordem_exibicao: 40 },
  { codigo_tela: 'COM_NOTAS_FISCAIS', nome_tela: 'NOTAS FISCAIS DE COMPRA', modulo: 'COMPRAS', caminho_tela: '/modules/compras/notas-fiscais', icone: 'FileText', ordem_exibicao: 41 },
  { codigo_tela: 'COM_PAGAMENTOS', nome_tela: 'CONTAS A PAGAR', modulo: 'COMPRAS', caminho_tela: '/modules/compras/pagamentos', icone: 'DollarSign', ordem_exibicao: 42 },

  // TABELAS DE PREÇOS
  { codigo_tela: 'TAB_PRECOS', nome_tela: 'TABELAS DE PRECOS', modulo: 'TABELAS', caminho_tela: '/modules/tabelas-precos/cadastro', icone: 'Tag', ordem_exibicao: 50 },

  // OBJETIVOS
  { codigo_tela: 'OBJ_TRIMESTRAL', nome_tela: 'OBJETIVOS TRIMESTRAIS', modulo: 'OBJETIVOS', caminho_tela: '/modules/objetivos/trimestral', icone: 'Target', ordem_exibicao: 60 },

  // RELATÓRIOS
  { codigo_tela: 'REL_DRE', nome_tela: 'DRE - DEMONSTRATIVO DE RESULTADO', modulo: 'RELATORIOS', caminho_tela: '/modules/relatorios/dre', icone: 'BarChart', ordem_exibicao: 70 },
  { codigo_tela: 'REL_FLUXO_CAIXA', nome_tela: 'FLUXO DE CAIXA', modulo: 'RELATORIOS', caminho_tela: '/modules/relatorios/fluxo-caixa', icone: 'TrendingUp', ordem_exibicao: 71 },
];

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `SELECT * FROM adm_telas WHERE ativo = 1 ORDER BY modulo, ordem_exibicao`,
      args: []
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar telas:', error);
    return Response.json({ error: 'Erro ao buscar telas' }, { status: 500 });
  }
}

// Endpoint para inicializar telas do sistema
export async function POST() {
  try {
    let inserted = 0;
    let updated = 0;

    for (const tela of telasDoSistema) {
      // Verificar se já existe
      const existe = await turso.execute({
        sql: `SELECT id FROM adm_telas WHERE codigo_tela = ?`,
        args: [tela.codigo_tela]
      });

      if (existe.rows.length > 0) {
        // Atualizar
        await turso.execute({
          sql: `
            UPDATE adm_telas
            SET nome_tela = ?,
                modulo = ?,
                caminho_tela = ?,
                icone = ?,
                ordem_exibicao = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE codigo_tela = ?
          `,
          args: [
            tela.nome_tela,
            tela.modulo,
            tela.caminho_tela,
            tela.icone,
            tela.ordem_exibicao,
            tela.codigo_tela
          ]
        });
        updated++;
      } else {
        // Inserir
        await turso.execute({
          sql: `
            INSERT INTO adm_telas (
              codigo_tela, nome_tela, modulo, caminho_tela, icone, ordem_exibicao
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [
            tela.codigo_tela,
            tela.nome_tela,
            tela.modulo,
            tela.caminho_tela,
            tela.icone,
            tela.ordem_exibicao
          ]
        });
        inserted++;
      }
    }

    return Response.json({
      success: true,
      message: `Telas sincronizadas: ${inserted} inseridas, ${updated} atualizadas`,
      inserted,
      updated
    });
  } catch (error) {
    console.error('Erro ao inicializar telas:', error);
    return Response.json({ error: 'Erro ao inicializar telas: ' + error.message }, { status: 500 });
  }
}
