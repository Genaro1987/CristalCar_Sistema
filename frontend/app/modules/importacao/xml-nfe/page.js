'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function ImportacaoXMLNFePage() {
  const [nfes, setNfes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [nfeSelecionada, setNfeSelecionada] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    numero_nfe: '',
    serie: '1',
    chave_acesso: '',
    fornecedor_cnpj: '',
    fornecedor_nome: '',
    data_emissao: '',
    valor_total: '',
    valor_produtos: '',
    valor_impostos: '',
    produtos: [],
    impostos: []
  });

  useEffect(() => {
    carregarNFes();
  }, []);

  const carregarNFes = async () => {
    try {
      const response = await fetch('/api/importacao/xml-nfe');
      if (response.ok) {
        const data = await response.json();
        setNfes(Array.isArray(data) ? data : []);
      } else {
        setNfes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar NF-es:', error);
      setNfes([]);
    }
  };

  const abrirModal = () => {
    setFormData({
      numero_nfe: '',
      serie: '1',
      chave_acesso: '',
      fornecedor_cnpj: '',
      fornecedor_nome: '',
      data_emissao: new Date().toISOString().split('T')[0],
      valor_total: '',
      valor_produtos: '',
      valor_impostos: '',
      produtos: [],
      impostos: []
    });
    setShowModal(true);
  };

  const salvar = async (e) => {
    e.preventDefault();

    if (!formData.numero_nfe || !formData.fornecedor_cnpj) {
      setMensagem({ tipo: 'error', texto: 'Preencha os campos obrigatórios' });
      return;
    }

    try {
      const response = await fetch('/api/importacao/xml-nfe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        let msg = 'NF-e importada com sucesso!';
        if (result.parceiro_criado) {
          msg += ' Fornecedor criado automaticamente.';
        }
        setMensagem({ tipo: 'success', texto: msg });
        setTimeout(() => {
          setShowModal(false);
          setMensagem(null);
          carregarNFes();
        }, 2000);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao importar' });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao importar NF-e' });
    }
  };

  const excluir = async (id) => {
    if (!confirm('Deseja excluir esta NF-e?')) return;

    try {
      const response = await fetch(`/api/importacao/xml-nfe?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'NF-e excluída!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarNFes();
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir NF-e' });
    }
  };

  const verDetalhes = async (nfe) => {
    try {
      const response = await fetch(`/api/importacao/xml-nfe?nfe_id=${nfe.id}`);
      if (response.ok) {
        const detalhes = await response.json();
        setNfeSelecionada(detalhes);
        setShowDetalhes(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  return (
    <DashboardLayout screenCode="IMP-002" title="Importação XML NF-e">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Importação XML NF-e</h1>
            <p className="text-gray-600 mt-1">Importe notas fiscais eletrônicas (NF-e)</p>
          </div>
          <button
            onClick={abrirModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            📄 Importar NF-e
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

        {/* Lista de NF-es */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NF-e
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data Emissão
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Valor Total
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
              {nfes.map((nfe) => (
                <tr key={nfe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {nfe.codigo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{nfe.numero_nfe} / {nfe.serie}</div>
                    {nfe.parceiro_criado && (
                      <div className="text-xs text-blue-600">✓ Fornecedor criado</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{nfe.fornecedor_nome}</div>
                    <div className="text-xs text-gray-400">{nfe.fornecedor_cnpj}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(nfe.data_emissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                    {Number(nfe.valor_total).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {nfe.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => verDetalhes(nfe)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      👁 Detalhes
                    </button>
                    <button
                      onClick={() => excluir(nfe.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {nfes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma NF-e importada
            </div>
          )}
        </div>

        {/* Modal Importar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Importar NF-e</h2>

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
                      Número NF-e *
                    </label>
                    <input
                      type="text"
                      value={formData.numero_nfe}
                      onChange={(e) => setFormData({...formData, numero_nfe: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Série
                    </label>
                    <input
                      type="text"
                      value={formData.serie}
                      onChange={(e) => setFormData({...formData, serie: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chave de Acesso
                  </label>
                  <input
                    type="text"
                    value={formData.chave_acesso}
                    onChange={(e) => setFormData({...formData, chave_acesso: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    maxLength={44}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ Fornecedor *
                    </label>
                    <input
                      type="text"
                      value={formData.fornecedor_cnpj}
                      onChange={(e) => setFormData({...formData, fornecedor_cnpj: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Fornecedor
                    </label>
                    <input
                      type="text"
                      value={formData.fornecedor_nome}
                      onChange={(e) => setFormData({...formData, fornecedor_nome: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Emissão
                    </label>
                    <input
                      type="date"
                      value={formData.data_emissao}
                      onChange={(e) => setFormData({...formData, data_emissao: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor_total}
                      onChange={(e) => setFormData({...formData, valor_total: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
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
                    Importar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Detalhes */}
        {showDetalhes && nfeSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                Detalhes NF-e: {nfeSelecionada.numero_nfe}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Fornecedor</div>
                    <div className="font-medium">{nfeSelecionada.fornecedor_nome}</div>
                    <div className="text-sm text-gray-500">{nfeSelecionada.fornecedor_cnpj}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Valor Total</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Number(nfeSelecionada.valor_total).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  </div>
                </div>

                {nfeSelecionada.produtos && nfeSelecionada.produtos.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Produtos ({nfeSelecionada.produtos.length})</h3>
                    <div className="border rounded overflow-hidden">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Código</th>
                            <th className="px-4 py-2 text-left">Descrição</th>
                            <th className="px-4 py-2 text-right">Qtd</th>
                            <th className="px-4 py-2 text-right">Valor Unit.</th>
                            <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nfeSelecionada.produtos.map((prod, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-2">{prod.codigo_produto}</td>
                              <td className="px-4 py-2">{prod.descricao}</td>
                              <td className="px-4 py-2 text-right">{prod.quantidade}</td>
                              <td className="px-4 py-2 text-right">
                                {Number(prod.valor_unitario).toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-right font-medium">
                                {Number(prod.valor_total).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetalhes(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
