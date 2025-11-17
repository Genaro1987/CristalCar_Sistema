'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState(null);

  useEffect(() => {
    const salva = localStorage.getItem('empresaSelecionadaId');
    if (salva) {
      setEmpresaSelecionadaId(Number(salva));
    }
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    try {
      const response = await fetch('/api/administrativo/empresa?all=true');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const selecionarEmpresa = (empresaId) => {
    localStorage.setItem('empresaSelecionadaId', empresaId);
    router.push('/dashboard');
  };

  const novaEmpresa = () => {
    router.push('/modules/administrativo/empresa');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecione a Empresa
          </h1>
          <p className="text-gray-600">
            Escolha qual empresa deseja acessar ou cadastre uma nova
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando empresas...</p>
          </div>
        ) : empresas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma empresa cadastrada
            </h3>
            <p className="text-gray-600 mb-6">
              Cadastre sua primeira empresa para começar a usar o sistema
            </p>
            <button
              onClick={novaEmpresa}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <span>+</span>
              Cadastrar Nova Empresa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {empresas.map((empresa) => (
                <button
                  key={empresa.id}
                  onClick={() => selecionarEmpresa(empresa.id)}
                  className={`relative p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                    empresaSelecionadaId === empresa.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {empresa.logo_path ? (
                        <img
                          src={empresa.logo_path}
                          alt={empresa.nome_fantasia}
                          className="w-16 h-16 object-contain rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-2xl">🏢</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {empresa.nome_fantasia || empresa.razao_social}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {empresa.cnpj}
                      </p>
                      {empresa.padrao && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Padrão
                        </span>
                      )}
                    </div>
                    {empresaSelecionadaId === empresa.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={novaEmpresa}
                className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-primary-400 text-gray-700 hover:text-primary-600 px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span>Cadastrar Nova Empresa</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Voltar para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
