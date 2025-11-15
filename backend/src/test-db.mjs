// backend/src/db.mjs
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Valida se as variáveis vieram dos Secrets do GitHub
if (!url) {
  throw new Error("TURSO_DATABASE_URL não definida nos Secrets do GitHub.");
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN não definido nos Secrets do GitHub.");
}

// Cliente compartilhado para todo o backend
export const db = createClient({ url, authToken });

// Função de teste de conexão usada pelo script test-db.mjs
export async function testConnection() {
  console.log("🔌 Testando conexão com Turso...");

  const result = await db.execute("SELECT 1 AS result");

  // Em geral o retorno é algo como [{ result: 1 }]
  const row = result.rows?.[0] ?? result.rows[0];

  console.log("✅ Conexão OK. Resultado:", row);
}
