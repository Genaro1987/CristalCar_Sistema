'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function MetasSemanaisPage() {
  const anoAtual = new Date().getFullYear();
  const trimestreAtual = Math.ceil((new Date().getMonth() + 1) / 3);

  const [ano, setAno] = useState(anoAtual);
  const [trimestre, setTrimestre] = useState(trimestreAtual);
  const [objetivos, setObjetivos] = useState([]);
  const [objetivoSelecionado, setObjetivoSelecionado] = useState(null);
  const [metas, setMetas] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    carregarObjetivos();
  }, [ano, trimestre]);

  useEffect(() => {
    if (objetivoSelecionado) {
      carregarMetas();
    }
  }, [objetivoSelecionado]);

  const carregarObjetivos = async () => {
    try {
      const response = await fetch(
        `/api/objetivos/trimestrais?ano=${ano}&trimestre=${trimestre}`
      );
      if (response.ok) {
        const data = await response.json();
        setObjetivos(data);
        if (data.length > 0 && !objetivoSelecionado) {
          setObjetivoSelecionado(data[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
    }
  };

  const carregarMetas = async () => {
    if (!objetivoSelecionado) return;

    try {
      const response = await fetch(
        `/api/objetivos/semanais?objetivo_id=${objetivoSelecionado.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMetas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  const gerarMetasAutomaticas = async () => {
    if (!objetivoSelecionado) return;

    if (!confirm('Isso irá substituir todas as metas existentes. Deseja continuar?')) {
      return;
    }

    try {
      const response = await fetch('/api/objetivos/semanais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objetivo_trimestral_id: objetivoSelecionado.id,
          gerar_automatico: true
        })
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: '13 metas semanais geradas!' });
        setTimeout(() => setMensagem(null), 3000);
        carregarMetas();
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao gerar metas' });
    }
  };

  const atualizarMeta = async (metaId, campo, valor) => {
    try {
      const response = await fetch('/api/objetivos/semanais', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: metaId,
          [campo]: valor
        })
      });

      if (response.ok) {
        carregarMetas();
      }
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
    }
  };

  const calcularTotais = () => {
    const totalMeta = metas.reduce((sum, m) => sum + Number(m.valor_meta || 0), 0);
    const totalRealizado = metas.reduce((sum, m) => sum + Number(m.valor_realizado || 0), 0);
    const percentual = totalMeta > 0 ? (totalRealizado / totalMeta) * 100 : 0;

    return { totalMeta, totalRealizado, percentual };
  };

  const totais = calcularTotais();

  return (
    <DashboardLayout screenCode="OBJ-002" title="Metas Semanais">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Metas Semanais</h1>
          <p className="text-gray-600 mt-1">Desmembramento semanal dos objetivos trimestrais</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
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
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={1}>1º Trimestre</option>
                <option value={2}>2º Trimestre</option>
                <option value={3}>3º Trimestre</option>
                <option value={4}>4º Trimestre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objetivo
              </label>
              <select
                value={objetivoSelecionado?.id || ''}
                onChange={(e) => {
                  const obj = objetivos.find(o => o.id === Number(e.target.value));
                  setObjetivoSelecionado(obj);
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {objetivos.length === 0 && (
                  <option value="">Nenhum objetivo cadastrado</option>
                )}
                {objetivos.map(obj => (
                  <option key={obj.id} value={obj.id}>
                    {obj.conta_codigo} - {obj.conta_nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {mensagem && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {objetivoSelecionado ? (
          <>
            {/* Informações do Objetivo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Valor Objetivo</div>
                  <div className="text-xl font-bold text-gray-900">
                    {Number(objetivoSelecionado.valor_objetivo).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tipo</div>
                  <div className="text-xl font-bold">
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      objetivoSelecionado.tipo_conta === 'RECEITA'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {objetivoSelecionado.tipo_conta}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={gerarMetasAutomaticas}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                  >
                    🔄 Gerar 13 Semanas
                  </button>
                </div>
              </div>
            </div>

            {/* Tabela de Metas */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Semana
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Meta
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Realizado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metas.map((meta) => {
                    const percentual = Number(meta.valor_meta) > 0
                      ? (Number(meta.valor_realizado) / Number(meta.valor_meta)) * 100
                      : 0;

                    return (
                      <tr key={meta.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          Semana {meta.semana}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={meta.valor_meta}
                            onChange={(e) => atualizarMeta(meta.id, 'valor_meta', e.target.value)}
                            className="w-32 px-2 py-1 border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={meta.valor_realizado}
                            onChange={(e) => atualizarMeta(meta.id, 'valor_realizado', e.target.value)}
                            className="w-32 px-2 py-1 border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium">
                          {percentual.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            percentual >= 100 ? 'bg-green-100 text-green-800' :
                            percentual >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {percentual >= 100 ? '✓ Atingido' :
                             percentual >= 75 ? '⚠ Parcial' :
                             '✗ Abaixo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 text-sm font-bold">TOTAL</td>
                    <td className="px-6 py-4 text-sm text-right font-bold">
                      {totais.totalMeta.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold">
                      {totais.totalRealizado.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold">
                      {totais.percentual.toFixed(1)}%
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              {metas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma meta semanal cadastrada. Clique em "Gerar 13 Semanas".
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              Nenhum objetivo cadastrado para este período.
              <br />
              Acesse "Objetivos Trimestrais" para criar objetivos primeiro.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
