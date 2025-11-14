// backend/src/criar-tabela-teste.mjs
import { turso } from "./db.mjs";

async function main() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS teste_turso (
      id INTEGER PRIMARY KEY,
      descricao TEXT NOT NULL,
      criado_em TEXT DEFAULT (datetime('now'))
    );
  `;

  await turso.execute(createSql);
  console.log("✅ Tabela teste_turso criada (ou já existia).");

  const now = new Date().toISOString();
  await turso.execute({
    sql: "INSERT INTO teste_turso (descricao) VALUES (?)",
    args: [`Registro criado via GitHub Actions em ${now}`],
  });
  console.log("✅ Registro de teste inserido em teste_turso.");

  const res = await turso.execute("SELECT COUNT(*) as total FROM teste_turso;");
  console.log("📊 Total de registros na tabela teste_turso:", res.rows[0].total);
}

main().catch((err) => {
  console.error("❌ Erro ao criar tabela ou inserir registro:", err);
  process.exit(1);
});
