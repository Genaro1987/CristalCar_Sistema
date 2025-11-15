// backend/db.mjs
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL não definida nos Secrets do GitHub.");
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN não definido nos Secrets do GitHub.");
}

export const db = createClient({ url, authToken });

export async function testConnection() {
  console.log("🔌 Testando conexão com Turso...");
  const result = await db.execute("SELECT 1 AS result");
  console.log("✅ Conexão OK. Resultado:", result.rows[0].result);
}
