import { NextResponse } from 'next/server';

/**
 * Endpoint para inicializar sistema
 * Executa scripts de inicialização necessários
 */
export async function POST() {
  try {
    const results = {
      telas: null,
      errors: []
    };

    // 1. Inicializar telas do sistema
    try {
      const telasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/administrativo/telas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (telasResponse.ok) {
        results.telas = await telasResponse.json();
      } else {
        results.errors.push('Erro ao inicializar telas');
      }
    } catch (error) {
      results.errors.push('Erro ao inicializar telas: ' + error.message);
    }

    // Adicionar mais inicializações conforme necessário
    // 2. Inicializar dados exemplo, etc

    return NextResponse.json({
      success: results.errors.length === 0,
      message: results.errors.length === 0
        ? 'Sistema inicializado com sucesso'
        : 'Inicialização parcial com erros',
      results,
      errors: results.errors
    });
  } catch (error) {
    console.error('Erro na inicialização do sistema:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro na inicialização: ' + error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para inicializar o sistema',
    endpoints: {
      '/api/init-system': 'POST - Inicializar sistema completo',
      '/api/administrativo/telas': 'POST - Inicializar apenas telas'
    }
  });
}
