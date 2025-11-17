'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function ObjetivosTrimestraisPage() {
  const anoAtual = new Date().getFullYear();
  const trimestreAtual = Math.ceil((new Date().getMonth() + 1) / 3);

  const [ano, setAno] = useState(anoAtual);
  const [trimestre, setTrimestre] = useState(trimestreAtual);
  const [objetivos, setObjetivos] = useState([]);
  const [planoContas, setPlanoContas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    plano_conta_id: '',
    tipo_conta: 'RECEITA',
    valor_objetivo: '',
    descricao: ''
  });

  useEffect(() => {
    carregarObjetivos();
    carregarPlanoContas();
  }, [ano, trimestre]);

  const carregarObjetivos = async () => {
    try {
      const response = await fetch(
        `/api/objetivos/trimestrais?ano=${ano}&trimestre=${trimestre}`
      );
      if (response.ok) {
        const data = await response.json();
        setObjetivos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
    }
  };

  const carregarPlanoContas = async () => {
    try {
      const response = await fetch('/api/plano-contas?utilizado_objetivo=true&status=ATIVO');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setPlanoContas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar plano de contas:', error);
    }
  };

  const abrirModal = () => {
    setFormData({
      plano_conta_id: '',
      tipo_conta: 'RECEITA',
      valor_objetivo: '',
      descricao: ''
    });
    setShowModal(true);
  };

  const salvar = async (e) => {
    e.preventDefault();

    if (!formData.plano_conta_id || !formData.valor_objetivo) {
      setMensagem({ tipo: 'error', texto: 'Preencha todos os campos obrigatórios' });
      return;
    }

    try {
      const response = await fetch('/api/objetivos/trimestrais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ano,
          trimestre
        })
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Objetivo criado com sucesso!' });
        setTimeout(() => {
          setShowModal(false);
          setMensagem(null);
          carregarObjetivos();
        }, 1500);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao salvar' });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar objetivo' });
    }
  };

  const excluir = async (id) => {
    if (!confirm('Deseja excluir este objetivo?')) return;

    try {
      const response = await fetch(`/api/objetivos/trimestrais?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Objetivo excluído!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarObjetivos();
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir' });
    }
  };

  return (
    <DashboardLayout screenCode="OBJ-001" title="Objetivos Trimestrais">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Objetivos Trimestrais</h1>
            <p className="text-gray-600 mt-1">Defina metas para receitas e despesas</p>
          </div>
          <button
            onClick={abrirModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            ➕ Novo Objetivo
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {[anoAtual - 1, anoAtual, anoAtual + 1].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trimestre
              </label>
              <select
                value={trimestre}
                onChange={(e) => setTrimestre(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value={1}>1º Trimestre (Jan-Mar)</option>
                <option value={2}>2º Trimestre (Abr-Jun)</option>
                <option value={3}>3º Trimestre (Jul-Set)</option>
                <option value={4}>4º Trimestre (Out-Dez)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {mensagem && !showModal && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Conta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Valor Objetivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {objetivos.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{obj.conta_codigo}</div>
                    <div className="text-gray-500">{obj.conta_nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      obj.tipo_conta === 'RECEITA'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {obj.tipo_conta}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                    {Number(obj.valor_objetivo).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {obj.descricao || '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => excluir(obj.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {objetivos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum objetivo cadastrado para este período
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">
                Novo Objetivo - {ano} / {trimestre}º Trimestre
              </h2>

              {mensagem && (
                <div className={`mb-4 p-4 rounded-lg ${
                  mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {mensagem.texto}
                </div>
              )}

              <form onSubmit={salvar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conta *
                  </label>
                  <select
                    value={formData.plano_conta_id}
                    onChange={(e) => setFormData({...formData, plano_conta_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Selecione uma conta</option>
                    {planoContas.map(conta => (
                      <option key={conta.id} value={conta.id}>
                        {conta.codigo} - {conta.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    value={formData.tipo_conta}
                    onChange={(e) => setFormData({...formData, tipo_conta: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="RECEITA">Receita (meta: aumentar)</option>
                    <option value="DESPESA">Despesa (meta: reduzir)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Objetivo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_objetivo}
                    onChange={(e) => setFormData({...formData, valor_objetivo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Criar Objetivo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
