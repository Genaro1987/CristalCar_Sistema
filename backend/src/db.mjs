// backend/src/db.mjs
import { createClient } from "@libsql/client";

// Cliente único de conexão com o Turso
export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Função utilitária para testar a conexão
export async function pingTurso() {
  const result = await turso.execute("select datetime('now') as agora");
  return result.rows[0];
}
