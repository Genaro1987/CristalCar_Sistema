'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function MigrarBancoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);

  const verificarEstrutura = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/database/migrate');
      const data = await response.json();
      setTableInfo(data);
    } catch (error) {
      console.error('Erro ao verificar estrutura:', error);
      alert('Erro ao verificar estrutura do banco');
    } finally {
      setLoading(false);
    }
  };

  const executarMigracao = async () => {
    if (!confirm('Deseja executar as migrações no banco de dados?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/database/migrate', {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);

      if (data.success) {
        alert('Migrações executadas com sucesso!');
      } else {
        alert('Erro ao executar migrações: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao executar migração:', error);
      alert('Erro ao executar migração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout screenCode="ADM-MIGRATE">
      <div className="space-y-6">
        <Card title="Migração do Banco de Dados" subtitle="Ferramenta para atualizar o schema do banco">
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Atenção</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Esta ferramenta adiciona colunas faltantes no banco de dados.</p>
                    <p className="mt-1">Use apenas se estiver tendo erros de "column not found".</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={verificarEstrutura}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar Estrutura'}
              </Button>

              <Button
                variant="primary"
                onClick={executarMigracao}
                disabled={loading}
              >
                {loading ? 'Executando...' : 'Executar Migrações'}
              </Button>
            </div>

            {tableInfo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Estrutura Atual das Tabelas</h3>
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-xs">{JSON.stringify(tableInfo, null, 2)}</pre>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Resultado da Migração</h3>

                {result.migrations && result.migrations.length > 0 && (
                  <div className="bg-white border rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">Migrações Executadas:</h4>
                    <ul className="space-y-1">
                      {result.migrations.map((migration, index) => (
                        <li key={index} className="text-sm font-mono">
                          {migration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.tableStructures && (
                  <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                    <h4 className="font-medium mb-2">Estrutura Atualizada:</h4>
                    <pre className="text-xs">{JSON.stringify(result.tableStructures, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card title="Problemas Conhecidos" subtitle="Lista de problemas que esta migração resolve">
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <div>
                <p className="font-medium">Coluna cpf_cnpj em adm_empresa</p>
                <p className="text-sm text-gray-600">Corrige erro: "table adm_empresa has no column named cpf_cnpj"</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <div>
                <p className="font-medium">Coluna considera_resultado em fin_plano_contas</p>
                <p className="text-sm text-gray-600">Corrige erro: "table fin_plano_contas has no column named considera_resultado"</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
