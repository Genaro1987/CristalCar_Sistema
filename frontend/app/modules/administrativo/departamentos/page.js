'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState([]);
  const [filteredDepartamentos, setFilteredDepartamentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    responsavel_id: '',
    status: 'ATIVO'
  });

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  useEffect(() => {
    filtrarDepartamentos();
  }, [searchTerm, departamentos]);

  const carregarDepartamentos = async () => {
    try {
      const response = await fetch('/api/administrativo/departamentos');
      if (response.ok) {
        const data = await response.json();
        setDepartamentos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  const filtrarDepartamentos = () => {
    if (!searchTerm) {
      setFilteredDepartamentos(departamentos);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = departamentos.filter(dep =>
      dep.codigo?.toLowerCase().includes(term) ||
      dep.nome?.toLowerCase().includes(term) ||
      dep.descricao?.toLowerCase().includes(term)
    );

    setFilteredDepartamentos(filtered);
  };

  const abrirModal = (departamento = null) => {
    if (departamento) {
      setEditandoId(departamento.id);
      setFormData({
        codigo: departamento.codigo || '',
        nome: departamento.nome || '',
        descricao: departamento.descricao || '',
        responsavel_id: departamento.responsavel_id || '',
        status: departamento.status || 'ATIVO'
      });
    } else {
      setEditandoId(null);
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        responsavel_id: '',
        status: 'ATIVO'
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

    if (!formData.nome) {
      setMensagem({ tipo: 'error', texto: 'Nome é obrigatório' });
      return;
    }

    try {
      const url = editandoId
        ? '/api/administrativo/departamentos'
        : '/api/administrativo/departamentos';

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
          texto: `Departamento ${editandoId ? 'atualizado' : 'criado'} com sucesso!`
        });
        setTimeout(() => {
          fecharModal();
          carregarDepartamentos();
        }, 1500);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao salvar' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar departamento' });
    }
  };

  const excluir = async (id) => {
    if (!confirm('Deseja realmente excluir este departamento?')) return;

    try {
      const response = await fetch(`/api/administrativo/departamentos?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Departamento excluído com sucesso!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarDepartamentos();
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao excluir' });
        setTimeout(() => setMensagem(null), 5000);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir departamento' });
      setTimeout(() => setMensagem(null), 5000);
    }
  };

  return (
    <DashboardLayout screenCode="ADM-006" title="Departamentos">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie os departamentos da empresa</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ➕ Novo Departamento
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

        {/* Busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por código, nome ou descrição..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartamentos.map((dep) => (
                <tr key={dep.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dep.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dep.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {dep.descricao || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dep.status === 'ATIVO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => abrirModal(dep)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => excluir(dep.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDepartamentos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum departamento encontrado
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editandoId ? 'Editar Departamento' : 'Novo Departamento'}
              </h2>

              {mensagem && (
                <div className={`mb-4 p-4 rounded-lg ${
                  mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {mensagem.texto}
                </div>
              )}

              <form onSubmit={salvar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código {!editandoId && <span className="text-xs text-gray-500">(auto-gerado se vazio)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={!editandoId ? "DEP-XXX (auto)" : ""}
                      disabled={editandoId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
