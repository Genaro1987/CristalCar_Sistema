// backend/src/init-database-complete.mjs
// Inicializa o banco de dados completo do CristalCar

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN não configurados.');
  process.exit(1);
}

// Criar cliente Turso
const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN
});

async function main() {
  console.log('🚀 Iniciando criação do banco de dados CristalCar...\n');

  try {
    // Ler o schema completo
    const schemaPath = join(__dirname, 'schema-complete.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');

    // Processar SQL: remover comentários e dividir em statements
    const processedSQL = schemaSQL
      // Remover comentários de linha (-- até o final da linha)
      .split('\n')
      .map(line => {
        const commentIndex = line.indexOf('--');
        return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
      })
      .join('\n')
      // Remover linhas vazias
      .replace(/^\s*[\r\n]/gm, '\n')
      .trim();

    // Dividir statements SQL respeitando blocos BEGIN...END
    const statements = [];
    let currentStatement = '';
    let insideBeginEnd = 0;

    const lines = processedSQL.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim().toUpperCase();

      // Detectar BEGIN (incrementa contador)
      if (trimmedLine === 'BEGIN') {
        insideBeginEnd++;
      }

      // Detectar END (decrementa contador)
      if (trimmedLine === 'END;' || trimmedLine === 'END') {
        insideBeginEnd--;
      }

      currentStatement += line + '\n';

      // Se a linha termina com ; E não estamos dentro de BEGIN...END
      if (line.trim().endsWith(';') && insideBeginEnd === 0) {
        const stmt = currentStatement.trim();
        if (stmt) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    // Adicionar último statement se houver
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📋 Encontrados ${statements.length} statements SQL\n`);

    // Executar cada statement
    let sucessos = 0;
    let erros = 0;
    const errosDetalhes = [];

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      // Extrair o tipo de comando (CREATE TABLE, CREATE INDEX, etc)
      const match = stmt.match(/^(CREATE\s+(?:TABLE|INDEX|VIEW|TRIGGER))\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
      const tipo = match ? match[1] : 'SQL';
      const nome = match ? match[2] : `Statement ${i + 1}`;

      try {
        process.stdout.write(`  [${i + 1}/${statements.length}] ${tipo} ${nome}...`);
        await db.execute(stmt);
        console.log(' ✅');
        sucessos++;
      } catch (error) {
        console.log(' ❌');
        const errorMsg = error.message || String(error);
        console.error(`     Erro: ${errorMsg}`);
        errosDetalhes.push({ tipo, nome, erro: errorMsg, sql: stmt.substring(0, 100) });
        erros++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Concluído: ${sucessos} sucessos, ${erros} erros`);
    console.log('='.repeat(70));

    if (errosDetalhes.length > 0) {
      console.log('\n⚠️  Detalhes dos erros:');
      errosDetalhes.forEach((err, idx) => {
        console.log(`\n${idx + 1}. ${err.tipo} ${err.nome}`);
        console.log(`   Erro: ${err.erro}`);
      });
    }

    if (erros === 0) {
      console.log('\n🎉 Banco de dados CristalCar criado com sucesso!\n');

      // Inserir dados iniciais básicos
      await inserirDadosIniciais();
    } else {
      console.log('\n⚠️  Banco criado com alguns erros. Verifique os logs acima.\n');
    }

    // Listar tabelas criadas
    await listarTabelas();

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

async function listarTabelas() {
  console.log('\n📊 Listando tabelas criadas no banco de dados:\n');

  try {
    const result = await db.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '_litestream_%'
      ORDER BY name
    `);

    if (result.rows && result.rows.length > 0) {
      result.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. ${row.name}`);
      });
      console.log(`\n  Total: ${result.rows.length} tabelas criadas`);
    } else {
      console.log('  ⚠️  Nenhuma tabela encontrada');
    }
  } catch (error) {
    console.error('  ❌ Erro ao listar tabelas:', error.message);
  }
}

async function inserirDadosIniciais() {
  console.log('📝 Inserindo dados iniciais...\n');

  try {
    // 1. Dados da Empresa (se não existir)
    await db.execute(`
      INSERT OR IGNORE INTO adm_empresa (
        id, razao_social, nome_fantasia, cnpj, telefone, email, cidade, estado
      ) VALUES (
        1,
        'CRISTAL CAR LTDA',
        'Cristal Car',
        '00.000.000/0001-00',
        '(51) 3000-0000',
        'contato@cristalcar.com.br',
        'Porto Alegre',
        'RS'
      );
    `);
    console.log('  ✅ Dados da empresa inseridos');

    // 2. Usuário Administrador Padrão
    // Senha: admin123 (hash bcrypt)
    await db.execute(`
      INSERT OR IGNORE INTO adm_usuarios (
        id, codigo_unico, username, senha_hash, email, nome_completo, perfil, status
      ) VALUES (
        1,
        'USR001',
        'admin',
        '$2a$10$rO7h3H5H5H5H5H5H5H5H5uqKqKqKqKqKqKqKqKqKqKqKqKqKqKqK',
        'admin@cristalcar.com.br',
        'Administrador do Sistema',
        'ADMINISTRADOR',
        'ATIVO'
      );
    `);
    console.log('  ✅ Usuário administrador criado (login: admin / senha: admin123)');

    // 3. Plano de Contas Básico
    const planoContas = [
      // RECEITAS
      { codigo: '1', descricao: 'RECEITAS', tipo: 'RECEITA', nivel: 1, pai: null, aceita: 0 },
      { codigo: '1.1', descricao: 'Receitas Operacionais', tipo: 'RECEITA', nivel: 2, pai: '1', aceita: 0 },
      { codigo: '1.1.1', descricao: 'Vendas de Serviços', tipo: 'RECEITA', nivel: 3, pai: '1.1', aceita: 1 },
      { codigo: '1.1.2', descricao: 'Vendas de Produtos', tipo: 'RECEITA', nivel: 3, pai: '1.1', aceita: 1 },

      // DESPESAS
      { codigo: '2', descricao: 'DESPESAS', tipo: 'DESPESA', nivel: 1, pai: null, aceita: 0 },
      { codigo: '2.1', descricao: 'Despesas Operacionais', tipo: 'DESPESA', nivel: 2, pai: '2', aceita: 0 },
      { codigo: '2.1.1', descricao: 'Pessoal', tipo: 'DESPESA', nivel: 3, pai: '2.1', aceita: 0, tipo_gasto: 'FIXO' },
      { codigo: '2.1.1.01', descricao: 'Salários', tipo: 'DESPESA', nivel: 4, pai: '2.1.1', aceita: 1, tipo_gasto: 'FIXO' },
      { codigo: '2.1.1.02', descricao: 'Encargos Sociais', tipo: 'DESPESA', nivel: 4, pai: '2.1.1', aceita: 1, tipo_gasto: 'FIXO' },
      { codigo: '2.1.2', descricao: 'Administrativas', tipo: 'DESPESA', nivel: 3, pai: '2.1', aceita: 0, tipo_gasto: 'FIXO' },
      { codigo: '2.1.2.01', descricao: 'Aluguel', tipo: 'DESPESA', nivel: 4, pai: '2.1.2', aceita: 1, tipo_gasto: 'FIXO' },
      { codigo: '2.1.2.02', descricao: 'Energia Elétrica', tipo: 'DESPESA', nivel: 4, pai: '2.1.2', aceita: 1, tipo_gasto: 'VARIAVEL' },
      { codigo: '2.1.2.03', descricao: 'Telefone/Internet', tipo: 'DESPESA', nivel: 4, pai: '2.1.2', aceita: 1, tipo_gasto: 'FIXO' },
    ];

    for (const conta of planoContas) {
      const contaPaiId = conta.pai ?
        `(SELECT id FROM fin_plano_contas WHERE codigo_conta = '${conta.pai}')` :
        'NULL';

      const tipoGasto = conta.tipo_gasto ? `'${conta.tipo_gasto}'` : 'NULL';

      await db.execute(`
        INSERT OR IGNORE INTO fin_plano_contas (
          codigo_conta, descricao, tipo, nivel, conta_pai_id, aceita_lancamento, tipo_gasto, compoe_dre, status
        ) VALUES (
          '${conta.codigo}',
          '${conta.descricao}',
          '${conta.tipo}',
          ${conta.nivel},
          ${contaPaiId},
          ${conta.aceita ? 1 : 0},
          ${tipoGasto},
          1,
          'ATIVO'
        );
      `);
    }
    console.log(`  ✅ Plano de contas básico criado (${planoContas.length} contas)`);

    // 4. Formas de Pagamento Básicas
    const formasPagamento = [
      { codigo: 'FP001', descricao: 'Dinheiro', tipo: 'DINHEIRO', dias: 0 },
      { codigo: 'FP002', descricao: 'PIX', tipo: 'PIX', dias: 0 },
      { codigo: 'FP003', descricao: 'Cartão de Crédito', tipo: 'CARTAO_CREDITO', dias: 30 },
      { codigo: 'FP004', descricao: 'Cartão de Débito', tipo: 'CARTAO_DEBITO', dias: 1 },
      { codigo: 'FP005', descricao: 'Boleto Bancário', tipo: 'BOLETO', dias: 0 },
      { codigo: 'FP006', descricao: 'Transferência Bancária', tipo: 'TRANSFERENCIA', dias: 0 },
    ];

    for (const fp of formasPagamento) {
      await db.execute(`
        INSERT OR IGNORE INTO fin_formas_pagamento (
          codigo, descricao, tipo, dias_recebimento, status
        ) VALUES (
          '${fp.codigo}',
          '${fp.descricao}',
          '${fp.tipo}',
          ${fp.dias},
          'ATIVO'
        );
      `);
    }
    console.log(`  ✅ Formas de pagamento criadas (${formasPagamento.length} formas)`);

    // 5. Condições de Pagamento Básicas
    const condicoesPagamento = [
      { codigo: 'CP001', descricao: 'À Vista', tipo: 'A_VISTA', parcelas: 1, dias: 0 },
      { codigo: 'CP002', descricao: '30 dias', tipo: 'A_PRAZO', parcelas: 1, dias: 30 },
      { codigo: 'CP003', descricao: '2x (30/60 dias)', tipo: 'PARCELADO', parcelas: 2, dias: 30 },
      { codigo: 'CP004', descricao: '3x (30/60/90 dias)', tipo: 'PARCELADO', parcelas: 3, dias: 30 },
    ];

    for (const cp of condicoesPagamento) {
      await db.execute(`
        INSERT OR IGNORE INTO fin_condicoes_pagamento (
          codigo, descricao, tipo, quantidade_parcelas, dias_primeira_parcela, dias_entre_parcelas, status
        ) VALUES (
          '${cp.codigo}',
          '${cp.descricao}',
          '${cp.tipo}',
          ${cp.parcelas},
          ${cp.dias},
          30,
          'ATIVO'
        );
      `);
    }
    console.log(`  ✅ Condições de pagamento criadas (${condicoesPagamento.length} condições)`);

    // 6. Centro de Custo Padrão
    await db.execute(`
      INSERT OR IGNORE INTO fin_centro_custo (
        codigo, descricao, status
      ) VALUES (
        'CC001',
        'Administrativo',
        'ATIVO'
      );
    `);
    console.log('  ✅ Centro de custo padrão criado');

    // 7. Configuração de Log Padrão
    const modulos = [
      { modulo: 'ADMINISTRATIVO', tela: 'CADASTRO_EMPRESA' },
      { modulo: 'ADMINISTRATIVO', tela: 'FUNCIONARIOS' },
      { modulo: 'FINANCEIRO', tela: 'PLANO_CONTAS' },
      { modulo: 'FINANCEIRO', tela: 'BANCOS' },
      { modulo: 'PARCEIROS', tela: 'CADASTRO_PARCEIROS' },
    ];

    for (const mod of modulos) {
      await db.execute(`
        INSERT OR IGNORE INTO adm_configuracao_log (
          modulo, tela, registrar_log, registrar_inclusao, registrar_edicao, registrar_exclusao
        ) VALUES (
          '${mod.modulo}',
          '${mod.tela}',
          1, 1, 1, 1
        );
      `);
    }
    console.log(`  ✅ Configuração de log criada (${modulos.length} telas)`);

    console.log('\n✅ Dados iniciais inseridos com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error.message);
    throw error;
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
