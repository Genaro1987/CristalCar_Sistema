// backend/test-db.mjs
import { testConnection } from "./db.mjs";

async function main() {
  try {
    await testConnection();
    console.log("🏁 Teste de conexão finalizado com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao testar conexão:", err);
    process.exit(1);
  }
}

main();
