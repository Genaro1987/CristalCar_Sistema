import { createClient } from '@libsql/client';

export async function GET() {
  const checks = {
    environmentVariables: {},
    connection: {},
    schema: {},
    write: {}
  };

  try {
    // 1. Verificar variáveis de ambiente
    checks.environmentVariables = {
      TURSO_DATABASE_URL: {
        exists: !!process.env.TURSO_DATABASE_URL,
        value: process.env.TURSO_DATABASE_URL ?
          process.env.TURSO_DATABASE_URL.substring(0, 30) + '...' :
          'NOT SET'
      },
      TURSO_AUTH_TOKEN: {
        exists: !!process.env.TURSO_AUTH_TOKEN,
        value: process.env.TURSO_AUTH_TOKEN ?
          process.env.TURSO_AUTH_TOKEN.substring(0, 20) + '...' :
          'NOT SET'
      }
    };

    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return Response.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        checks,
        instructions: 'Configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN no Vercel'
      }, { status: 500 });
    }

    // 2. Testar conexão
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const pingResult = await turso.execute('SELECT 1 as ping');
    checks.connection = {
      success: true,
      ping: pingResult.rows[0]?.ping || pingResult.rows[0]
    };

    // 3. Verificar schema (listar tabelas)
    const tablesResult = await turso.execute(`
      SELECT name
      FROM sqlite_master
      WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    checks.schema = {
      tablesCount: tablesResult.rows.length,
      tables: tablesResult.rows.map(row => row.name)
    };

    if (tablesResult.rows.length === 0) {
      return Response.json({
        success: false,
        error: 'Banco de dados sem tabelas! Execute o script de inicialização.',
        checks,
        instructions: 'Execute: cd backend && node src/init-database.mjs'
      }, { status: 500 });
    }

    // 4. Testar escrita (inserir e deletar um registro de teste)
    try {
      // Tenta inserir na tabela adm_funcionarios
      const insertResult = await turso.execute({
        sql: `
          INSERT INTO adm_funcionarios (
            codigo_unico, nome_completo, cpf, data_admissao, status
          ) VALUES (?, ?, ?, ?, ?)
        `,
        args: ['TEST-999', 'Teste de Conexão', '00000000000', '2024-01-01', 'TESTE']
      });

      // Deletar o registro de teste
      await turso.execute({
        sql: 'DELETE FROM adm_funcionarios WHERE codigo_unico = ?',
        args: ['TEST-999']
      });

      checks.write = {
        success: true,
        message: 'Escrita e leitura funcionando perfeitamente!'
      };

    } catch (writeError) {
      checks.write = {
        success: false,
        error: writeError.message
      };
    }

    // Retorno de sucesso
    return Response.json({
      success: true,
      message: '✅ Conexão com Turso funcionando perfeitamente!',
      timestamp: new Date().toISOString(),
      checks
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      checks,
      instructions: 'Verifique as variáveis de ambiente no Vercel e tente novamente'
    }, { status: 500 });
  }
}
