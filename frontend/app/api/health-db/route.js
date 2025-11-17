import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const result = await turso.execute("select datetime('now') as agora");
    return NextResponse.json({
      ok: true,
      agora: result.rows[0].agora,
    });
  } catch (err) {
    console.error("Erro ao conectar ao Turso a partir da Vercel:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
