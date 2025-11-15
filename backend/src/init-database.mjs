// backend/src/init-database.mjs
import { turso } from "./db.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para processar comandos SQL corretamente
function parseSQL(sqlContent) {
  const commands = [];
  let currentCommand = '';
  let inTrigger = false;

  const lines = sqlContent.split('\n');

  for (let line of lines) {
    const trimmedLine = line.trim();

    // Ignorar comentários e linhas vazias
    if (!trimmedLine || trimmedLine.startsWith('--')) {
      continue;
    }

    // Detectar início de trigger
    if (trimmedLine.match(/CREATE\s+TRIGGER/i)) {
      inTrigger = true;
    }

    currentCommand += line + '\n';

    // Se estamos em um trigger, procurar por END;
    if (inTrigger) {
      if (trimmedLine === 'END;') {
        commands.push(currentCommand.trim());
        currentCommand = '';
        inTrigger = false;
      }
    } else {
      // Para outros comandos, usar ; como delimitador
      if (trimmedLine.endsWith(';')) {
        commands.push(currentCommand.trim());
        currentCommand = '';
      }
    }
  }

  // Adicionar último comando se houver
  if (currentCommand.trim()) {
    commands.push(currentCommand.trim());
  }

  return commands;
}

async function initDatabase() {
  try {
    console.log("🚀 Iniciando criação do banco de dados...\n");

    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Processar comandos SQL
    const commands = parseSQL(schema);

    console.log(`📝 Total de comandos SQL a executar: ${commands.length}\n`);

    // Executar cada comando
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Executar comandos em lotes menores para evitar timeout
    const batchSize = 10;
    for (let i = 0; i < commands.length; i += batchSize) {
      const batch = commands.slice(i, i + batchSize);

      for (let j = 0; j < batch.length; j++) {
        const command = batch[j];
        const commandIndex = i + j;

        try {
          // Extrair nome da tabela/índice/view/trigger para log
          const match =
            command.match(
              /CREATE\s+(TABLE|INDEX|VIEW|TRIGGER)\s+IF\s+NOT\s+EXISTS\s+(\w+)/i
            ) || command.match(/CREATE\s+(TABLE|INDEX|VIEW|TRIGGER)\s+(\w+)/i);

          const objectType = match ? match[1] : "OBJECT";
          const objectName = match ? match[2] : `comando_${commandIndex + 1}`;

          // Executar comando SQL
          // Nota: Se o banco já existe, IF NOT EXISTS evitará erros
          if (typeof turso.executeMultiple === 'function') {
            await turso.executeMultiple(command);
          } else {
            // Usar execute com string simples (não objeto) pode evitar migrations API em algumas versões
            await turso.execute(command);
          }

          console.log(`✅ ${objectType}: ${objectName}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Erro no comando ${commandIndex + 1}:`, error.message);
          errors.push({
            command: commandIndex + 1,
            error: error.message,
            sql: command.substring(0, 100)
          });
          errorCount++;
        }
      }

      // Pequeno delay entre batches
      if (i + batchSize < commands.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log("=".repeat(60) + "\n");

    if (errors.length > 0 && errors.length < 10) {
      console.log("Detalhes dos erros:");
      errors.forEach(err => {
        console.log(`\nComando ${err.command}:`);
        console.log(`SQL: ${err.sql}...`);
        console.log(`Erro: ${err.error}`);
      });
      console.log();
    }

    // Verificar tabelas criadas
    const result = await turso.execute(`
      SELECT name, type
      FROM sqlite_master
      WHERE type IN ('table', 'view')
      AND name NOT LIKE 'sqlite_%'
      ORDER BY type, name
    `);

    console.log("📊 Estrutura do banco criada:\n");
    console.log("TABELAS:");
    result.rows
      .filter((row) => row.type === "table")
      .forEach((row) => {
        console.log(`  - ${row.name}`);
      });

    console.log("\nVIEWS:");
    result.rows
      .filter((row) => row.type === "view")
      .forEach((row) => {
        console.log(`  - ${row.name}`);
      });

    console.log("\n✅ Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log("\n🎉 Processo concluído!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Processo finalizado com erro:", error);
      process.exit(1);
    });
}

export { initDatabase };
