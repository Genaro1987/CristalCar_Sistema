// backend/src/auth.mjs
import bcrypt from "bcryptjs";
import { turso } from "./db.mjs";

/**
 * Autentica um usuário
 * @param {string} username - Nome de usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function autenticarUsuario(username, senha) {
  try {
    // Buscar usuário
    const result = await turso.execute({
      sql: `SELECT id, codigo_unico, username, senha_hash, email, nome_completo, perfil, status, tentativas_login
            FROM adm_usuarios
            WHERE username = ? OR email = ?`,
      args: [username, username],
    });

    if (result.rows.length === 0) {
      return { success: false, error: "Usuário não encontrado" };
    }

    const usuario = result.rows[0];

    // Verificar se usuário está ativo
    if (usuario.status !== "ATIVO") {
      return {
        success: false,
        error: `Usuário ${usuario.status.toLowerCase()}`,
      };
    }

    // Verificar se usuário está bloqueado por tentativas
    if (usuario.tentativas_login >= 5) {
      return {
        success: false,
        error: "Usuário bloqueado por excesso de tentativas. Contate o administrador.",
      };
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      // Incrementar tentativas de login
      await turso.execute({
        sql: `UPDATE adm_usuarios SET tentativas_login = tentativas_login + 1 WHERE id = ?`,
        args: [usuario.id],
      });

      return { success: false, error: "Senha incorreta" };
    }

    // Resetar tentativas e atualizar último acesso
    await turso.execute({
      sql: `UPDATE adm_usuarios
            SET tentativas_login = 0, ultimo_acesso = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [usuario.id],
    });

    // Buscar permissões do usuário
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

    // Retornar dados do usuário (sem senha)
    const { senha_hash, tentativas_login, ...dadosUsuario } = usuario;

    return {
      success: true,
      user: {
        ...dadosUsuario,
        permissoes,
      },
    };
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return { success: false, error: "Erro ao processar autenticação" };
  }
}

/**
 * Registra um log de acesso
 * @param {number} usuarioId - ID do usuário
 * @param {string} acao - Ação realizada
 * @param {string} modulo - Módulo acessado
 * @param {object} detalhes - Detalhes adicionais
 * @param {string} ipAddress - IP do usuário
 * @param {string} userAgent - User agent do navegador
 */
export async function registrarLogAcesso(
  usuarioId,
  acao,
  modulo,
  detalhes = null,
  ipAddress = null,
  userAgent = null
) {
  try {
    await turso.execute({
      sql: `INSERT INTO adm_log_acessos
            (usuario_id, acao, modulo, ip_address, user_agent, detalhes)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        usuarioId,
        acao,
        modulo,
        ipAddress,
        userAgent,
        detalhes ? JSON.stringify(detalhes) : null,
      ],
    });
  } catch (error) {
    console.error("Erro ao registrar log de acesso:", error);
  }
}

/**
 * Verifica se usuário tem permissão para um módulo
 * @param {number} usuarioId - ID do usuário
 * @param {string} modulo - Nome do módulo
 * @param {string} tipoPermissao - Tipo de permissão (leitura, escrita, exclusao)
 * @returns {Promise<boolean>}
 */
export async function verificarPermissao(
  usuarioId,
  modulo,
  tipoPermissao = "leitura"
) {
  try {
    const result = await turso.execute({
      sql: `SELECT perfil FROM adm_usuarios WHERE id = ?`,
      args: [usuarioId],
    });

    if (result.rows.length === 0) return false;

    // Administrador tem acesso total
    if (result.rows[0].perfil === "ADMINISTRADOR") return true;

    // Verificar permissão específica
    const permResult = await turso.execute({
      sql: `SELECT permissao_${tipoPermissao} FROM adm_permissoes_modulos
            WHERE usuario_id = ? AND modulo = ?`,
      args: [usuarioId, modulo],
    });

    if (permResult.rows.length === 0) return false;

    return Boolean(permResult.rows[0][`permissao_${tipoPermissao}`]);
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}

/**
 * Altera senha do usuário
 * @param {number} usuarioId - ID do usuário
 * @param {string} senhaAtual - Senha atual
 * @param {string} novaSenha - Nova senha
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function alterarSenha(usuarioId, senhaAtual, novaSenha) {
  try {
    // Buscar usuário
    const result = await turso.execute({
      sql: `SELECT senha_hash FROM adm_usuarios WHERE id = ?`,
      args: [usuarioId],
    });

    if (result.rows.length === 0) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(
      senhaAtual,
      result.rows[0].senha_hash
    );

    if (!senhaValida) {
      return { success: false, error: "Senha atual incorreta" };
    }

    // Criar hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await turso.execute({
      sql: `UPDATE adm_usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [novaSenhaHash, usuarioId],
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return { success: false, error: "Erro ao processar alteração de senha" };
  }
}

/**
 * Cria novo usuário
 * @param {object} dadosUsuario - Dados do usuário
 * @returns {Promise<{success: boolean, userId?: number, error?: string}>}
 */
export async function criarUsuario(dadosUsuario) {
  try {
    const {
      codigo_unico,
      funcionario_id,
      username,
      senha,
      email,
      nome_completo,
      perfil,
    } = dadosUsuario;

    // Verificar se username já existe
    const usernameExiste = await turso.execute({
      sql: `SELECT id FROM adm_usuarios WHERE username = ?`,
      args: [username],
    });

    if (usernameExiste.rows.length > 0) {
      return { success: false, error: "Nome de usuário já existe" };
    }

    // Verificar se email já existe
    const emailExiste = await turso.execute({
      sql: `SELECT id FROM adm_usuarios WHERE email = ?`,
      args: [email],
    });

    if (emailExiste.rows.length > 0) {
      return { success: false, error: "Email já cadastrado" };
    }

    // Criar hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const result = await turso.execute({
      sql: `INSERT INTO adm_usuarios
            (codigo_unico, funcionario_id, username, senha_hash, email, nome_completo, perfil, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ATIVO')`,
      args: [
        codigo_unico,
        funcionario_id || null,
        username,
        senhaHash,
        email,
        nome_completo,
        perfil,
      ],
    });

    return { success: true, userId: result.lastInsertRowid };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, error: "Erro ao criar usuário" };
  }
}
