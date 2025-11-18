'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function TiposDREListaPage() {
  const router = useRouter();
  const [tiposDRE, setTiposDRE] = useState([]);
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'PERSONALIZADO'
  });

  useEffect(() => {
    carregarTiposDRE();
  }, []);

  useEffect(() => {
    filtrarTipos();
  }, [searchTerm, tiposDRE]);

  const carregarTiposDRE = async () => {
    try {
      const response = await fetch('/api/modelos-plano/tipos-dre');
      if (response.ok) {
        const data = await response.json();
        setTiposDRE(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos DRE:', error);
    }
  };

  const filtrarTipos = () => {
    if (!searchTerm) {
      setFilteredTipos(tiposDRE);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tiposDRE.filter(tipo =>
      tipo.nome?.toLowerCase().includes(term) ||
      tipo.codigo?.toLowerCase().includes(term) ||
      tipo.descricao?.toLowerCase().includes(term)
    );

    setFilteredTipos(filtered);
  };

  const abrirModal = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'PERSONALIZADO'
    });
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setMensagem(null);
  };

  const salvar = async (e) => {
    e.preventDefault();

    if (!formData.nome) {
      setMensagem({ tipo: 'error', texto: 'Nome é obrigatório' });
      return;
    }

    try {
      const response = await fetch('/api/modelos-plano/tipos-dre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMensagem({
          tipo: 'success',
          texto: 'Tipo DRE criado com sucesso!'
        });
        setTimeout(() => {
          fecharModal();
          carregarTiposDRE();
        }, 1500);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao salvar' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar tipo DRE' });
    }
  };

  const excluir = async (tipo) => {
    if (!tipo.editavel) {
      alert('Tipos DRE fixos não podem ser excluídos');
      return;
    }

    if (!confirm(`Deseja realmente excluir "${tipo.nome}"?`)) return;

    try {
      const response = await fetch(`/api/modelos-plano/tipos-dre?id=${tipo.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Tipo DRE excluído com sucesso!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarTiposDRE();
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao excluir' });
        setTimeout(() => setMensagem(null), 5000);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir tipo DRE' });
      setTimeout(() => setMensagem(null), 5000);
    }
  };

  const editarEstrutura = (tipo) => {
    router.push(`/modules/modelos-plano/estrutura-dre-editor?tipo_id=${tipo.id}`);
  };

  return (
    <DashboardLayout screenCode="DRE-001" title="Tipos de DRE">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tipos de DRE</h1>
            <p className="text-gray-600 mt-1">Gerencie os modelos de Demonstração de Resultado</p>
          </div>
          <button
            onClick={abrirModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ➕ Novo Tipo DRE
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

        {/* Lista de Tipos DRE */}
        <div className="space-y-4">
          {/* Tipos Padrão (Fixos) */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Modelos Padrão</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredTipos.filter(t => !t.editavel).map((tipo) => (
                <div key={tipo.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">{tipo.nome}</h4>
                    {tipo.descricao && (
                      <p className="text-sm text-gray-600 mt-1">{tipo.descricao}</p>
                    )}
                  </div>
                  <button
                    onClick={() => editarEstrutura(tipo)}
                    className="ml-4 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    📊 Ver Estrutura
                  </button>
                </div>
              ))}
              {filteredTipos.filter(t => !t.editavel).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum modelo padrão encontrado
                </div>
              )}
            </div>
          </div>

          {/* Tipos Personalizados */}
          {filteredTipos.filter(t => t.editavel).length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 px-6 py-3 border-b border-blue-200">
                <h3 className="text-sm font-semibold text-blue-700 uppercase">Modelos Personalizados</h3>
              </div>
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
                  {filteredTipos.filter(t => t.editavel).map((tipo) => (
                    <tr key={tipo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tipo.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tipo.nome}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tipo.descricao || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => editarEstrutura(tipo)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          📊 Estrutura
                        </button>
                        <button
                          onClick={() => excluir(tipo)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredTipos.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Nenhum tipo DRE encontrado
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Novo Tipo DRE</h2>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
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
                    Criar
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
