// backend/src/criar-tabela-teste.mjs
import { db } from "./db.mjs";

async function main() {
  try {
    console.log("📊 [init-db] Criando tabela de teste (teste_ci)...");

    // 1) Cria a tabela (se ainda não existir)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS teste_ci (
        id INTEGER PRIMARY KEY,
        descricao TEXT NOT NULL,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ [init-db] Tabela teste_ci criada (ou já existia).");

    // 2) Insere um registro fixo (para garantir visibilidade)
    console.log("📝 [init-db] Inserindo registro de exemplo...");

    const insertResult = await db.execute(
      "INSERT INTO teste_ci (descricao) VALUES ('Registro criado via GitHub Actions');"
    );

    console.log("✅ [init-db] Insert executado. Resultado bruto:", insertResult);

    // 3) Confere o que ficou na tabela
    const check = await db.execute(
      "SELECT id, descricao, criado_em FROM teste_ci ORDER BY id DESC LIMIT 5;"
    );

    console.log("📋 [init-db] Registros atuais na teste_ci:", check.rows);
  } catch (error) {
    console.error("❌ [init-db] Erro ao criar tabela/registro de teste:", error);
    process.exit(1);
  }
}

main();
