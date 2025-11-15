'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function HistoricoAlteracoesPage() {
  const [historico, setHistorico] = useState([]);
  const [tabelas, setTabelas] = useState([]);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [filtroTabela, setFiltroTabela] = useState('TODAS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const tiposAlteracao = [
    { value: 'CRIACAO', label: 'Criação', icon: '➕', color: 'bg-green-100 text-green-800' },
    { value: 'ALTERACAO', label: 'Alteração', icon: '✏️', color: 'bg-blue-100 text-blue-800' },
    { value: 'EXCLUSAO', label: 'Exclusão', icon: '🗑️', color: 'bg-red-100 text-red-800' },
    { value: 'ATIVACAO', label: 'Ativação', icon: '✅', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'DESATIVACAO', label: 'Desativação', icon: '⛔', color: 'bg-orange-100 text-orange-800' }
  ];

  useEffect(() => {
    carregarHistorico();
    carregarTabelas();
  }, []);

  const carregarHistorico = async () => {
    try {
      const response = await fetch('/api/tabelas-precos/historico');
      if (response.ok) {
        const data = await response.json();
        setHistorico(data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const carregarTabelas = async () => {
    try {
      const response = await fetch('/api/tabelas-precos/cadastro');
      if (response.ok) {
        const data = await response.json();
        setTabelas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error);
    }
  };

  const historicoFiltrado = historico.filter(item => {
    const matchTabela = filtroTabela === 'TODAS' || item.tabela_id === parseInt(filtroTabela);
    const matchTipo = filtroTipo === 'TODOS' || item.tipo_alteracao === filtroTipo;

    let matchData = true;
    if (dataInicio && dataFim) {
      const dataItem = new Date(item.data_alteracao);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      matchData = dataItem >= inicio && dataItem <= fim;
    }

    return matchTabela && matchTipo && matchData;
  });

  const getTabelaNome = (tabelaId) => {
    const tabela = tabelas.find(t => t.id === tabelaId);
    return tabela?.nome || 'Tabela excluída';
  };

  const getTipoIcon = (tipo) => {
    return tiposAlteracao.find(t => t.value === tipo)?.icon || '📝';
  };

  const getTipoLabel = (tipo) => {
    return tiposAlteracao.find(t => t.value === tipo)?.label || tipo;
  };

  const getTipoColor = (tipo) => {
    return tiposAlteracao.find(t => t.value === tipo)?.color || 'bg-gray-100 text-gray-800';
  };

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  const exportarHistorico = () => {
    const csv = [
      ['Data', 'Tipo', 'Tabela', 'Usuário', 'Descrição'].join(';'),
      ...historicoFiltrado.map(item => [
        formatarData(item.data_alteracao),
        getTipoLabel(item.tipo_alteracao),
        getTabelaNome(item.tabela_id),
        item.usuario || '-',
        (item.descricao || '-').replace(/;/g, ',')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico-tabelas-precos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <DashboardLayout screenCode="TAB-002">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Alterações</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe todas as alterações realizadas nas tabelas de preços
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarAjuda(true)}
              className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              ❓ Ajuda
            </button>
            <button
              onClick={exportarHistorico}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={historicoFiltrado.length === 0}
            >
              📥 Exportar CSV
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{historico.length}</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </div>
          {tiposAlteracao.slice(0, 4).map(tipo => (
            <div key={tipo.value} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{tipo.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {historico.filter(h => h.tipo_alteracao === tipo.value).length}
                  </p>
                </div>
                <span className="text-3xl">{tipo.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tabela</label>
              <select
                value={filtroTabela}
                onChange={(e) => setFiltroTabela(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODAS">Todas as Tabelas</option>
                {tabelas.map(tabela => (
                  <option key={tabela.id} value={tabela.id}>{tabela.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Alteração</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">Todos os Tipos</option>
                {tiposAlteracao.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline de Histórico */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📜 Timeline ({historicoFiltrado.length} registros)
          </h3>

          {historicoFiltrado.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              📋 Nenhum registro encontrado com os filtros aplicados
            </div>
          ) : (
            <div className="space-y-4">
              {historicoFiltrado.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getTipoColor(item.tipo_alteracao)}`}>
                      {getTipoIcon(item.tipo_alteracao)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(item.tipo_alteracao)}`}>
                            {getTipoLabel(item.tipo_alteracao)}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {getTabelaNome(item.tabela_id)}
                          </span>
                        </div>

                        {item.descricao && (
                          <p className="text-sm text-gray-700 mb-2">{item.descricao}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>🕒 {formatarData(item.data_alteracao)}</span>
                          {item.usuario && (
                            <span>👤 {item.usuario}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.valor_anterior && item.valor_novo && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Valor Anterior</div>
                            <div className="text-red-600 line-through">{item.valor_anterior}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Valor Novo</div>
                            <div className="text-green-600 font-semibold">{item.valor_novo}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Ajuda */}
        {mostrarAjuda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">❓ Ajuda - Histórico de Alterações</h2>
                  <button onClick={() => setMostrarAjuda(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📜 O que é o Histórico?</h3>
                  <p className="text-gray-700">
                    Registra automaticamente todas as alterações realizadas nas tabelas de preços,
                    incluindo criações, modificações, exclusões, ativações e desativações.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Tipos de Registro</h3>
                  <div className="space-y-2">
                    {tiposAlteracao.map(tipo => (
                      <div key={tipo.value} className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${tipo.color}`}>
                          {tipo.icon} {tipo.label}
                        </span>
                        <span className="text-sm text-gray-600">Registro de {tipo.label.toLowerCase()} de tabelas</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Estatísticas</h3>
                  <p className="text-gray-700">
                    No topo da tela você encontra contadores para cada tipo de alteração,
                    facilitando a análise de atividades no sistema.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📥 Exportação</h3>
                  <p className="text-gray-700">
                    Use o botão "Exportar CSV" para baixar o histórico filtrado em formato CSV,
                    ideal para análises em Excel ou importação em outros sistemas.
                  </p>
                </section>

                <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">💡 Dicas</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Use os filtros para encontrar alterações específicas</li>
                    <li>Filtre por período para auditorias temporais</li>
                    <li>Exporte os dados periodicamente para backup</li>
                    <li>Acompanhe quem fez cada alteração pelo campo usuário</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
