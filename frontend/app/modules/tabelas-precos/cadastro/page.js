'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function TabelasPrecosPage() {
  const [tabelas, setTabelas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    descricao: '',
    tipo_ajuste: 'PERCENTUAL',
    valor_ajuste: 0,
    data_inicio: '',
    data_fim: '',
    prioridade: 100,
    observacoes: '',
    ativo: true
  });

  const tiposAjuste = [
    { value: 'PERCENTUAL', label: 'Percentual (%)', desc: 'Aumenta ou reduz por percentual' },
    { value: 'FIXO', label: 'Valor Fixo (R$)', desc: 'Adiciona ou subtrai valor fixo' },
    { value: 'SUBSTITUIR', label: 'Substituir Preço', desc: 'Define preço específico' }
  ];

  useEffect(() => {
    carregarTabelas();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modoEdicao
        ? `/api/tabelas-precos/cadastro/${formData.id}`
        : '/api/tabelas-precos/cadastro';

      const response = await fetch(url, {
        method: modoEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        carregarTabelas();
        setMostrarModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar tabela:', error);
    }
  };

  const handleEditar = (tabela) => {
    setFormData({
      ...tabela,
      data_inicio: tabela.data_inicio?.split('T')[0] || '',
      data_fim: tabela.data_fim?.split('T')[0] || ''
    });
    setModoEdicao(true);
    setMostrarModal(true);
  };

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir esta tabela de preços?')) return;

    try {
      const response = await fetch(`/api/tabelas-precos/cadastro/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        carregarTabelas();
      }
    } catch (error) {
      console.error('Erro ao excluir tabela:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: '',
      descricao: '',
      tipo_ajuste: 'PERCENTUAL',
      valor_ajuste: 0,
      data_inicio: '',
      data_fim: '',
      prioridade: 100,
      observacoes: '',
      ativo: true
    });
    setModoEdicao(false);
  };

  const handleNovo = () => {
    resetForm();
    setMostrarModal(true);
  };

  const calcularPrecoExemplo = () => {
    const precoBase = 100;
    const ajuste = parseFloat(formData.valor_ajuste) || 0;

    switch (formData.tipo_ajuste) {
      case 'PERCENTUAL':
        return precoBase + (precoBase * ajuste / 100);
      case 'FIXO':
        return precoBase + ajuste;
      case 'SUBSTITUIR':
        return ajuste;
      default:
        return precoBase;
    }
  };

  const tabelasFiltradas = tabelas.filter(tabela => {
    const matchPesquisa = termoPesquisa === '' ||
      tabela.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      tabela.descricao?.toLowerCase().includes(termoPesquisa.toLowerCase());

    const matchStatus = filtroStatus === 'TODOS' ||
      (filtroStatus === 'ATIVO' && tabela.ativo) ||
      (filtroStatus === 'INATIVO' && !tabela.ativo);

    return matchPesquisa && matchStatus;
  }).sort((a, b) => b.prioridade - a.prioridade);

  const getTipoAjusteLabel = (tipo) => {
    return tiposAjuste.find(t => t.value === tipo)?.label || tipo;
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout screenCode="TAB-001">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Pesquisar
              </label>
              <input
                type="text"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                placeholder="Buscar por nome ou descrição..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">Todos</option>
                <option value="ATIVO">✅ Ativos</option>
                <option value="INATIVO">⛔ Inativos</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleNovo}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                ➕ Nova Tabela
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabela</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ajuste</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigência</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tabelasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {termoPesquisa || filtroStatus !== 'TODOS'
                        ? '🔍 Nenhuma tabela encontrada'
                        : '📋 Nenhuma tabela cadastrada. Clique em "Nova Tabela" para começar.'}
                    </td>
                  </tr>
                ) : (
                  tabelasFiltradas.map((tabela) => (
                    <tr key={tabela.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-sm font-bold bg-orange-100 text-orange-800 rounded-full">
                          {tabela.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{tabela.nome}</div>
                        {tabela.descricao && (
                          <div className="text-sm text-gray-500">{tabela.descricao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getTipoAjusteLabel(tabela.tipo_ajuste)}
                        </div>
                        <div className={`text-sm font-semibold ${
                          tabela.valor_ajuste > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tabela.tipo_ajuste === 'PERCENTUAL' && (
                            `${tabela.valor_ajuste > 0 ? '+' : ''}${tabela.valor_ajuste}%`
                          )}
                          {tabela.tipo_ajuste === 'FIXO' && (
                            `R$ ${tabela.valor_ajuste > 0 ? '+' : ''}${tabela.valor_ajuste.toFixed(2)}`
                          )}
                          {tabela.tipo_ajuste === 'SUBSTITUIR' && (
                            `R$ ${tabela.valor_ajuste.toFixed(2)}`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tabela.data_inicio && formatarData(tabela.data_inicio)}
                        {tabela.data_fim && ` até ${formatarData(tabela.data_fim)}`}
                        {!tabela.data_inicio && !tabela.data_fim && '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tabela.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tabela.ativo ? '✅ Ativo' : '⛔ Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditar(tabela)}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(tabela.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Cadastro/Edição */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modoEdicao ? '✏️ Editar Tabela' : '➕ Nova Tabela'}
                  </h2>
                  <button
                    onClick={() => { setMostrarModal(false); resetForm(); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: Varejo, Atacado, Promocional..."
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Descrição opcional..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ajuste *</label>
                    <select
                      required
                      value={formData.tipo_ajuste}
                      onChange={(e) => setFormData({...formData, tipo_ajuste: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {tiposAjuste.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label} - {tipo.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.valor_ajuste}
                      onChange={(e) => setFormData({...formData, valor_ajuste: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <input
                      type="text"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Informações adicionais..."
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Tabela ativa</span>
                    </label>
                  </div>
                </div>

                {formData.valor_ajuste !== 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">📊 Preview - Preço Base R$ 100,00</h4>
                    <div className="text-lg font-bold text-blue-900">
                      Preço Final: R$ {calcularPrecoExemplo().toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setMostrarModal(false); resetForm(); }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {modoEdicao ? '💾 Salvar' : '➕ Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Ajuda - versão resumida */}
        {mostrarAjuda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">❓ Ajuda - Tabelas de Preços</h2>
                  <button onClick={() => setMostrarAjuda(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 O que são Tabelas de Preços?</h3>
                  <p className="text-gray-700">
                    Permitem definir diferentes preços para os mesmos produtos/serviços baseados em critérios
                    como cliente, volume, período ou qualquer outra regra de negócio.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Tipos de Ajuste</h3>
                  <div className="space-y-2">
                    {tiposAjuste.map(tipo => (
                      <div key={tipo.value} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{tipo.label}</div>
                        <p className="text-sm text-gray-600">{tipo.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">💡 Dicas</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Use prioridades para controlar qual tabela tem preferência</li>
                    <li>Defina período de vigência para promoções temporárias</li>
                    <li>O preview mostra o impacto do ajuste em tempo real</li>
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
