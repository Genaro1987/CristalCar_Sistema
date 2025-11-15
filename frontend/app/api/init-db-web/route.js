// frontend/app/api/init-db-web/route.js
import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Este endpoint permite inicializar o banco via browser
// Acesse: https://seu-app.vercel.app/api/init-db-web?secret=SUA_SENHA_AQUI

const INIT_SECRET = process.env.INIT_DB_SECRET || "cristalcar-init-2024"; // Configure isso no Vercel!

export async function GET(request) {
  try {
    // Verificar secret para segurança
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== INIT_SECRET) {
      return NextResponse.json({
        error: "Acesso negado. Forneça o secret correto via ?secret=XXX"
      }, { status: 401 });
    }

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      return NextResponse.json({
        error: "Variáveis TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN não configuradas"
      }, { status: 500 });
    }

    const client = createClient({ url, authToken });

    // Executar schema em partes (apenas tabelas essenciais primeiro)
    const results = {
      created: [],
      errors: [],
      steps: []
    };

    // Passo 1: Criar tabela de empresa
    results.steps.push("Criando tabela adm_empresa...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS adm_empresa (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          razao_social VARCHAR(200) NOT NULL,
          nome_fantasia VARCHAR(200),
          cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
          inscricao_estadual VARCHAR(20),
          inscricao_municipal VARCHAR(20),
          regime_tributario VARCHAR(50),
          telefone VARCHAR(20),
          celular VARCHAR(20),
          email VARCHAR(100),
          site VARCHAR(200),
          endereco VARCHAR(200),
          numero VARCHAR(20),
          complemento VARCHAR(100),
          bairro VARCHAR(100),
          cidade VARCHAR(100),
          estado VARCHAR(2),
          cep VARCHAR(10),
          logo_url VARCHAR(500),
          observacoes TEXT,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("adm_empresa");
    } catch (error) {
      results.errors.push({ table: "adm_empresa", error: error.message });
    }

    // Passo 2: Criar tabela de favoritos
    results.steps.push("Criando tabela adm_favoritos...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS adm_favoritos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          codigo_tela VARCHAR(20) NOT NULL,
          nome_tela VARCHAR(200) NOT NULL,
          caminho_tela VARCHAR(500) NOT NULL,
          ordem INTEGER DEFAULT 0,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("adm_favoritos");
    } catch (error) {
      results.errors.push({ table: "adm_favoritos", error: error.message });
    }

    // Passo 3: Criar tabela de backup config
    results.steps.push("Criando tabela adm_configuracao_backup...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS adm_configuracao_backup (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo_backup VARCHAR(30) NOT NULL,
          diretorio_local VARCHAR(500),
          google_drive_folder_id VARCHAR(200),
          google_drive_credentials TEXT,
          frequencia VARCHAR(20) NOT NULL,
          horario_execucao TIME,
          dia_semana INTEGER,
          dia_mes INTEGER,
          quantidade_manter INTEGER DEFAULT 7,
          backup_automatico BOOLEAN DEFAULT 1,
          ultimo_backup DATETIME,
          proximo_backup DATETIME,
          status VARCHAR(20) DEFAULT 'ATIVO',
          observacoes TEXT,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("adm_configuracao_backup");
    } catch (error) {
      results.errors.push({ table: "adm_configuracao_backup", error: error.message });
    }

    // Passo 4: Criar tabela de histórico backup
    results.steps.push("Criando tabela adm_historico_backup...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS adm_historico_backup (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo_backup VARCHAR(30),
          nome_arquivo VARCHAR(255) NOT NULL,
          tamanho_bytes INTEGER,
          caminho_completo VARCHAR(500),
          data_backup DATETIME NOT NULL,
          status VARCHAR(20),
          tempo_execucao INTEGER,
          mensagem TEXT,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("adm_historico_backup");
    } catch (error) {
      results.errors.push({ table: "adm_historico_backup", error: error.message });
    }

    // Passo 5: Criar tabela de PARCEIROS (ESSENCIAL!)
    results.steps.push("Criando tabela par_parceiros...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS par_parceiros (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          tipo_pessoa VARCHAR(20) NOT NULL,
          tipo_parceiro VARCHAR(100) NOT NULL,
          cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
          rg_inscricao_estadual VARCHAR(20),
          inscricao_municipal VARCHAR(20),
          nome VARCHAR(200),
          razao_social VARCHAR(200),
          nome_fantasia VARCHAR(200),
          data_nascimento DATE,
          data_fundacao DATE,
          telefone VARCHAR(20),
          celular VARCHAR(20),
          email VARCHAR(100),
          site VARCHAR(200),
          endereco VARCHAR(200),
          numero VARCHAR(20),
          complemento VARCHAR(100),
          bairro VARCHAR(100),
          cidade VARCHAR(100),
          estado VARCHAR(2),
          cep VARCHAR(10),
          pais VARCHAR(50) DEFAULT 'Brasil',
          limite_credito DECIMAL(15,2),
          observacoes TEXT,
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("par_parceiros");
    } catch (error) {
      results.errors.push({ table: "par_parceiros", error: error.message });
    }

    // Passo 6: Criar tabelas financeiras
    results.steps.push("Criando tabela fin_bancos...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS fin_bancos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          numero_banco VARCHAR(10) NOT NULL,
          nome VARCHAR(200) NOT NULL,
          agencia VARCHAR(20),
          conta VARCHAR(30),
          tipo_conta VARCHAR(30),
          saldo_inicial DECIMAL(15,2) DEFAULT 0,
          saldo_atual DECIMAL(15,2) DEFAULT 0,
          gerente VARCHAR(200),
          telefone VARCHAR(20),
          observacoes TEXT,
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("fin_bancos");
    } catch (error) {
      results.errors.push({ table: "fin_bancos", error: error.message });
    }

    results.steps.push("Criando tabela fin_formas_pagamento...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS fin_formas_pagamento (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          descricao VARCHAR(200) NOT NULL,
          tipo VARCHAR(30) NOT NULL,
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("fin_formas_pagamento");
    } catch (error) {
      results.errors.push({ table: "fin_formas_pagamento", error: error.message });
    }

    results.steps.push("Criando tabela fin_condicoes_pagamento...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS fin_condicoes_pagamento (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          descricao VARCHAR(200) NOT NULL,
          quantidade_parcelas INTEGER NOT NULL,
          intervalo_dias INTEGER NOT NULL,
          primeira_parcela_dias INTEGER DEFAULT 0,
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("fin_condicoes_pagamento");
    } catch (error) {
      results.errors.push({ table: "fin_condicoes_pagamento", error: error.message });
    }

    results.steps.push("Criando tabela fin_plano_contas...");
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS fin_plano_contas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          descricao VARCHAR(200) NOT NULL,
          tipo VARCHAR(20) NOT NULL,
          natureza VARCHAR(20) NOT NULL,
          nivel INTEGER NOT NULL,
          conta_pai_id INTEGER,
          aceita_lancamento BOOLEAN DEFAULT 1,
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.created.push("fin_plano_contas");
    } catch (error) {
      results.errors.push({ table: "fin_plano_contas", error: error.message });
    }

    // Verificar quantas tabelas foram criadas
    const checkResult = await client.execute(`
      SELECT COUNT(*) as total
      FROM sqlite_master
      WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
    `);

    const totalTables = checkResult.rows[0]?.total || 0;

    return NextResponse.json({
      success: true,
      message: "Inicialização parcial concluída!",
      created: results.created,
      errors: results.errors,
      totalTables: totalTables,
      steps: results.steps,
      nextSteps: [
        "1. Verifique se as tabelas essenciais foram criadas",
        "2. Acesse https://app.turso.tech para ver o banco via web",
        "3. Teste cadastrar um parceiro no sistema",
        "4. Se necessário, execute o script completo via Turso Console"
      ]
    });

  } catch (error) {
    return NextResponse.json({
      error: "Erro ao inicializar banco",
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
