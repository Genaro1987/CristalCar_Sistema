// backend/src/criar-tabela-teste.mjs
// Cria tabela de teste e insere um registro usando o libSQL Remote Protocol (HTTP)

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error("❌ TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN não configurados.");
  process.exit(1);
}

// Troca libsql:// por https:// conforme documentação do /v2/pipeline
// Ex: libsql://cristalcar-xxx.turso.io  -> https://cristalcar-xxx.turso.io
const baseUrl = TURSO_DATABASE_URL.replace(/^libsql:\/\//, "https://");

async function chamarPipeline(body) {
  const response = await fetch(`${baseUrl}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `HTTP ${response.status} ao chamar /v2/pipeline: ${text || "(sem corpo)"}`
    );
  }

  return response.json();
}

async function main() {
  console.log("🚀 [init-db] Criando tabela e registro de teste via HTTP...");

  const body = {
    requests: [
      {
        // 1) Garante que a tabela exista
        type: "execute",
        stmt: {
          sql: `
            CREATE TABLE IF NOT EXISTS teste_ci (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              descricao TEXT NOT NULL
            )
          `,
        },
      },
      {
        // 2) Insere um registro de teste
        type: "execute",
        stmt: {
          sql: `INSERT INTO teste_ci (descricao) VALUES ('registro criado via pipeline HTTP CI')`,
        },
      },
      {
        // 3) Busca o último registro só para log
        type: "execute",
        stmt: {
          sql: `SELECT id, descricao FROM teste_ci ORDER BY id DESC LIMIT 1`,
        },
      },
      {
        // 4) Fecha a conexão
        type: "close",
      },
    ],
  };

  const result = await chamarPipeline(body);

  console.log("✅ Pipeline executado com sucesso.");
  console.log("📊 Retorno bruto do Turso (para conferência):");
  console.log(JSON.stringify(result, null, 2));

  console.log("🏁 [init-db] Finalizado com sucesso.");
}

main().catch((err) => {
  console.error("❌ Erro ao criar tabela/registro de teste:", err);
  process.exit(1);
});
