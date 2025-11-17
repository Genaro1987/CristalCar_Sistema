'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function IndicadoresCustomizaveisPage() {
  const [indicadores, setIndicadores] = useState([]);
  const [filteredIndicadores, setFilteredIndicadores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    formula: '',
    unidade: 'VALOR',
    categoria: '',
    ativo: true
  });

  const categorias = ['RENTABILIDADE', 'COMERCIAL', 'FINANCEIRO', 'OPERACIONAL', 'RH'];
  const unidades = [
    { value: 'VALOR', label: 'Valor (R$)' },
    { value: 'PERCENTUAL', label: 'Percentual (%)' },
    { value: 'INTEIRO', label: 'Número Inteiro' },
    { value: 'DECIMAL', label: 'Número Decimal' }
  ];

  useEffect(() => {
    carregarIndicadores();
  }, []);

  useEffect(() => {
    filtrarIndicadores();
  }, [searchTerm, categoriaFiltro, indicadores]);

  const carregarIndicadores = async () => {
    try {
      const response = await fetch('/api/indicadores/customizaveis');
      if (response.ok) {
        const data = await response.json();
        setIndicadores(Array.isArray(data) ? data : []);
      } else {
        setIndicadores([]);
      }
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
      setIndicadores([]);
    }
  };

  const filtrarIndicadores = () => {
    let filtered = indicadores;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ind =>
        ind.nome?.toLowerCase().includes(term) ||
        ind.codigo?.toLowerCase().includes(term) ||
        ind.descricao?.toLowerCase().includes(term) ||
        ind.formula?.toLowerCase().includes(term)
      );
    }

    if (categoriaFiltro) {
      filtered = filtered.filter(ind => ind.categoria === categoriaFiltro);
    }

    setFilteredIndicadores(filtered);
  };

  const abrirModal = (indicador = null) => {
    if (indicador) {
      setEditandoId(indicador.id);
      setFormData({
        nome: indicador.nome || '',
        descricao: indicador.descricao || '',
        formula: indicador.formula || '',
        unidade: indicador.unidade || 'VALOR',
        categoria: indicador.categoria || '',
        ativo: indicador.ativo !== 0
      });
    } else {
      setEditandoId(null);
      setFormData({
        nome: '',
        descricao: '',
        formula: '',
        unidade: 'VALOR',
        categoria: '',
        ativo: true
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditandoId(null);
    setMensagem(null);
  };

  const salvar = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.formula) {
      setMensagem({ tipo: 'error', texto: 'Preencha os campos obrigatórios' });
      return;
    }

    try {
      const url = editandoId
        ? '/api/indicadores/customizaveis'
        : '/api/indicadores/customizaveis';

      const method = editandoId ? 'PUT' : 'POST';
      const body = editandoId
        ? { ...formData, id: editandoId }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setMensagem({
          tipo: 'success',
          texto: `Indicador ${editandoId ? 'atualizado' : 'criado'} com sucesso!`
        });
        setTimeout(() => {
          fecharModal();
          carregarIndicadores();
        }, 1500);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao salvar' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar indicador' });
    }
  };

  const excluir = async (id) => {
    if (!confirm('Deseja realmente excluir este indicador?')) return;

    try {
      const response = await fetch(`/api/indicadores/customizaveis?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Indicador excluído com sucesso!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarIndicadores();
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao excluir' });
        setTimeout(() => setMensagem(null), 5000);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir indicador' });
      setTimeout(() => setMensagem(null), 5000);
    }
  };

  const toggleAtivo = async (ind) => {
    try {
      const response = await fetch('/api/indicadores/customizaveis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ind.id,
          ativo: !ind.ativo
        })
      });

      if (response.ok) {
        carregarIndicadores();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <DashboardLayout screenCode="IND-001" title="Indicadores Customizáveis">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Indicadores Customizáveis</h1>
            <p className="text-gray-600 mt-1">Crie fórmulas personalizadas para análise</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            ➕ Novo Indicador
          </button>
        </div>

        {/* Mensagens */}
        {mensagem && !showModal && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Código, nome, descrição ou fórmula..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fórmula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIndicadores.map((ind) => (
                <tr key={ind.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ind.codigo}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{ind.nome}</div>
                    {ind.descricao && (
                      <div className="text-xs text-gray-500">{ind.descricao}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {ind.formula}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {ind.unidade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ind.categoria || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleAtivo(ind)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        ind.ativo
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {ind.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => abrirModal(ind)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => excluir(ind.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredIndicadores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum indicador encontrado
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editandoId ? 'Editar Indicador' : 'Novo Indicador'}
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
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
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
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fórmula *
                  </label>
                  <textarea
                    value={formData.formula}
                    onChange={(e) => setFormData({...formData, formula: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    rows={3}
                    placeholder="Ex: (LUCRO_LIQUIDO / RECEITA_BRUTA) * 100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use nomes de variáveis, operadores (+, -, *, /) e funções (SUM, AVG, etc)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidade
                    </label>
                    <select
                      value={formData.unidade}
                      onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {unidades.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sem categoria</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="ativo" className="text-sm text-gray-700">
                    Indicador ativo
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    {editandoId ? 'Atualizar' : 'Criar'}
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
