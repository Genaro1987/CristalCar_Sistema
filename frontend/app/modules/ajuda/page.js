'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { helpContents } from '@/app/utils/helpContent';

export default function AjudaSistemaPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('TODOS');
  const [expandedSections, setExpandedSections] = useState({});

  // Organiza todas as telas por módulo
  const allScreens = [
    // Administrativo
    { code: 'ADM-001', name: 'Cadastro da Empresa', path: '/modules/administrativo/empresa', module: 'Administrativo', icon: '🏢' },
    { code: 'ADM-002', name: 'Funcionários', path: '/modules/administrativo/funcionarios', module: 'Administrativo', icon: '👥' },
    { code: 'ADM-003', name: 'Layouts de Importação', path: '/modules/administrativo/layouts', module: 'Administrativo', icon: '📥' },
    { code: 'ADM-004', name: 'Configuração de Backup', path: '/modules/administrativo/backup', module: 'Administrativo', icon: '💾' },
    { code: 'ADM-005', name: 'Registro de Log', path: '/modules/administrativo/logs', module: 'Administrativo', icon: '📝' },

    // Modelos de Plano
    { code: 'FIN-001', name: 'Plano de Contas', path: '/modules/modelos-plano/plano-contas', module: 'Modelos de Plano', icon: '🗂️' },
    { code: 'FIN-002', name: 'Estrutura DRE', path: '/modules/modelos-plano/estrutura-dre', module: 'Modelos de Plano', icon: '📊' },

    // Financeiro
    { code: 'FIN-010', name: 'Formas de Pagamento', path: '/modules/financeiro/formas-pagamento', module: 'Financeiro', icon: '💳' },
    { code: 'FIN-011', name: 'Condições de Pagamento', path: '/modules/financeiro/condicoes-pagamento', module: 'Financeiro', icon: '📋' },
    { code: 'FIN-012', name: 'Cadastro de Bancos', path: '/modules/financeiro/bancos', module: 'Financeiro', icon: '🏦' },
    { code: 'FIN-013', name: 'Regras de Conciliação', path: '/modules/financeiro/regras-conciliacao', module: 'Financeiro', icon: '⚖️' },

    // Parceiros
    { code: 'PAR-001', name: 'Cadastro de Parceiros', path: '/modules/parceiros/cadastro', module: 'Parceiros', icon: '🤝' },

    // Tabelas de Preços
    { code: 'TAB-001', name: 'Tabelas de Preços', path: '/modules/tabelas-precos/cadastro', module: 'Tabelas de Preços', icon: '💰' },
    { code: 'TAB-002', name: 'Histórico de Alterações', path: '/modules/tabelas-precos/historico', module: 'Tabelas de Preços', icon: '📜' },
  ];

  const modules = ['TODOS', ...new Set(allScreens.map(s => s.module))];

  const filteredScreens = allScreens.filter(screen => {
    const matchModule = selectedModule === 'TODOS' || screen.module === selectedModule;
    const matchSearch = searchTerm === '' ||
      screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screen.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchModule && matchSearch;
  });

  const toggleSection = (screenCode) => {
    setExpandedSections(prev => ({
      ...prev,
      [screenCode]: !prev[screenCode]
    }));
  };

  const navegarPara = (path) => {
    router.push(path);
  };

  return (
    <DashboardLayout screenCode="HELP-001">
      <div className="space-y-6">
        {/* Header da Ajuda */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Central de Ajuda</h1>
              <p className="text-orange-100 mt-2">
                Documentação completa do sistema CristalCar ERP
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{allScreens.length}</div>
              <div className="text-sm text-orange-100">Telas Documentadas</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{modules.length - 1}</div>
              <div className="text-sm text-orange-100">Módulos do Sistema</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-orange-100">Cobertura de Ajuda</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Pesquisar Tela
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome ou código da tela..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📂 Filtrar por Módulo
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {modules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Telas com Ajuda */}
        <div className="space-y-4">
          {filteredScreens.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">Nenhuma tela encontrada</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou termo de pesquisa</p>
            </div>
          ) : (
            filteredScreens.map((screen) => {
              const hasHelp = helpContents[screen.code];
              const isExpanded = expandedSections[screen.code];

              return (
                <div key={screen.code} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-4xl">{screen.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{screen.name}</h3>
                            <span className="px-2 py-1 text-xs font-mono bg-orange-100 text-orange-800 rounded">
                              {screen.code}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {screen.module}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {hasHelp ? helpContents[screen.code].title : 'Documentação não disponível'}
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navegarPara(screen.path)}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              Abrir Tela
                            </button>
                            {hasHelp && (
                              <button
                                onClick={() => toggleSection(screen.code)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                                {isExpanded ? 'Ocultar' : 'Ver'} Documentação
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documentação Expandida */}
                    {isExpanded && hasHelp && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="prose max-w-none">
                          {helpContents[screen.code].sections.map((section, idx) => (
                            <div key={idx} className="mb-6">
                              {section.heading && (
                                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  {section.icon && <span>{section.icon}</span>}
                                  {section.heading}
                                </h4>
                              )}
                              {section.content && (
                                <p className="text-gray-700 mb-4">{section.content}</p>
                              )}
                              {section.items && (
                                <div className="space-y-3">
                                  {section.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="pl-4 border-l-2 border-orange-200">
                                      <div className="font-medium text-gray-900">{item.label}</div>
                                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {section.tips && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                  <h5 className="font-semibold text-yellow-900 mb-2">💡 Dicas</h5>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                    {section.tips.map((tip, tipIdx) => (
                                      <li key={tipIdx}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FAQ Seção */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Como adicionar uma tela aos favoritos?</h4>
              <p className="text-sm text-gray-600">Clique no ícone de estrela no canto superior direito de qualquer tela para adicioná-la aos favoritos.</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Como configurar backup automático?</h4>
              <p className="text-sm text-gray-600">Acesse Administrativo &gt; Configuração de Backup, ative o backup automático e configure o diretório local ou Google Drive.</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Posso vincular múltiplas tabelas de preços a um cliente?</h4>
              <p className="text-sm text-gray-600">Não. Cada cliente pode ter apenas uma tabela de preços vinculada. A tabela define o desconto ou acréscimo aplicado aos preços base.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
