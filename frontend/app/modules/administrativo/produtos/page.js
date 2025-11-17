'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [filterFinalidade, setFilterFinalidade] = useState('TODOS');
  const [mensagem, setMensagem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    unidade_medida: 'UN',
    local_estoque: '',
    tipo: 'PRODUTO',
    finalidade: 'AMBOS',
    foto_path: '',
    qtd_minima_estoque: 0,
    status: 'ATIVO'
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    filtrarProdutos();
  }, [searchTerm, filterTipo, filterFinalidade, produtos]);

  const carregarProdutos = async () => {
    try {
      const response = await fetch('/api/administrativo/produtos');
      if (response.ok) {
        const data = await response.json();
        setProdutos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const filtrarProdutos = () => {
    let filtered = [...produtos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prod =>
        prod.codigo?.toLowerCase().includes(term) ||
        prod.nome?.toLowerCase().includes(term) ||
        prod.local_estoque?.toLowerCase().includes(term)
      );
    }

    if (filterTipo !== 'TODOS') {
      filtered = filtered.filter(prod => prod.tipo === filterTipo);
    }

    if (filterFinalidade !== 'TODOS') {
      filtered = filtered.filter(prod => prod.finalidade === filterFinalidade || prod.finalidade === 'AMBOS');
    }

    setFilteredProdutos(filtered);
  };

  const abrirModal = (produto = null) => {
    if (produto) {
      setEditandoId(produto.id);
      setFormData({
        codigo: produto.codigo || '',
        nome: produto.nome || '',
        unidade_medida: produto.unidade_medida || 'UN',
        local_estoque: produto.local_estoque || '',
        tipo: produto.tipo || 'PRODUTO',
        finalidade: produto.finalidade || 'AMBOS',
        foto_path: produto.foto_path || '',
        qtd_minima_estoque: produto.qtd_minima_estoque || 0,
        status: produto.status || 'ATIVO'
      });
    } else {
      setEditandoId(null);
      setFormData({
        codigo: '',
        nome: '',
        unidade_medida: 'UN',
        local_estoque: '',
        tipo: 'PRODUTO',
        finalidade: 'AMBOS',
        foto_path: '',
        qtd_minima_estoque: 0,
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMensagem({ tipo: 'error', texto: 'Por favor, selecione uma imagem válida' });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMensagem({ tipo: 'error', texto: 'Imagem muito grande. Máximo 5MB' });
      return;
    }

    setUploadingImage(true);

    try {
      // Converter para base64 ou fazer upload para servidor
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto_path: reader.result }));
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao fazer upload da imagem' });
      setUploadingImage(false);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();

    if (!formData.nome) {
      setMensagem({ tipo: 'error', texto: 'Nome é obrigatório' });
      return;
    }

    try {
      const url = '/api/administrativo/produtos';
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
          texto: `Produto ${editandoId ? 'atualizado' : 'criado'} com sucesso!`
        });
        setTimeout(() => {
          fecharModal();
          carregarProdutos();
        }, 1500);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao salvar' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar produto' });
    }
  };

  const excluir = async (id) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
      const response = await fetch(`/api/administrativo/produtos?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Produto excluído com sucesso!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarProdutos();
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao excluir' });
        setTimeout(() => setMensagem(null), 5000);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir produto' });
      setTimeout(() => setMensagem(null), 5000);
    }
  };

  const unidadesMedida = [
    { value: 'UN', label: 'Unidade' },
    { value: 'KG', label: 'Quilograma' },
    { value: 'L', label: 'Litro' },
    { value: 'M', label: 'Metro' },
    { value: 'M2', label: 'Metro Quadrado' },
    { value: 'M3', label: 'Metro Cúbico' },
    { value: 'CX', label: 'Caixa' },
    { value: 'PC', label: 'Peça' },
    { value: 'PAR', label: 'Par' },
    { value: 'HR', label: 'Hora' }
  ];

  return (
    <DashboardLayout screenCode="ADM-007" title="Produtos">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastro de Produtos</h1>
            <p className="text-gray-600 mt-1">Gerencie produtos e serviços</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ➕ Novo Produto
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
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por código, nome ou local..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="PRODUTO">Produto</option>
            <option value="SERVICO">Serviço</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterFinalidade}
            onChange={(e) => setFilterFinalidade(e.target.value)}
          >
            <option value="TODOS">Todas as Finalidades</option>
            <option value="VENDA">Venda</option>
            <option value="COMPRA">Compra</option>
            <option value="AMBOS">Ambos</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local Estoque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qtd. Mínima
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProdutos.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prod.foto_path ? (
                      <img
                        src={prod.foto_path}
                        alt={prod.nome}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prod.codigo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prod.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      prod.tipo === 'PRODUTO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {prod.tipo === 'PRODUTO' ? '📦 Produto' : '🔧 Serviço'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prod.unidade_medida || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {prod.local_estoque || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prod.qtd_minima_estoque || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => abrirModal(prod)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => excluir(prod.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProdutos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto encontrado
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editandoId ? 'Editar Produto' : 'Novo Produto'}
                </h2>

                {mensagem && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {mensagem.texto}
                  </div>
                )}

                <form onSubmit={salvar} className="space-y-6">
                  {/* Foto do Produto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto do Produto
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.foto_path ? (
                        <img
                          src={formData.foto_path}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-4xl">
                          📦
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="foto-upload"
                        />
                        <label
                          htmlFor="foto-upload"
                          className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg inline-block transition-colors"
                        >
                          {uploadingImage ? 'Fazendo upload...' : '📷 Selecionar Foto'}
                        </label>
                        {formData.foto_path && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, foto_path: '' }))}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            🗑️ Remover
                          </button>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Formatos: JPG, PNG. Máximo 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Campos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Código (read-only se editando) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código {!editandoId && <span className="text-gray-500">(gerado automaticamente)</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.codigo}
                        onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={!!editandoId}
                      />
                    </div>

                    {/* Nome */}
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

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo *
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="PRODUTO">📦 Produto</option>
                        <option value="SERVICO">🔧 Serviço</option>
                      </select>
                    </div>

                    {/* Finalidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Finalidade *
                      </label>
                      <select
                        value={formData.finalidade}
                        onChange={(e) => setFormData({...formData, finalidade: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="VENDA">💰 Venda</option>
                        <option value="COMPRA">🛒 Compra</option>
                        <option value="AMBOS">🔄 Ambos</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Define onde o produto aparecerá nas tabelas de preço
                      </p>
                    </div>

                    {/* Unidade de Medida */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidade de Medida
                      </label>
                      <select
                        value={formData.unidade_medida}
                        onChange={(e) => setFormData({...formData, unidade_medida: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {unidadesMedida.map(un => (
                          <option key={un.value} value={un.value}>{un.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Local de Estoque */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local de Estoque
                      </label>
                      <input
                        type="text"
                        value={formData.local_estoque}
                        onChange={(e) => setFormData({...formData, local_estoque: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex: Depósito A, Prateleira 1"
                      />
                    </div>

                    {/* Qtd Mínima Estoque */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade Mínima em Estoque
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.qtd_minima_estoque}
                        onChange={(e) => setFormData({...formData, qtd_minima_estoque: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Alerta quando estoque atingir este valor
                      </p>
                    </div>

                    {/* Status */}
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
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={fecharModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      {editandoId ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
