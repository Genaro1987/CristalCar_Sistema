'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function TabelasPrecosItensPage() {
  const [tabelas, setTabelas] = useState([]);
  const [tabelaSelecionada, setTabelaSelecionada] = useState(null);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    produto_id: '',
    preco_venda: '',
    preco_custo: '',
    ativo: true
  });

  useEffect(() => {
    carregarTabelas();
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (tabelaSelecionada) {
      carregarItens();
    }
  }, [tabelaSelecionada]);

  const carregarTabelas = async () => {
    try {
      const response = await fetch('/api/tabelas-precos/cadastro');
      if (response.ok) {
        const data = await response.json();
        setTabelas(Array.isArray(data) ? data : []);
      } else {
        setTabelas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error);
      setTabelas([]);
    }
  };

  const carregarItens = async () => {
    if (!tabelaSelecionada) return;

    try {
      const response = await fetch(
        `/api/cadastros/tabelas-precos-itens?tabela_id=${tabelaSelecionada.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setItens(Array.isArray(data) ? data : []);
      } else {
        setItens([]);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      setItens([]);
    }
  };

  const carregarProdutos = async () => {
    try {
      const response = await fetch('/api/administrativo/produtos');
      if (response.ok) {
        const data = await response.json();
        setProdutos(Array.isArray(data) ? data : []);
      } else {
        setProdutos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]);
    }
  };

  const abrirModal = (item = null) => {
    if (item) {
      setEditandoId(item.id);
      setFormData({
        produto_id: item.produto_id || '',
        preco_venda: item.preco_venda || '',
        preco_custo: item.preco_custo || '',
        ativo: item.ativo !== 0
      });
    } else {
      setEditandoId(null);
      setFormData({
        produto_id: '',
        preco_venda: '',
        preco_custo: '',
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

    if (!formData.produto_id) {
      setMensagem({ tipo: 'error', texto: 'Produto é obrigatório' });
      return;
    }

    // Validar campos obrigatórios baseados no tipo da tabela
    const tipoTabela = tabelaSelecionada?.tipo_tabela || 'VENDA';

    if (tipoTabela === 'COMPRAS' && !formData.preco_custo) {
      setMensagem({ tipo: 'error', texto: 'Preço de Custo é obrigatório para tabelas de COMPRAS' });
      return;
    }

    if ((tipoTabela === 'VENDA' || !tipoTabela) && !formData.preco_venda) {
      setMensagem({ tipo: 'error', texto: 'Preço de Venda é obrigatório para tabelas de VENDA' });
      return;
    }

    try {
      const url = '/api/cadastros/tabelas-precos-itens';
      const method = editandoId ? 'PUT' : 'POST';
      const body = editandoId
        ? { ...formData, id: editandoId }
        : { ...formData, tabela_preco_id: tabelaSelecionada.id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setMensagem({
          tipo: 'success',
          texto: `Item ${editandoId ? 'atualizado' : 'adicionado'} com sucesso!`
        });
        setTimeout(() => {
          fecharModal();
          carregarItens();
        }, 1500);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao salvar' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar item' });
    }
  };

  const excluir = async (id) => {
    if (!confirm('Deseja realmente remover este produto da tabela?')) return;

    try {
      const response = await fetch(`/api/cadastros/tabelas-precos-itens?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Item removido com sucesso!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarItens();
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao excluir' });
        setTimeout(() => setMensagem(null), 5000);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir item' });
      setTimeout(() => setMensagem(null), 5000);
    }
  };

  // Função removida - margem de lucro não é mais exibida

  const produtosFiltrados = searchTerm
    ? produtos.filter(p =>
        p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : produtos;

  return (
    <DashboardLayout screenCode="CAD-001" title="Itens por Tabela de Preço">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Itens por Tabela de Preço</h1>
          <p className="text-gray-600 mt-1">
            Gerencie produtos e preços em cada tabela
          </p>
        </div>

        {/* Mensagens */}
        {mensagem && !showModal && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Seleção de Tabela */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione uma Tabela de Preços
          </label>
          <select
            value={tabelaSelecionada?.id || ''}
            onChange={(e) => {
              const tabela = tabelas.find(t => t.id === Number(e.target.value));
              setTabelaSelecionada(tabela);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Selecione uma tabela...</option>
            {tabelas.map(t => (
              <option key={t.id} value={t.id}>
                {t.codigo} - {t.nome} ({t.tipo_tabela || 'VENDA'})
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Itens */}
        {tabelaSelecionada && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {tabelaSelecionada.nome}
                </h2>
                <p className="text-sm text-gray-600">
                  {itens.length} {itens.length === 1 ? 'produto' : 'produtos'} cadastrados
                </p>
              </div>
              <button
                onClick={() => abrirModal()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                ➕ Adicionar Produto
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  {(tabelaSelecionada?.tipo_tabela === 'COMPRAS' || tabelaSelecionada?.tipo_tabela === 'AMBOS') && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Preço Custo
                    </th>
                  )}
                  {(tabelaSelecionada?.tipo_tabela === 'VENDA' || tabelaSelecionada?.tipo_tabela === 'AMBOS' || !tabelaSelecionada?.tipo_tabela) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Preço Venda
                    </th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itens.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.produto_codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.produto_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.produto_tipo === 'PRODUTO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.produto_tipo}
                      </span>
                    </td>
                    {(tabelaSelecionada?.tipo_tabela === 'COMPRAS' || tabelaSelecionada?.tipo_tabela === 'AMBOS') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {item.preco_custo
                          ? Number(item.preco_custo).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })
                          : '-'}
                      </td>
                    )}
                    {(tabelaSelecionada?.tipo_tabela === 'VENDA' || tabelaSelecionada?.tipo_tabela === 'AMBOS' || !tabelaSelecionada?.tipo_tabela) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {Number(item.preco_venda || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => abrirModal(item)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => excluir(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {itens.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum produto nesta tabela. Clique em "Adicionar Produto" para começar.
              </div>
            )}
          </div>
        )}

        {!tabelaSelecionada && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-lg">Selecione uma tabela de preços acima para gerenciar seus produtos</p>
          </div>
        )}

        {/* Modal Adicionar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editandoId ? 'Editar Item' : 'Adicionar Produto'}
                </h2>

                {mensagem && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {mensagem.texto}
                  </div>
                )}

                <form onSubmit={salvar} className="space-y-4">
                  {/* Produto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produto *
                    </label>
                    {editandoId ? (
                      <input
                        type="text"
                        value={itens.find(i => i.id === editandoId)?.produto_nome || ''}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                        disabled
                      />
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Buscar produto..."
                          className="w-full px-3 py-2 border rounded-lg mb-2"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                          value={formData.produto_id}
                          onChange={(e) => setFormData({...formData, produto_id: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">Selecione um produto</option>
                          {produtosFiltrados.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.codigo} - {p.nome} ({p.tipo})
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>

                  {/* Preços - Condicional baseado no tipo da tabela */}
                  <div className={`grid gap-4 ${
                    tabelaSelecionada?.tipo_tabela === 'AMBOS' ? 'grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {(tabelaSelecionada?.tipo_tabela === 'COMPRAS' || tabelaSelecionada?.tipo_tabela === 'AMBOS') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço de Custo {tabelaSelecionada?.tipo_tabela === 'COMPRAS' ? '*' : ''}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.preco_custo}
                          onChange={(e) => setFormData({...formData, preco_custo: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="0.00"
                          required={tabelaSelecionada?.tipo_tabela === 'COMPRAS'}
                        />
                      </div>
                    )}

                    {(tabelaSelecionada?.tipo_tabela === 'VENDA' || tabelaSelecionada?.tipo_tabela === 'AMBOS' || !tabelaSelecionada?.tipo_tabela) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço de Venda {(tabelaSelecionada?.tipo_tabela === 'VENDA' || !tabelaSelecionada?.tipo_tabela) ? '*' : ''}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.preco_venda}
                          onChange={(e) => setFormData({...formData, preco_venda: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="0.00"
                          required={tabelaSelecionada?.tipo_tabela === 'VENDA' || !tabelaSelecionada?.tipo_tabela}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="ativo" className="text-sm text-gray-700">
                      Item ativo
                    </label>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={fecharModal}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      {editandoId ? 'Atualizar' : 'Adicionar'}
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
