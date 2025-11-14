// backend/src/test-db.mjs
import { pingTurso } from "./db.mjs";

async function main() {
  try {
    const row = await pingTurso();
    console.log("✅ Conexão com Turso OK:", row);
  } catch (err) {
    console.error("❌ Erro ao conectar no Turso:", err);
    process.exit(1);
  }
}

main();
