'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HelpButton from '@/app/components/ui/HelpButton';
import { helpContents } from '@/app/utils/helpContent';

export default function Header({ screenCode = '', screenName = '', onShowHelp }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  // Todas as telas do sistema
  const allScreens = [
    // Administrativo
    { code: 'ADM-001', name: 'Cadastro da Empresa', path: '/modules/administrativo/empresa', module: 'Administrativo' },
    { code: 'ADM-002', name: 'Funcionários', path: '/modules/administrativo/funcionarios', module: 'Administrativo' },
    { code: 'ADM-003', name: 'Layouts de Importação', path: '/modules/administrativo/layouts', module: 'Administrativo' },
    { code: 'ADM-004', name: 'Configuração de Backup', path: '/modules/administrativo/backup', module: 'Administrativo' },
    { code: 'ADM-005', name: 'Registro de Log', path: '/modules/administrativo/logs', module: 'Administrativo' },

    // Modelos de Plano
    { code: 'FIN-001', name: 'Plano de Contas', path: '/modules/modelos-plano/plano-contas', module: 'Modelos de Plano' },
    { code: 'FIN-002', name: 'Tipos de DRE', path: '/modules/modelos-plano/planos-padroes', module: 'Modelos de Plano' },
    { code: 'FIN-003', name: 'Estrutura DRE', path: '/modules/modelos-plano/estrutura-dre', module: 'Modelos de Plano' },

    // Financeiro
    { code: 'FIN-010', name: 'Formas de Pagamento', path: '/modules/financeiro/formas-pagamento', module: 'Financeiro' },
    { code: 'FIN-011', name: 'Condições de Pagamento', path: '/modules/financeiro/condicoes-pagamento', module: 'Financeiro' },
    { code: 'FIN-012', name: 'Cadastro de Bancos', path: '/modules/financeiro/bancos', module: 'Financeiro' },
    { code: 'FIN-013', name: 'Regras de Conciliação', path: '/modules/financeiro/regras-conciliacao', module: 'Financeiro' },

    // Parceiros
    { code: 'PAR-001', name: 'Cadastro de Parceiros', path: '/modules/parceiros/cadastro', module: 'Parceiros' },

    // Tabelas de Preços
    { code: 'TAB-001', name: 'Tabelas de Preços', path: '/modules/tabelas-precos/cadastro', module: 'Tabelas de Preços' },
    { code: 'TAB-002', name: 'Histórico de Alterações', path: '/modules/tabelas-precos/historico', module: 'Tabelas de Preços' },
  ];

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const term = searchTerm.toLowerCase();
      const results = allScreens.filter(screen =>
        screen.name.toLowerCase().includes(term) ||
        screen.code.toLowerCase().includes(term) ||
        screen.module.toLowerCase().includes(term)
      ).slice(0, 8); // Máximo 8 resultados
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  useEffect(() => {
    const salva = localStorage.getItem('empresaSelecionadaId');
    if (salva && empresas.length > 0) {
      const existe = empresas.find(emp => `${emp.id}` === `${salva}`);
      if (existe) {
        setEmpresaSelecionada(existe.id);
      }
    } else if (empresas.length > 0 && !empresaSelecionada) {
      const padrao = empresas.find(emp => emp.padrao);
      setEmpresaSelecionada(padrao?.id || empresas[0].id);
    }
  }, [empresas]);

  const carregarEmpresas = async () => {
    try {
      const response = await fetch('/api/administrativo/empresa?all=true');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleSelecionarEmpresa = (id) => {
    const valor = id ? Number(id) : null;
    setEmpresaSelecionada(valor);
    if (valor) {
      localStorage.setItem('empresaSelecionadaId', valor);
    } else {
      localStorage.removeItem('empresaSelecionadaId');
    }
  };

  const handleNavigate = (path) => {
    setSearchTerm('');
    setShowResults(false);
    router.push(path);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Título da Tela */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{screenName || 'Dashboard'}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {screenCode && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    {screenCode}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 gap-3 lg:gap-0">
            {/* Seleção de Empresa */}
            {empresas.length > 0 && (
              <div className="flex flex-col items-center lg:flex-row lg:items-center lg:space-x-3">
                <div className="text-center lg:text-right lg:min-w-[220px]">
                  <p className="text-xs text-gray-500">Empresa ativa</p>
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-xs">
                    {empresas.find(emp => Number(emp.id) === Number(empresaSelecionada))?.nome_fantasia || 'Selecione'}
                  </p>
                </div>
                <select
                  value={empresaSelecionada || ''}
                  onChange={(e) => handleSelecionarEmpresa(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm min-w-[240px]"
                  title="Selecione a empresa ativa"
                >
                  <option value="">Selecione...</option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome_fantasia || emp.razao_social} {emp.padrao ? '• Padrão' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pesquisa Global de Telas */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                onFocus={() => searchTerm.trim().length >= 2 && setShowResults(true)}
                placeholder="Buscar tela por nome ou código..."
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Resultados da Pesquisa */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((screen, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigate(screen.path)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{screen.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{screen.module}</div>
                        </div>
                        <span className="text-xs font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {screen.code}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showResults && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 text-sm">
                  Nenhuma tela encontrada
                </div>
              )}
            </div>

            {/* Botão de Ajuda */}
            {screenCode && helpContents[screenCode] && (
              <HelpButton helpContent={helpContents[screenCode]} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
