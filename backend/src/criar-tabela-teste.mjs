// backend/src/criar-tabela-teste.mjs
import { db } from "./db.mjs";

async function main() {
  try {
    console.log("📊 Criando tabela de teste (teste_ci)...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS teste_ci (
        id INTEGER PRIMARY KEY,
        descricao TEXT NOT NULL,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tabela teste_ci criada (ou já existia).");

    const descricao = "Registro criado via GitHub Actions";

    await db.execute({
      sql: "INSERT INTO teste_ci (descricao) VALUES (:descricao)",
      args: { descricao },
    });

    console.log("✅ Registro de exemplo inserido na tabela teste_ci.");
  } catch (error) {
    console.error("❌ Erro ao criar tabela/registro de teste:", error);
    process.exit(1);
  }
}

main();
