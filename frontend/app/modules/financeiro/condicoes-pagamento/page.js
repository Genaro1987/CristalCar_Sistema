'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function CondicoesPagamentoPage() {
  const [condicoes, setCondicoes] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [mensagem, setMensagem] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    descricao: '',
    tipo: 'A_VISTA',
    forma_pagamento_id: '',
    qtd_parcelas: 1,
    dias_primeira_parcela: 0,
    dias_entre_parcelas: 30,
    acrescimo_percentual: 0,
    desconto_percentual: 0,
    observacoes: '',
    ativo: true
  });

  const tiposCondicao = [
    { value: 'A_VISTA', label: 'À Vista', icon: '⚡' },
    { value: 'A_PRAZO', label: 'A Prazo', icon: '📅' },
    { value: 'PARCELADO', label: 'Parcelado', icon: '🔢' }
  ];

  useEffect(() => {
    carregarCondicoes();
    carregarFormasPagamento();
  }, []);

  const carregarCondicoes = async () => {
    try {
      const response = await fetch('/api/financeiro/condicoes-pagamento');
      if (response.ok) {
        const data = await response.json();
        const normalizadas = (data || []).map((item) => ({
          ...item,
          ativo: item.ativo === 1 || item.ativo === true || item.status === 'ATIVO'
        }));
        setCondicoes(normalizadas);
      }
    } catch (error) {
      console.error('Erro ao carregar condições:', error);
    }
  };

  const carregarFormasPagamento = async () => {
    try {
      const response = await fetch('/api/financeiro/formas-pagamento');
      if (response.ok) {
        const data = await response.json();
        const normalizadas = (data || []).map((item) => ({
          ...item,
          ativo: item.ativo === 1 || item.ativo === true || item.status === 'ATIVO'
        }));
        setFormasPagamento(normalizadas.filter(f => f.ativo));
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.forma_pagamento_id) {
      setMensagem({ tipo: 'error', texto: 'Selecione uma forma de pagamento para vincular à condição.' });
      return;
    }

    try {
      const url = modoEdicao
        ? `/api/financeiro/condicoes-pagamento/${formData.id}`
        : '/api/financeiro/condicoes-pagamento';

      const payload = {
        ...formData,
        forma_pagamento_id: formData.forma_pagamento_id ? Number(formData.forma_pagamento_id) : null,
      };

      const response = await fetch(url, {
        method: modoEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        carregarCondicoes();
        setMostrarModal(false);
        resetForm();
        setMensagem({ tipo: 'success', texto: 'Condição salva com sucesso.' });
      }
    } catch (error) {
      console.error('Erro ao salvar condição:', error);
      setMensagem({ tipo: 'error', texto: 'Não foi possível salvar a condição de pagamento.' });
    }
  };

  const handleEditar = (condicao) => {
    setFormData(condicao);
    setModoEdicao(true);
    setMostrarModal(true);
  };

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir esta condição de pagamento?')) return;

    try {
      const response = await fetch(`/api/financeiro/condicoes-pagamento/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        carregarCondicoes();
      }
    } catch (error) {
      console.error('Erro ao excluir condição:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: '',
      descricao: '',
      tipo: 'A_VISTA',
      forma_pagamento_id: '',
      qtd_parcelas: 1,
      dias_primeira_parcela: 0,
      dias_entre_parcelas: 30,
      acrescimo_percentual: 0,
      desconto_percentual: 0,
      observacoes: '',
      ativo: true
    });
    setModoEdicao(false);
  };

  const handleNovo = () => {
    resetForm();
    setMostrarModal(true);
  };

  // Filtrar condições baseado na pesquisa e filtros
  const condicoesFiltradas = condicoes.filter(condicao => {
    const matchPesquisa = termoPesquisa === '' ||
      condicao.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      condicao.descricao?.toLowerCase().includes(termoPesquisa.toLowerCase());

    const matchTipo = filtroTipo === 'TODOS' || condicao.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' ||
      (filtroStatus === 'ATIVO' && condicao.ativo) ||
      (filtroStatus === 'INATIVO' && !condicao.ativo);

    return matchPesquisa && matchTipo && matchStatus;
  });

  const getTipoIcon = (tipo) => {
    return tiposCondicao.find(t => t.value === tipo)?.icon || '💰';
  };

  const getTipoLabel = (tipo) => {
    return tiposCondicao.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <DashboardLayout screenCode="FIN-011">
      <div className="space-y-6">
        {mensagem && (
          <div className={`p-4 rounded-lg ${mensagem.tipo === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {mensagem.texto}
          </div>
        )}

        {/* Barra de Pesquisa e Filtros */}
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
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">Todos os Tipos</option>
                {tiposCondicao.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </select>
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
                ➕ Nova Condição
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Condições */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Condição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Forma Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Parcelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ajustes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {condicoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {termoPesquisa || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS'
                        ? '🔍 Nenhuma condição encontrada com os filtros aplicados'
                        : '📋 Nenhuma condição cadastrada. Clique em "Nova Condição" para começar.'}
                    </td>
                  </tr>
                ) : (
                  condicoesFiltradas.map((condicao) => (
                    <tr key={condicao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{condicao.nome}</div>
                        {condicao.descricao && (
                          <div className="text-sm text-gray-500">{condicao.descricao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">
                          {getTipoIcon(condicao.tipo)} {getTipoLabel(condicao.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formasPagamento.find(f => f.id === condicao.forma_pagamento_id)?.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {condicao.tipo === 'A_VISTA' ? '1x' : `${condicao.qtd_parcelas}x`}
                        {condicao.dias_primeira_parcela > 0 && (
                          <span className="text-gray-500 ml-1">
                            (+{condicao.dias_primeira_parcela}d)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {condicao.desconto_percentual > 0 && (
                          <span className="text-green-600">-{condicao.desconto_percentual}%</span>
                        )}
                        {condicao.acrescimo_percentual > 0 && (
                          <span className="text-red-600">+{condicao.acrescimo_percentual}%</span>
                        )}
                        {condicao.desconto_percentual === 0 && condicao.acrescimo_percentual === 0 && (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          condicao.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {condicao.ativo ? '✅ Ativo' : '⛔ Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditar(condicao)}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(condicao.id)}
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
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modoEdicao ? '✏️ Editar Condição' : '➕ Nova Condição'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Condição *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: À Vista com desconto, 3x sem juros..."
                    />
                  </div>

                  {/* Descrição */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Descrição detalhada da condição..."
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Condição *
                    </label>
                    <select
                      required
                      value={formData.tipo}
                      onChange={(e) => setFormData({
                        ...formData,
                        tipo: e.target.value,
                        qtd_parcelas: e.target.value === 'A_VISTA' ? 1 : formData.qtd_parcelas
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {tiposCondicao.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.icon} {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Forma de Pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de Pagamento *
                    </label>
                    <select
                      required
                      value={formData.forma_pagamento_id}
                      onChange={(e) => setFormData({...formData, forma_pagamento_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecione...</option>
                      {formasPagamento.map(forma => (
                        <option key={forma.id} value={forma.id}>
                          {forma.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Configurações de Parcelamento */}
                  {formData.tipo !== 'A_VISTA' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantidade de Parcelas *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="99"
                          value={formData.qtd_parcelas}
                          onChange={(e) => setFormData({...formData, qtd_parcelas: parseInt(e.target.value) || 1})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dias Entre Parcelas
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.dias_entre_parcelas}
                          onChange={(e) => setFormData({...formData, dias_entre_parcelas: parseInt(e.target.value) || 30})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Dias Primeira Parcela */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dias até Primeira Parcela
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dias_primeira_parcela}
                      onChange={(e) => setFormData({...formData, dias_primeira_parcela: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = Pagamento imediato</p>
                  </div>

                  {/* Desconto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desconto (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.desconto_percentual}
                      onChange={(e) => setFormData({...formData, desconto_percentual: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Acréscimo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acréscimo (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.acrescimo_percentual}
                      onChange={(e) => setFormData({...formData, acrescimo_percentual: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Observações */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Informações adicionais sobre esta condição..."
                    />
                  </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Condição ativa</span>
                  </label>
                </div>
              </div>

              {/* Botões */}
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
                    {modoEdicao ? '💾 Salvar Alterações' : '➕ Cadastrar Condição'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Ajuda */}
        {mostrarAjuda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">❓ Ajuda - Condições de Pagamento</h2>
                  <button
                    onClick={() => setMostrarAjuda(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 O que são Condições de Pagamento?</h3>
                  <p className="text-gray-700">
                    As condições de pagamento definem como o cliente pode pagar pelas compras ou serviços.
                    Você pode configurar diferentes opções como pagamento à vista com desconto, parcelamento
                    sem juros, ou condições personalizadas com prazos específicos.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Tipos de Condições</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">⚡ À Vista</div>
                      <p className="text-sm text-gray-600">
                        Pagamento em parcela única. Ideal para oferecer descontos e incentivar pagamentos imediatos.
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">📅 A Prazo</div>
                      <p className="text-sm text-gray-600">
                        Pagamento único com data futura. Útil para vendas com prazos fixos (30, 60, 90 dias).
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">🔢 Parcelado</div>
                      <p className="text-sm text-gray-600">
                        Pagamento dividido em múltiplas parcelas. Configure a quantidade e o intervalo entre elas.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Configurações Importantes</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>
                      <strong>Quantidade de Parcelas:</strong> Define em quantas vezes o valor será dividido
                    </div>
                    <div>
                      <strong>Dias até Primeira Parcela:</strong> Prazo até o vencimento da primeira parcela (0 = hoje)
                    </div>
                    <div>
                      <strong>Dias Entre Parcelas:</strong> Intervalo entre cada parcela (padrão 30 dias)
                    </div>
                    <div>
                      <strong>Desconto (%):</strong> Percentual de desconto aplicado ao valor total
                    </div>
                    <div>
                      <strong>Acréscimo (%):</strong> Percentual de juros aplicado ao valor total
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Exemplos Práticos</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-900">À vista com 5% de desconto</div>
                      <p className="text-sm text-gray-700">Tipo: À Vista | Desconto: 5% | Dias: 0</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-900">3x sem juros</div>
                      <p className="text-sm text-gray-700">Tipo: Parcelado | Parcelas: 3 | Dias: 30</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-medium text-yellow-900">30/60/90 dias</div>
                      <p className="text-sm text-gray-700">Tipo: Parcelado | Parcelas: 3 | Primeira: 30 | Entre: 30</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Pesquisa e Filtros</h3>
                  <p className="text-gray-700">
                    Use o campo de pesquisa para encontrar condições por nome ou descrição.
                    Os filtros de tipo e status ajudam a visualizar apenas as condições relevantes.
                  </p>
                </section>

                <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">⚠️ Dicas Importantes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Vincule cada condição a uma forma de pagamento específica</li>
                    <li>Use nomes descritivos para facilitar a identificação nas vendas</li>
                    <li>O preview mostra como ficará o parcelamento em um exemplo de R$ 1.000,00</li>
                    <li>Desative condições que não estão mais em uso ao invés de excluí-las</li>
                    <li>Descontos e acréscimos são aplicados sobre o valor total</li>
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
