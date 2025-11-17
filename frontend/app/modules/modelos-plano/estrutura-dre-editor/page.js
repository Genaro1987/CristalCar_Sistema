'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoId = searchParams.get('tipo_id');

  const [tipoDRE, setTipoDRE] = useState(null);
  const [estrutura, setEstrutura] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [showModalLinha, setShowModalLinha] = useState(false);
  const [showModalVinculo, setShowModalVinculo] = useState(false);
  const [linhaSelecionada, setLinhaSelecionada] = useState(null);
  const [planoContas, setPlanoContas] = useState([]);

  const [formLinha, setFormLinha] = useState({
    nome: '',
    tipo_linha: 'TITULO',
    formula: '',
    negativo: false
  });

  useEffect(() => {
    if (tipoId) {
      carregarTipoDRE();
      carregarEstrutura();
      carregarPlanoContas();
    }
  }, [tipoId]);

  const carregarTipoDRE = async () => {
    try {
      const response = await fetch(`/api/modelos-plano/tipos-dre?id=${tipoId}`);
      if (response.ok) {
        const data = await response.json();
        setTipoDRE(data || null);
      } else {
        console.error('Erro ao carregar tipo DRE: resposta não OK');
        setTipoDRE(null);
      }
    } catch (error) {
      console.error('Erro ao carregar tipo DRE:', error);
      setTipoDRE(null);
    }
  };

  const carregarEstrutura = async () => {
    try {
      const response = await fetch(
        `/api/modelos-plano/estrutura-dre?tipo_dre_id=${tipoId}&incluir_vinculos=true`
      );
      if (response.ok) {
        const data = await response.json();
        setEstrutura(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro ao carregar estrutura: resposta não OK');
        setEstrutura([]);
      }
    } catch (error) {
      console.error('Erro ao carregar estrutura:', error);
      setEstrutura([]);
    }
  };

  const carregarPlanoContas = async () => {
    try {
      const response = await fetch('/api/financeiro/plano-contas');
      if (response.ok) {
        const data = await response.json();
        setPlanoContas(Array.isArray(data) ? data : []);
      } else {
        setPlanoContas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar plano de contas:', error);
      setPlanoContas([]);
    }
  };

  const abrirModalLinha = () => {
    setFormLinha({
      nome: '',
      tipo_linha: 'TITULO',
      formula: '',
      negativo: false
    });
    setShowModalLinha(true);
  };

  const salvarLinha = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/modelos-plano/estrutura-dre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formLinha,
          tipo_dre_id: tipoId,
          codigo: `LIN-${Date.now()}`,
          nivel: 1,
          ordem: estrutura.length + 1
        })
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Linha criada com sucesso!' });
        setShowModalLinha(false);
        carregarEstrutura();
        setTimeout(() => setMensagem(null), 3000);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao criar linha' });
    }
  };

  const excluirLinha = async (linha) => {
    if (!confirm(`Deseja excluir a linha "${linha.nome}"?`)) return;

    try {
      const response = await fetch(`/api/modelos-plano/estrutura-dre?id=${linha.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Linha excluída!' });
        carregarEstrutura();
        setTimeout(() => setMensagem(null), 3000);
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir linha' });
    }
  };

  const abrirModalVinculo = (linha) => {
    setLinhaSelecionada(linha);
    setShowModalVinculo(true);
  };

  const adicionarVinculo = async (planoContaId) => {
    try {
      const response = await fetch('/api/modelos-plano/estrutura-dre/vinculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estrutura_dre_id: linhaSelecionada.id,
          plano_conta_id: planoContaId
        })
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Vínculo criado!' });
        carregarEstrutura();
        setTimeout(() => setMensagem(null), 2000);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao criar vínculo' });
    }
  };

  const removerVinculo = async (vinculoId) => {
    try {
      const response = await fetch(`/api/modelos-plano/estrutura-dre/vinculos?id=${vinculoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Vínculo removido!' });
        carregarEstrutura();
        setTimeout(() => setMensagem(null), 2000);
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao remover vínculo' });
    }
  };

  if (!tipoId) {
    return (
      <DashboardLayout screenCode="FIN-003" title="Editor de Estrutura DRE">
        <div className="p-6 text-center">
          <p className="text-gray-500">Tipo DRE não especificado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout screenCode="FIN-003" title="Editor de Estrutura DRE">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:text-primary-900 mb-2"
            >
              ← Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {tipoDRE?.nome || 'Carregando...'}
            </h1>
            <p className="text-gray-600 mt-1">Estrutura de Demonstração de Resultado</p>
          </div>
          <button
            onClick={abrirModalLinha}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            ➕ Nova Linha
          </button>
        </div>

        {/* Mensagens */}
        {mensagem && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Estrutura */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Linha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contas Vinculadas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estrutura.map((linha) => (
                <tr key={linha.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {linha.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs ${
                      linha.tipo_linha === 'TITULO' ? 'bg-blue-100 text-blue-800' :
                      linha.tipo_linha === 'CONTA' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {linha.tipo_linha}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {linha.vinculos && linha.vinculos.length > 0 ? (
                      <div className="space-y-1">
                        {linha.vinculos.map(v => (
                          <div key={v.id} className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {v.conta_codigo} - {v.conta_nome}
                            </span>
                            <button
                              onClick={() => removerVinculo(v.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Sem vínculos</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => abrirModalVinculo(linha)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      🔗 Vincular
                    </button>
                    <button
                      onClick={() => excluirLinha(linha)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {estrutura.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma linha na estrutura. Clique em "Nova Linha" para começar.
            </div>
          )}
        </div>

        {/* Modal Nova Linha */}
        {showModalLinha && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Nova Linha DRE</h2>

              <form onSubmit={salvarLinha} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Linha *
                  </label>
                  <input
                    type="text"
                    value={formLinha.nome}
                    onChange={(e) => setFormLinha({...formLinha, nome: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Linha
                  </label>
                  <select
                    value={formLinha.tipo_linha}
                    onChange={(e) => setFormLinha({...formLinha, tipo_linha: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="TITULO">Título</option>
                    <option value="CONTA">Conta</option>
                    <option value="FORMULA">Fórmula</option>
                  </select>
                </div>

                {formLinha.tipo_linha === 'FORMULA' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fórmula
                    </label>
                    <input
                      type="text"
                      value={formLinha.formula}
                      onChange={(e) => setFormLinha({...formLinha, formula: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: L1 + L2 - L3"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="negativo"
                    checked={formLinha.negativo}
                    onChange={(e) => setFormLinha({...formLinha, negativo: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="negativo" className="text-sm text-gray-700">
                    Exibir valor negativo (entre parênteses)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModalLinha(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Criar Linha
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Vincular Conta */}
        {showModalVinculo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                Vincular Conta: {linhaSelecionada?.nome}
              </h2>

              <div className="space-y-2">
                {planoContas.map(conta => (
                  <div
                    key={conta.id}
                    className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium">{conta.codigo}</span>
                      <span className="ml-2 text-gray-600">{conta.descricao}</span>
                    </div>
                    <button
                      onClick={() => adicionarVinculo(conta.id)}
                      className="bg-primary-500 text-white px-4 py-1 rounded hover:bg-primary-600"
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModalVinculo(false)}
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

export default function EstruturaEDREEditorPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <EditorContent />
    </Suspense>
  );
}
