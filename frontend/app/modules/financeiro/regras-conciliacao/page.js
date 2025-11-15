'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import HelpButton from '@/app/components/ui/HelpButton';
import { helpContents } from '@/app/utils/helpContent';

export default function RegrasConciliacaoPage() {
  const [regras, setRegras] = useState([]);
  const [planoContas, setPlanoContas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    descricao: '',
    tipo_operacao: 'AMBOS',
    tipo_regra: 'CONTEM',
    texto_busca: '',
    conta_id: '',
    historico_padrao: '',
    aplicacao_automatica: true,
    prioridade: 100,
    observacoes: '',
    ativo: true
  });

  const tiposOperacao = [
    { value: 'DEBITO', label: 'Débito', icon: '🔴', color: 'text-red-600' },
    { value: 'CREDITO', label: 'Crédito', icon: '🟢', color: 'text-green-600' },
    { value: 'AMBOS', label: 'Ambos', icon: '🔵', color: 'text-blue-600' }
  ];

  const tiposRegra = [
    { value: 'CONTEM', label: 'Contém', desc: 'O texto aparece em qualquer parte da descrição', exemplo: 'PAGTO PIX' },
    { value: 'COMECA_COM', label: 'Começa com', desc: 'A descrição inicia com o texto', exemplo: 'PIX RECEBIDO' },
    { value: 'TERMINA_COM', label: 'Termina com', desc: 'A descrição termina com o texto', exemplo: 'ENERGIA ELETRICA' },
    { value: 'IGUAL', label: 'Igual', desc: 'A descrição é exatamente igual ao texto', exemplo: 'TED' },
    { value: 'REGEX', label: 'Expressão Regular', desc: 'Usa padrão regex avançado', exemplo: '^PIX.*\\d{11}$' }
  ];

  useEffect(() => {
    carregarRegras();
    carregarPlanoContas();
  }, []);

  const carregarRegras = async () => {
    try {
      const response = await fetch('/api/financeiro/regras-conciliacao');
      if (response.ok) {
        const data = await response.json();
        setRegras(data);
      }
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
    }
  };

  const carregarPlanoContas = async () => {
    try {
      const response = await fetch('/api/modelos-plano/plano-contas');
      if (response.ok) {
        const data = await response.json();
        setPlanoContas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar plano de contas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modoEdicao
        ? `/api/financeiro/regras-conciliacao/${formData.id}`
        : '/api/financeiro/regras-conciliacao';

      const response = await fetch(url, {
        method: modoEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        carregarRegras();
        setMostrarModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar regra:', error);
    }
  };

  const handleEditar = (regra) => {
    setFormData(regra);
    setModoEdicao(true);
    setMostrarModal(true);
  };

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir esta regra de conciliação?')) return;

    try {
      const response = await fetch(`/api/financeiro/regras-conciliacao/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        carregarRegras();
      }
    } catch (error) {
      console.error('Erro ao excluir regra:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: '',
      descricao: '',
      tipo_operacao: 'AMBOS',
      tipo_regra: 'CONTEM',
      texto_busca: '',
      conta_id: '',
      historico_padrao: '',
      aplicacao_automatica: true,
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

  const testarRegra = () => {
    const textoTeste = prompt('Digite o texto para testar a regra:');
    if (!textoTeste) return;

    let resultado = false;
    const texto = textoTeste.toLowerCase();
    const busca = formData.texto_busca.toLowerCase();

    switch (formData.tipo_regra) {
      case 'CONTEM':
        resultado = texto.includes(busca);
        break;
      case 'COMECA_COM':
        resultado = texto.startsWith(busca);
        break;
      case 'TERMINA_COM':
        resultado = texto.endsWith(busca);
        break;
      case 'IGUAL':
        resultado = texto === busca;
        break;
      case 'REGEX':
        try {
          const regex = new RegExp(formData.texto_busca, 'i');
          resultado = regex.test(textoTeste);
        } catch (e) {
          alert('Erro na expressão regular: ' + e.message);
          return;
        }
        break;
    }

    alert(resultado
      ? '✅ A regra CORRESPONDE ao texto informado!'
      : '❌ A regra NÃO corresponde ao texto informado.'
    );
  };

  // Filtrar regras
  const regrasFiltradas = regras.filter(regra => {
    const matchPesquisa = termoPesquisa === '' ||
      regra.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      regra.texto_busca.toLowerCase().includes(termoPesquisa.toLowerCase());

    const matchTipo = filtroTipo === 'TODOS' || regra.tipo_operacao === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' ||
      (filtroStatus === 'ATIVO' && regra.ativo) ||
      (filtroStatus === 'INATIVO' && !regra.ativo);

    return matchPesquisa && matchTipo && matchStatus;
  }).sort((a, b) => b.prioridade - a.prioridade);

  const getTipoOperacaoIcon = (tipo) => {
    return tiposOperacao.find(t => t.value === tipo)?.icon || '🔵';
  };

  const getTipoOperacaoLabel = (tipo) => {
    return tiposOperacao.find(t => t.value === tipo)?.label || tipo;
  };

  const getTipoRegraLabel = (tipo) => {
    return tiposRegra.find(t => t.value === tipo)?.label || tipo;
  };

  const getContaNome = (contaId) => {
    const conta = planoContas.find(c => c.id === contaId);
    return conta ? `${conta.codigo_conta} - ${conta.descricao}` : '-';
  };

  return (
    <DashboardLayout screenCode="FIN-013">
      <div className="space-y-6">
        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Pesquisar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={termoPesquisa}
                  onChange={(e) => setTermoPesquisa(e.target.value)}
                  placeholder="Buscar por nome ou texto de busca..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <HelpButton helpContent={helpContents['FIN-013']} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Operação
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">Todos os Tipos</option>
                {tiposOperacao.map(tipo => (
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
                ➕ Nova Regra
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Regras */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Regra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Operação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Conta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Modo
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
                {regrasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      {termoPesquisa || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS'
                        ? '🔍 Nenhuma regra encontrada com os filtros aplicados'
                        : '📋 Nenhuma regra cadastrada. Clique em "Nova Regra" para começar.'}
                    </td>
                  </tr>
                ) : (
                  regrasFiltradas.map((regra) => (
                    <tr key={regra.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="px-3 py-1 text-sm font-bold bg-orange-100 text-orange-800 rounded-full">
                            {regra.prioridade}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{regra.nome}</div>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {getTipoRegraLabel(regra.tipo_regra)}: "{regra.texto_busca}"
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getTipoRegraLabel(regra.tipo_regra)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">
                          {getTipoOperacaoIcon(regra.tipo_operacao)} {getTipoOperacaoLabel(regra.tipo_operacao)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getContaNome(regra.conta_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          regra.aplicacao_automatica
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {regra.aplicacao_automatica ? '⚡ Automático' : '💡 Sugestão'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          regra.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {regra.ativo ? '✅ Ativo' : '⛔ Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditar(regra)}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(regra.id)}
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
                    {modoEdicao ? '✏️ Editar Regra' : '➕ Nova Regra'}
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
                      Nome da Regra *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: PIX recebidos, Energia Elétrica, Aluguel..."
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
                      placeholder="Descrição detalhada da regra..."
                    />
                  </div>

                  {/* Tipo de Regra */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Regra *
                    </label>
                    <select
                      required
                      value={formData.tipo_regra}
                      onChange={(e) => setFormData({...formData, tipo_regra: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {tiposRegra.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label} - {tipo.desc}
                        </option>
                      ))}
                    </select>
                    {formData.tipo_regra && (
                      <p className="text-xs text-gray-500 mt-1">
                        Exemplo: {tiposRegra.find(t => t.value === formData.tipo_regra)?.exemplo}
                      </p>
                    )}
                  </div>

                  {/* Texto de Busca */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texto de Busca *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.texto_busca}
                        onChange={(e) => setFormData({...formData, texto_busca: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
                        placeholder="Digite o padrão a ser buscado..."
                      />
                      <button
                        type="button"
                        onClick={testarRegra}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        🧪 Testar
                      </button>
                    </div>
                  </div>

                  {/* Tipo de Operação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Operação *
                    </label>
                    <select
                      required
                      value={formData.tipo_operacao}
                      onChange={(e) => setFormData({...formData, tipo_operacao: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {tiposOperacao.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.icon} {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prioridade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="999"
                      value={formData.prioridade}
                      onChange={(e) => setFormData({...formData, prioridade: parseInt(e.target.value) || 100})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maior número = maior prioridade</p>
                  </div>

                  {/* Conta */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conta do Plano de Contas *
                    </label>
                    <select
                      required
                      value={formData.conta_id}
                      onChange={(e) => setFormData({...formData, conta_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecione a conta...</option>
                      {planoContas.map(conta => (
                        <option key={conta.id} value={conta.id}>
                          {conta.codigo_conta} - {conta.descricao}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Histórico Padrão */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Histórico Padrão
                    </label>
                    <input
                      type="text"
                      value={formData.historico_padrao}
                      onChange={(e) => setFormData({...formData, historico_padrao: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Histórico que será sugerido para esta transação..."
                    />
                  </div>

                  {/* Aplicação Automática */}
                  <div className="md:col-span-2">
                    <label className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <input
                        type="checkbox"
                        checked={formData.aplicacao_automatica}
                        onChange={(e) => setFormData({...formData, aplicacao_automatica: e.target.checked})}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">
                          ⚡ Aplicação Automática
                        </span>
                        <p className="text-xs text-gray-600">
                          Quando ativado, a regra será aplicada automaticamente. Quando desativado, será apenas uma sugestão.
                        </p>
                      </div>
                    </label>
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
                      placeholder="Informações adicionais sobre esta regra..."
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
                      <span className="ml-2 text-sm text-gray-700">Regra ativa</span>
                    </label>
                  </div>
                </div>

                {/* Preview da Regra */}
                {formData.texto_busca && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">📋 Preview da Regra</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Quando:</strong> A descrição {getTipoRegraLabel(formData.tipo_regra).toLowerCase()} "{formData.texto_busca}"</div>
                      <div><strong>E for:</strong> {getTipoOperacaoLabel(formData.tipo_operacao)}</div>
                      <div><strong>Então:</strong> {formData.aplicacao_automatica ? 'Classificar automaticamente' : 'Sugerir classificação'}</div>
                      <div><strong>Na conta:</strong> {getContaNome(formData.conta_id)}</div>
                      {formData.historico_padrao && (
                        <div><strong>Com histórico:</strong> {formData.historico_padrao}</div>
                      )}
                    </div>
                  </div>
                )}

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
                    {modoEdicao ? '💾 Salvar Alterações' : '➕ Cadastrar Regra'}
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
                  <h2 className="text-xl font-bold text-gray-900">❓ Ajuda - Regras de Conciliação</h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 O que são Regras de Conciliação?</h3>
                  <p className="text-gray-700">
                    As regras de conciliação automatizam a classificação de transações bancárias importadas.
                    Quando uma transação é importada, o sistema compara sua descrição com as regras cadastradas
                    e classifica automaticamente ou sugere a classificação correta.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Tipos de Regras</h3>
                  <div className="space-y-2">
                    {tiposRegra.map(tipo => (
                      <div key={tipo.value} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{tipo.label}</div>
                        <p className="text-sm text-gray-600">{tipo.desc}</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">Exemplo: {tipo.exemplo}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">⚡ Aplicação Automática vs Sugestão</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-900">⚡ Aplicação Automática</div>
                      <p className="text-sm text-gray-700">
                        A regra classifica a transação automaticamente, sem necessidade de confirmação manual.
                        Use para transações recorrentes e previsíveis.
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="font-medium text-yellow-900">💡 Sugestão</div>
                      <p className="text-sm text-gray-700">
                        O sistema sugere a classificação, mas você precisa confirmar antes de aplicar.
                        Use quando houver dúvida ou para transações que precisam de revisão.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔢 Prioridade</h3>
                  <p className="text-gray-700">
                    Quando múltiplas regras correspondem a uma mesma transação, a regra com maior
                    prioridade (número maior) é aplicada primeiro. Configure prioridades para
                    garantir a ordem correta de aplicação.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Exemplos Práticos</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-900">PIX Recebidos</div>
                      <p className="text-sm text-gray-700">
                        Tipo: Contém | Texto: "PIX RECEBIDO" | Operação: Crédito | Conta: Receitas &gt; Vendas
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-900">Energia Elétrica</div>
                      <p className="text-sm text-gray-700">
                        Tipo: Contém | Texto: "ENERGIA" | Operação: Débito | Conta: Despesas &gt; Utilidades
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-900">Aluguel</div>
                      <p className="text-sm text-gray-700">
                        Tipo: Igual | Texto: "ALUGUEL" | Operação: Débito | Conta: Despesas &gt; Aluguel
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🧪 Testando Regras</h3>
                  <p className="text-gray-700">
                    Use o botão "Testar" ao criar ou editar uma regra para verificar se ela
                    corresponde a um texto específico. Isso ajuda a validar se a regra está
                    configurada corretamente antes de salvá-la.
                  </p>
                </section>

                <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">⚠️ Dicas Importantes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Crie regras específicas antes de regras genéricas</li>
                    <li>Use prioridades maiores para regras mais específicas</li>
                    <li>Teste suas regras antes de ativá-las</li>
                    <li>Revise periodicamente as transações não classificadas</li>
                    <li>Crie novas regras baseadas em padrões recorrentes</li>
                    <li>Use expressões regulares apenas quando necessário</li>
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
