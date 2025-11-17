'use client';

import { useState } from 'react';
import Button from '@/app/components/ui/Button';

export default function InitSystemPage() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const inicializarSistema = async () => {
    setLoading(true);
    setResultado(null);

    try {
      // Inicializar telas
      const telasResponse = await fetch('/api/administrativo/telas', {
        method: 'POST'
      });

      const telasData = await telasResponse.json();

      setResultado({
        success: telasResponse.ok,
        telas: telasData,
        timestamp: new Date().toLocaleString('pt-BR')
      });

    } catch (error) {
      setResultado({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inicialização do Sistema
          </h1>
          <p className="text-gray-600">
            Registre as telas do sistema na tabela adm_telas
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">O que será feito:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Registrar 23 telas do sistema em adm_telas</li>
              <li>✓ Incluir: Administrativo, Financeiro, Parceiros, Faturamento, Compras, etc.</li>
              <li>✓ Telas existentes serão atualizadas, novas serão inseridas</li>
            </ul>
          </div>

          <Button
            variant="primary"
            onClick={inicializarSistema}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Inicializando...' : 'Inicializar Telas do Sistema'}
          </Button>

          {resultado && (
            <div className={`rounded-lg p-4 ${
              resultado.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                <div className={`text-2xl mr-3 ${
                  resultado.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {resultado.success ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    resultado.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {resultado.success ? 'Sucesso!' : 'Erro'}
                  </h3>

                  {resultado.success ? (
                    <div className="text-sm text-green-800 space-y-2">
                      <p>{resultado.telas.message}</p>
                      <div className="bg-white rounded p-3 font-mono text-xs">
                        <p>Inseridas: {resultado.telas.inserted}</p>
                        <p>Atualizadas: {resultado.telas.updated}</p>
                        <p>Horário: {resultado.timestamp}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="font-semibold mb-2">Próximos passos:</p>
                        <ul className="space-y-1">
                          <li>→ As telas estão registradas em adm_telas</li>
                          <li>→ <a href="/dashboard" className="text-green-700 underline">Ir para o Dashboard</a></li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-800">
                      <p>Erro: {resultado.error || resultado.telas?.error}</p>
                      <p className="mt-2 text-xs">Horário: {resultado.timestamp}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Telas que serão registradas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <p className="font-semibold text-gray-700 mb-1">ADMINISTRATIVO (4)</p>
                <ul className="space-y-0.5 ml-2">
                  <li>• Cadastro de Empresa</li>
                  <li>• Funcionários</li>
                  <li>• Usuários do Sistema</li>
                  <li>• Configuração de Backup</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">FINANCEIRO (6)</p>
                <ul className="space-y-0.5 ml-2">
                  <li>• Plano de Contas</li>
                  <li>• Cadastro de Bancos</li>
                  <li>• Formas de Pagamento</li>
                  <li>• Condições de Pagamento</li>
                  <li>• Movimentação Financeira</li>
                  <li>• Conciliação Bancária</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">PARCEIROS (2)</p>
                <ul className="space-y-0.5 ml-2">
                  <li>• Cadastro de Parceiros</li>
                  <li>• Consulta de Parceiros</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">FATURAMENTO (3)</p>
                <ul className="space-y-0.5 ml-2">
                  <li>• Cadastro de Clientes</li>
                  <li>• Notas Fiscais de Venda</li>
                  <li>• Contas a Receber</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">COMPRAS (3)</p>
                <ul className="space-y-0.5 ml-2">
                  <li>• Cadastro de Fornecedores</li>
                  <li>• Notas Fiscais de Compra</li>
                  <li>• Contas a Pagar</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">OUTROS (5)</p>
                <ul className="space-y-0.5 ml-2">
                  <li>• Tabelas de Preços</li>
                  <li>• Objetivos Trimestrais</li>
                  <li>• DRE</li>
                  <li>• Fluxo de Caixa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
