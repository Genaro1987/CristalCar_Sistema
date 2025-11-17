'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

const tiposModelo = [
  { value: 'OFICIAL', label: 'Modelo Oficial' },
  { value: 'GERENCIAL', label: 'Modelo Gerencial (com EBITDA)' },
  { value: 'CUSTEIO_VARIAVEL', label: 'Custeio Variável' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
];

const estruturasBase = [
  { value: 'PADRAO', label: 'Padrão' },
  { value: 'GERENCIAL', label: 'Gerencial' },
  { value: 'CUSTO_VARIAVEL', label: 'Custeio Variável' },
  { value: 'CUSTOM', label: 'Estrutura própria' },
];

export default function PlanosPadroesPage() {
  const [modelos, setModelos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [tiposEstrutura, setTiposEstrutura] = useState([]);
  const [tipoEstruturaForm, setTipoEstruturaForm] = useState({ codigo: '', nome: '', descricao: '' });
  const [salvandoTipoEstrutura, setSalvandoTipoEstrutura] = useState(false);
  const [formData, setFormData] = useState({
    nome_modelo: '',
    tipo_modelo: 'OFICIAL',
    estrutura_tipo: 'PADRAO',
    descricao: '',
    padrao: false,
    ativo: true,
  });

  useEffect(() => {
    carregarModelos();
    carregarTiposEstrutura();
  }, []);

  const carregarModelos = async () => {
    try {
      const response = await fetch('/api/modelos-dre');
      if (response.ok) {
        const data = await response.json();
        const normalizados = (data || []).map((item) => ({
          ...item,
          padrao: item.padrao === 1 || item.padrao === true,
          ativo: item.ativo === 1 || item.ativo === true || item.status === 'ATIVO',
        }));
        setModelos(normalizados);
      }
    } catch (error) {
      console.error('Erro ao carregar modelos de DRE:', error);
    }
  };

  const carregarTiposEstrutura = async () => {
    try {
      const response = await fetch('/api/tipos-estrutura-dre');
      if (response.ok) {
        const data = await response.json();
        setTiposEstrutura(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de estrutura do DRE:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTipoEstruturaChange = (e) => {
    const { name, value } = e.target;
    setTipoEstruturaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      status: formData.ativo ? 'ATIVO' : 'INATIVO',
    };

    try {
      const url = editingId ? '/api/modelos-dre' : '/api/modelos-dre';
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
      });

      if (response.ok) {
        carregarModelos();
        resetForm();
        setShowForm(false);
        setMensagem({ type: 'success', texto: 'Modelo de DRE salvo com sucesso.' });
      } else {
        const erro = await response.json();
        setMensagem({ type: 'error', texto: erro.error || 'Não foi possível salvar o modelo.' });
      }
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      setMensagem({ type: 'error', texto: 'Erro ao salvar modelo padrão.' });
    }
  };

  const handleEditar = (modelo) => {
    setFormData({
      nome_modelo: modelo.nome_modelo,
      tipo_modelo: modelo.tipo_modelo,
      estrutura_tipo: modelo.estrutura_tipo,
      descricao: modelo.descricao || '',
      padrao: !!modelo.padrao,
      ativo: !!modelo.ativo,
    });
    setEditingId(modelo.id);
    setShowForm(true);
  };

  const handleExcluir = async (id) => {
    if (!confirm('Confirma a exclusão deste modelo padrão?')) return;

    try {
      const response = await fetch(`/api/modelos-dre?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        carregarModelos();
        setMensagem({ type: 'success', texto: 'Modelo removido com sucesso.' });
      }
    } catch (error) {
      console.error('Erro ao excluir modelo:', error);
      setMensagem({ type: 'error', texto: 'Erro ao excluir modelo.' });
    }
  };

  const handleSalvarTipoEstrutura = async (e) => {
    e.preventDefault();
    if (!tipoEstruturaForm.codigo || !tipoEstruturaForm.nome) {
      setMensagem({ type: 'error', texto: 'Informe código e nome do tipo de estrutura.' });
      return;
    }

    try {
      setSalvandoTipoEstrutura(true);
      const response = await fetch('/api/tipos-estrutura-dre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: tipoEstruturaForm.codigo,
          nome: tipoEstruturaForm.nome,
          descricao: tipoEstruturaForm.descricao,
        }),
      });

      if (response.ok) {
        setMensagem({ type: 'success', texto: 'Tipo de estrutura cadastrado com sucesso.' });
        setTipoEstruturaForm({ codigo: '', nome: '', descricao: '' });
        carregarTiposEstrutura();
      } else {
        const erro = await response.json();
        setMensagem({ type: 'error', texto: erro.error || 'Não foi possível salvar o tipo.' });
      }
    } catch (error) {
      console.error('Erro ao salvar tipo de estrutura do DRE:', error);
      setMensagem({ type: 'error', texto: 'Erro ao salvar tipo de estrutura do DRE.' });
    } finally {
      setSalvandoTipoEstrutura(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_modelo: '',
      tipo_modelo: 'OFICIAL',
      estrutura_tipo: 'PADRAO',
      descricao: '',
      padrao: false,
      ativo: true,
    });
    setEditingId(null);
  };

  const modelosFiltrados = useMemo(() => {
    return modelos.filter((modelo) => {
      const matchBusca =
        busca.trim() === '' ||
        modelo.nome_modelo?.toLowerCase().includes(busca.toLowerCase()) ||
        modelo.descricao?.toLowerCase().includes(busca.toLowerCase());

      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVO' && modelo.ativo) ||
        (filtroStatus === 'INATIVO' && !modelo.ativo);

      return matchBusca && matchStatus;
    });
  }, [modelos, busca, filtroStatus]);

  return (
    <DashboardLayout screenCode="FIN-002">
      <div className="space-y-6">
        {mensagem && (
          <div className={`p-4 rounded-lg ${mensagem.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {mensagem.texto}
          </div>
        )}

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar modelo</label>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou descrição..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ATIVO">Ativos</option>
                  <option value="INATIVO">Inativos</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setMostrarAjuda(!mostrarAjuda)}>
                {mostrarAjuda ? 'Fechar ajuda' : 'Ajuda'}
              </Button>
              <Button variant="primary" onClick={() => setShowForm(true)}>
                + Novo Tipo de DRE
              </Button>
            </div>
          </div>
        </Card>

        {mostrarAjuda && (
          <Card title="Como usar a tela de Tipos de DRE" subtitle="Modelos de referência para estruturar relatórios">
            <div className="space-y-2 text-sm text-gray-700">
              <p>Cadastre aqui as variações oficiais ou gerenciais do Demonstrativo de Resultado (DRE). Cada tipo funciona como um modelo para a estrutura do relatório.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use o campo <strong>Tipo</strong> para indicar se o modelo é oficial, gerencial ou de custeio.</li>
                <li>Marque a opção <strong>Padrão</strong> para destacar qual estrutura deve aparecer primeiro nas demais telas.</li>
                <li>Ative ou desative modelos sem perder o histórico; apenas os ativos aparecerão para seleção.</li>
              </ul>
              <p className="text-gray-500">Dica: mantenha um modelo oficial e um gerencial para cenários de análise diferentes.</p>
            </div>
          </Card>
        )}

        <Card
          title="Tipos utilizados na Estrutura DRE"
          subtitle="Cadastre aqui os tipos base (Receita, Despesa, EBITDA, etc) usados para montar a árvore"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {tiposEstrutura.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum tipo cadastrado ainda.</p>
              )}
              {tiposEstrutura.map((tipo) => (
                <div key={tipo.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Código</p>
                      <p className="font-semibold text-gray-900">{tipo.codigo}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">Ativo</span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{tipo.nome}</p>
                  {tipo.descricao && <p className="text-xs text-gray-500 mt-1">{tipo.descricao}</p>}
                </div>
              ))}
            </div>

            <form onSubmit={handleSalvarTipoEstrutura} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input
                  type="text"
                  name="codigo"
                  value={tipoEstruturaForm.codigo}
                  onChange={handleTipoEstruturaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: RECEITA, DESPESA"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={tipoEstruturaForm.nome}
                  onChange={handleTipoEstruturaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Receita Bruta, Deduções"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={tipoEstruturaForm.descricao}
                  onChange={handleTipoEstruturaChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Como este tipo será usado na árvore do DRE"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={salvandoTipoEstrutura}>
                  {salvandoTipoEstrutura ? 'Salvando...' : 'Cadastrar tipo'}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <Card title="Tipos de DRE" subtitle="Cadastre visões oficiais e gerenciais para estruturar o relatório">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estrutura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Padrão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modelosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                      Nenhum modelo cadastrado. Clique em "Novo Modelo Padrão" para começar.
                    </td>
                  </tr>
                ) : (
                  modelosFiltrados.map((modelo) => (
                    <tr key={modelo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{modelo.nome_modelo}</div>
                        {modelo.descricao && (
                          <div className="text-sm text-gray-600">{modelo.descricao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tiposModelo.find((t) => t.value === modelo.tipo_modelo)?.label || modelo.tipo_modelo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {estruturasBase.find((e) => e.value === modelo.estrutura_tipo)?.label || modelo.estrutura_tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {modelo.padrao ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Padrão</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Alternativo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            modelo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {modelo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onClick={() => handleEditar(modelo)} className="text-primary-600 hover:text-primary-800">
                          Editar
                        </button>
                        <button onClick={() => handleExcluir(modelo.id)} className="text-red-600 hover:text-red-800">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Editar modelo padrão' : 'Novo modelo padrão'}
                  </h2>
                  <p className="text-sm text-gray-600">Defina diferentes estruturas de referência para o DRE.</p>
                </div>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Modelo *</label>
                    <input
                      type="text"
                      required
                      name="nome_modelo"
                      value={formData.nome_modelo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: DRE Oficial, Gerencial com EBITDA, Custeio Variável"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select
                      name="tipo_modelo"
                      value={formData.tipo_modelo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {tiposModelo.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estrutura Base *</label>
                    <select
                      name="estrutura_tipo"
                      value={formData.estrutura_tipo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {estruturasBase.map((estrutura) => (
                        <option key={estrutura.value} value={estrutura.value}>{estrutura.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Breve descrição sobre quando usar este modelo"
                    />
                  </div>

                  <div className="flex items-center space-x-4 md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="padrao"
                        checked={formData.padrao}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Marcar como modelo padrão</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="ativo"
                        checked={formData.ativo}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Ativo</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingId ? 'Salvar alterações' : 'Cadastrar modelo'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
