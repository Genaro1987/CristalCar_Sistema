// backend/src/init-database-simple.mjs
// Versão simplificada que executa o schema como um único batch
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabaseSimple() {
  console.log("🚀 Iniciando criação do banco de dados (modo simplificado)...\n");

  // Verificar variáveis de ambiente
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Erro: Variáveis TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórias!");
    console.log("\nConfigure-as executando:");
    console.log('  export TURSO_DATABASE_URL="libsql://seu-banco.turso.io"');
    console.log('  export TURSO_AUTH_TOKEN="seu-token"');
    process.exit(1);
  }

  console.log("✅ Variáveis de ambiente configuradas");
  console.log(`   URL: ${url.substring(0, 40)}...`);
  console.log(`   Token: ${authToken.substring(0, 20)}...`);

  try {
    // Criar cliente
    const client = createClient({ url, authToken });

    // Testar conexão
    console.log("\n🔌 Testando conexão...");
    await client.execute("SELECT 1");
    console.log("✅ Conexão estabelecida com sucesso!\n");

    // Ler schema
    const schemaPath = path.join(__dirname, "schema.sql");
    console.log(`📄 Lendo schema de: ${schemaPath}`);
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Limpar comentários e linhas vazias
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');

    // Separar por CREATE statements
    const statements = [];
    let currentStatement = '';
    let insideTrigger = false;

    for (const line of cleanedSchema.split('\n')) {
      const trimmed = line.trim();

      // Detectar início de trigger
      if (trimmed.toUpperCase().includes('CREATE TRIGGER')) {
        insideTrigger = true;
      }

      currentStatement += line + '\n';

      // Se termina com ; e não estamos dentro de um trigger, é fim de statement
      if (trimmed.endsWith(';')) {
        if (!insideTrigger || trimmed === 'END;') {
          statements.push(currentStatement.trim());
          currentStatement = '';
          insideTrigger = false;
        }
      }
    }

    console.log(`📝 Total de statements SQL: ${statements.length}\n`);

    // Agrupar statements por tipo
    const tables = statements.filter(s => s.toUpperCase().includes('CREATE TABLE'));
    const indexes = statements.filter(s => s.toUpperCase().includes('CREATE INDEX'));
    const views = statements.filter(s => s.toUpperCase().includes('CREATE VIEW'));
    const triggers = statements.filter(s => s.toUpperCase().includes('CREATE TRIGGER'));

    console.log(`   📊 ${tables.length} tabelas`);
    console.log(`   🔍 ${indexes.length} índices`);
    console.log(`   👁️  ${views.length} views`);
    console.log(`   ⚡ ${triggers.length} triggers\n`);

    // Executar em ordem: tabelas -> índices -> views -> triggers
    console.log("🔨 Executando em ordem...\n");

    let successCount = 0;
    let errorCount = 0;

    // 1. Criar tabelas
    console.log("1️⃣ Criando tabelas...");
    for (const stmt of tables) {
      try {
        await client.execute(stmt);
        const match = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        const tableName = match ? match[1] : 'unknown';
        console.log(`   ✅ ${tableName}`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Erro:`, error.message);
        errorCount++;
      }
    }

    // 2. Criar índices
    console.log("\n2️⃣ Criando índices...");
    for (const stmt of indexes) {
      try {
        await client.execute(stmt);
        const match = stmt.match(/CREATE INDEX IF NOT EXISTS (\w+)/i);
        const indexName = match ? match[1] : 'unknown';
        console.log(`   ✅ ${indexName}`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Erro:`, error.message);
        errorCount++;
      }
    }

    // 3. Criar views
    console.log("\n3️⃣ Criando views...");
    for (const stmt of views) {
      try {
        await client.execute(stmt);
        const match = stmt.match(/CREATE VIEW IF NOT EXISTS (\w+)/i);
        const viewName = match ? match[1] : 'unknown';
        console.log(`   ✅ ${viewName}`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Erro:`, error.message);
        errorCount++;
      }
    }

    // 4. Criar triggers
    console.log("\n4️⃣ Criando triggers...");
    for (const stmt of triggers) {
      try {
        await client.execute(stmt);
        const match = stmt.match(/CREATE TRIGGER IF NOT EXISTS (\w+)/i);
        const triggerName = match ? match[1] : 'unknown';
        console.log(`   ✅ ${triggerName}`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Erro:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Statements executados com sucesso: ${successCount}`);
    console.log(`❌ Statements com erro: ${errorCount}`);
    console.log("=".repeat(60) + "\n");

    // Verificar estrutura criada
    const result = await client.execute(`
      SELECT name, type
      FROM sqlite_master
      WHERE type IN ('table', 'view', 'index', 'trigger')
      AND name NOT LIKE 'sqlite_%'
      ORDER BY type, name
    `);

    console.log("📊 Estrutura do banco criada:\n");

    const tableList = result.rows.filter(r => r.type === 'table');
    const viewList = result.rows.filter(r => r.type === 'view');
    const indexList = result.rows.filter(r => r.type === 'index');
    const triggerList = result.rows.filter(r => r.type === 'trigger');

    console.log(`TABELAS (${tableList.length}):`);
    tableList.forEach(r => console.log(`  - ${r.name}`));

    console.log(`\nVIEWS (${viewList.length}):`);
    viewList.forEach(r => console.log(`  - ${r.name}`));

    console.log(`\nÍNDICES (${indexList.length}):`);
    indexList.forEach(r => console.log(`  - ${r.name}`));

    console.log(`\nTRIGGERS (${triggerList.length}):`);
    triggerList.forEach(r => console.log(`  - ${r.name}`));

    console.log("\n✅ Banco de dados inicializado com sucesso!");

  } catch (error) {
    console.error("\n❌ Erro ao inicializar banco de dados:", error);
    console.error("\nDetalhes:", error.message);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabaseSimple()
    .then(() => {
      console.log("\n🎉 Processo concluído!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Processo finalizado com erro:", error.message);
      process.exit(1);
    });
}

export { initDatabaseSimple };
