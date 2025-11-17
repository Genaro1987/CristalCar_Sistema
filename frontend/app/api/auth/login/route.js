// frontend/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  try {
    const { username, senha } = await request.json();

    if (!username || !senha) {
      return NextResponse.json(
        { success: false, error: "Usuário e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const result = await turso.execute({
      sql: `SELECT id, codigo_unico, username, senha_hash, email, nome_completo, perfil, status, tentativas_login
            FROM adm_usuarios
            WHERE username = ? OR email = ?`,
      args: [username, username],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const usuario = result.rows[0];

    // Verificar status
    if (usuario.status !== "ATIVO") {
      return NextResponse.json(
        { success: false, error: `Usuário ${usuario.status.toLowerCase()}` },
        { status: 401 }
      );
    }

    // Verificar bloqueio
    if (usuario.tentativas_login >= 5) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Usuário bloqueado por excesso de tentativas. Contate o administrador.",
        },
        { status: 401 }
      );
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      // Incrementar tentativas
      await turso.execute({
        sql: `UPDATE adm_usuarios SET tentativas_login = tentativas_login + 1 WHERE id = ?`,
        args: [usuario.id],
      });

      return NextResponse.json(
        { success: false, error: "Senha incorreta" },
        { status: 401 }
      );
    }

    // Resetar tentativas e atualizar último acesso
    await turso.execute({
      sql: `UPDATE adm_usuarios SET tentativas_login = 0, ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [usuario.id],
    });

    // Buscar permissões
    const permissoesResult = await turso.execute({
      sql: `SELECT modulo, permissao_leitura, permissao_escrita, permissao_exclusao
            FROM adm_permissoes_modulos
            WHERE usuario_id = ?`,
      args: [usuario.id],
    });

    const permissoes = {};
    permissoesResult.rows.forEach((perm) => {
      permissoes[perm.modulo] = {
        leitura: Boolean(perm.permissao_leitura),
        escrita: Boolean(perm.permissao_escrita),
        exclusao: Boolean(perm.permissao_exclusao),
      };
    });

    // Registrar log de acesso
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await turso.execute({
      sql: `INSERT INTO adm_log_acessos (usuario_id, acao, modulo, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)`,
      args: [usuario.id, "LOGIN", "AUTENTICACAO", ip, userAgent],
    });

    // Retornar dados do usuário
    const { senha_hash, tentativas_login, ...dadosUsuario } = usuario;

    return NextResponse.json({
      success: true,
      user: {
        ...dadosUsuario,
        permissoes,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar login" },
      { status: 500 }
    );
  }
}
