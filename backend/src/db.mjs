// backend/src/db.mjs
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL não definida nos Secrets do GitHub.");
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN não definido nos Secrets do GitHub.");
}

// Cliente compartilhado para todo o backend
export const db = createClient({ url, authToken });

// Alias para compatibilidade
export const turso = db;

// Função usada no teste de conexão (pingTurso)
export async function pingTurso() {
  console.log("🔌 Testando conexão com Turso...");
  const result = await db.execute("SELECT 1 AS result");
  // Em geral vem algo como [{ result: 1 }]
  console.log("✅ Conexão OK. Resultado:", result.rows?.[0]?.result ?? result.rows[0]);
}
