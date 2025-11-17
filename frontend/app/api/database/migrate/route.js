import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST() {
  try {
    const migrations = [];

    // 1. Verificar e corrigir tabela adm_empresa
    try {
      // Tentar adicionar coluna cpf_cnpj se não existir
      await turso.execute(`
        ALTER TABLE adm_empresa ADD COLUMN cpf_cnpj VARCHAR(18);
      `);
      migrations.push('✅ Coluna cpf_cnpj adicionada em adm_empresa');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        migrations.push('ℹ️ Coluna cpf_cnpj já existe em adm_empresa');
      } else {
        migrations.push(`⚠️ Erro ao adicionar cpf_cnpj: ${error.message}`);
      }
    }

    // 2. Verificar e corrigir tabela fin_plano_contas
    try {
      // Tentar adicionar coluna considera_resultado se não existir
      await turso.execute(`
        ALTER TABLE fin_plano_contas ADD COLUMN considera_resultado BOOLEAN DEFAULT 1;
      `);
      migrations.push('✅ Coluna considera_resultado adicionada em fin_plano_contas');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        migrations.push('ℹ️ Coluna considera_resultado já existe em fin_plano_contas');
      } else {
        migrations.push(`⚠️ Erro ao adicionar considera_resultado: ${error.message}`);
      }
    }

    // 3. Listar estrutura das tabelas para verificação
    const tableInfo = {};

    try {
      const empresaInfo = await turso.execute(`PRAGMA table_info(adm_empresa)`);
      tableInfo.adm_empresa = empresaInfo.rows.map(r => r.name);
    } catch (e) {
      tableInfo.adm_empresa = `Erro: ${e.message}`;
    }

    try {
      const planoInfo = await turso.execute(`PRAGMA table_info(fin_plano_contas)`);
      tableInfo.fin_plano_contas = planoInfo.rows.map(r => r.name);
    } catch (e) {
      tableInfo.fin_plano_contas = `Erro: ${e.message}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Migrações executadas',
      migrations,
      tableStructures: tableInfo
    });

  } catch (error) {
    console.error('Erro na migração:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Apenas listar estrutura das tabelas
    const tables = ['adm_empresa', 'fin_plano_contas', 'fin_estrutura_dre', 'fin_formas_pagamento'];
    const tableInfo = {};

    for (const table of tables) {
      try {
        const info = await turso.execute(`PRAGMA table_info(${table})`);
        tableInfo[table] = info.rows;
      } catch (e) {
        tableInfo[table] = { error: e.message };
      }
    }

    return NextResponse.json({
      success: true,
      tables: tableInfo
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
