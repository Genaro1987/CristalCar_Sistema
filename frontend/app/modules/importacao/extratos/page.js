'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function ImportacaoExtratosPage() {
  const [extratos, setExtratos] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    layout_id: '',
    arquivo_conteudo: '',
    nome_arquivo: ''
  });

  const [preview, setPreview] = useState([]);

  useEffect(() => {
    carregarExtratos();
    carregarLayouts();
  }, []);

  const carregarExtratos = async () => {
    try {
      const response = await fetch('/api/importacao/extratos?tipo=extratos');
      if (response.ok) {
        const data = await response.json();
        setExtratos(Array.isArray(data) ? data : []);
      } else {
        setExtratos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar extratos:', error);
      setExtratos([]);
    }
  };

  const carregarLayouts = async () => {
    try {
      const response = await fetch('/api/importacao/extratos?tipo=layouts');
      if (response.ok) {
        const data = await response.json();
        setLayouts(Array.isArray(data) ? data : []);
      } else {
        setLayouts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar layouts:', error);
      setLayouts([]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const conteudo = event.target.result;
      setFormData({
        ...formData,
        arquivo_conteudo: conteudo,
        nome_arquivo: file.name
      });

      // Fazer preview (primeiras 10 linhas)
      const linhas = conteudo.split('\n').slice(0, 10);
      setPreview(linhas);
    };

    reader.readAsText(file);
  };

  const processarArquivo = () => {
    if (!formData.layout_id || !formData.arquivo_conteudo) {
      setMensagem({ tipo: 'error', texto: 'Selecione um layout e um arquivo' });
      return;
    }

    const layout = layouts.find(l => l.id === Number(formData.layout_id));
    if (!layout) {
      setMensagem({ tipo: 'error', texto: 'Layout não encontrado' });
      return;
    }

    try {
      const linhas = formData.arquivo_conteudo.split('\n').filter(l => l.trim());
      const linhasProcessadas = [];

      if (layout.formato === 'CSV') {
        // Processar CSV
        for (let i = 1; i < linhas.length; i++) { // Pula cabeçalho
          const colunas = linhas[i].split(layout.separador || ';');

          if (colunas.length >= 3) {
            linhasProcessadas.push({
              data: colunas[layout.col_data || 0]?.trim(),
              descricao: colunas[layout.col_descricao || 1]?.trim(),
              valor: parseFloat(colunas[layout.col_valor || 2]?.replace(',', '.') || '0'),
              tipo: colunas[layout.col_tipo || 3]?.trim() || 'D'
            });
          }
        }
      } else if (layout.formato === 'OFX') {
        setMensagem({ tipo: 'error', texto: 'Parser OFX não implementado nesta versão simplificada' });
        return;
      }

      setPreview(linhasProcessadas);
      setMensagem({
        tipo: 'success',
        texto: `${linhasProcessadas.length} linhas processadas. Revise e clique em Importar.`
      });
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao processar arquivo: ' + error.message });
    }
  };

  const importar = async () => {
    if (!Array.isArray(preview) || preview.length === 0) {
      setMensagem({ tipo: 'error', texto: 'Processe o arquivo antes de importar' });
      return;
    }

    try {
      const response = await fetch('/api/importacao/extratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout_id: formData.layout_id,
          nome_arquivo: formData.nome_arquivo,
          total_linhas: preview.length,
          linhas_processadas: preview.length,
          linhas_erro: 0,
          linhas: preview
        })
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Extrato importado com sucesso!' });
        setTimeout(() => {
          setShowModal(false);
          setMensagem(null);
          setFormData({ layout_id: '', arquivo_conteudo: '', nome_arquivo: '' });
          setPreview([]);
          carregarExtratos();
        }, 2000);
      } else {
        const error = await response.json();
        setMensagem({ tipo: 'error', texto: error.error || 'Erro ao importar' });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao importar extrato' });
    }
  };

  return (
    <DashboardLayout screenCode="IMP-001" title="Importação de Extratos">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Importação de Extratos Bancários</h1>
            <p className="text-gray-600 mt-1">Importe extratos do Sicoob ou BMP Money Plus</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            📥 Importar Extrato
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

        {/* Lista de Extratos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Arquivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Layout
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Linhas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data Importação
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(extratos) && extratos.map((ext) => (
                <tr key={ext.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {ext.codigo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ext.nome_arquivo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ext.layout_nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="text-gray-900">{ext.linhas_processadas} / {ext.total_linhas}</div>
                    {ext.linhas_erro > 0 && (
                      <div className="text-red-600 text-xs">{ext.linhas_erro} erros</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ext.data_importacao).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ext.status === 'PROCESSADO' ? 'bg-green-100 text-green-800' :
                      ext.status === 'PROCESSANDO' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ext.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {extratos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum extrato importado
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Importar Extrato Bancário</h2>

              {mensagem && (
                <div className={`mb-4 p-4 rounded-lg ${
                  mensagem.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {mensagem.texto}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layout de Importação *
                  </label>
                  <select
                    value={formData.layout_id}
                    onChange={(e) => setFormData({...formData, layout_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione um layout</option>
                    {Array.isArray(layouts) && layouts.map(layout => (
                      <option key={layout.id} value={layout.id}>
                        {layout.nome} ({layout.formato})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivo *
                  </label>
                  <input
                    type="file"
                    accept=".txt,.csv,.ofx"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {formData.arquivo_conteudo && (
                  <div>
                    <button
                      onClick={processarArquivo}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      🔍 Processar Arquivo
                    </button>
                  </div>
                )}

                {/* Preview */}
                {preview.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Preview ({preview.length} linhas)</h3>
                    <div className="overflow-x-auto max-h-64">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left">Data</th>
                            <th className="px-2 py-1 text-left">Descrição</th>
                            <th className="px-2 py-1 text-right">Valor</th>
                            <th className="px-2 py-1 text-center">Tipo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.slice(0, 10).map((linha, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-1">{linha.data}</td>
                              <td className="px-2 py-1">{linha.descricao}</td>
                              <td className="px-2 py-1 text-right">
                                {typeof linha.valor === 'number'
                                  ? linha.valor.toFixed(2)
                                  : linha.valor}
                              </td>
                              <td className="px-2 py-1 text-center">{linha.tipo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setMensagem(null);
                      setFormData({ layout_id: '', arquivo_conteudo: '', nome_arquivo: '' });
                      setPreview([]);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  {preview.length > 0 && (
                    <button
                      onClick={importar}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      ✓ Importar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
