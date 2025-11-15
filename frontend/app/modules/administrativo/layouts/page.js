'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function LayoutsImportacaoPage() {
  const [layouts, setLayouts] = useState([]);
  const [filteredLayouts, setFilteredLayouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome_layout: '',
    tipo_arquivo: '',
    descricao: '',
    delimitador: ';',
    encoding: 'UTF-8',
    tem_cabecalho: true,
    linha_inicio_dados: 1,
    mapeamento_campos: [],
    regras_validacao: [],
    regras_transformacao: [],
    status: 'ATIVO'
  });

  const tiposArquivo = [
    { value: 'XML_NF', label: 'XML - Nota Fiscal Eletrônica' },
    { value: 'EXTRATO_OFX', label: 'Extrato Bancário - OFX' },
    { value: 'EXTRATO_CSV', label: 'Extrato Bancário - CSV' },
    { value: 'PLANILHA_EXCEL', label: 'Planilha Excel' },
    { value: 'OUTROS', label: 'Outros' }
  ];

  const encodings = ['UTF-8', 'ISO-8859-1', 'Windows-1252', 'ASCII'];
  const delimitadores = [
    { value: ';', label: 'Ponto e vírgula (;)' },
    { value: ',', label: 'Vírgula (,)' },
    { value: '\t', label: 'Tabulação (Tab)' },
    { value: '|', label: 'Pipe (|)' }
  ];

  // Campos disponíveis para mapeamento (exemplo)
  const camposDisponiveis = [
    { value: 'data', label: 'Data' },
    { value: 'descricao', label: 'Descrição' },
    { value: 'valor', label: 'Valor' },
    { value: 'documento', label: 'Documento/Número' },
    { value: 'parceiro', label: 'Parceiro (Cliente/Fornecedor)' },
    { value: 'plano_contas', label: 'Plano de Contas' },
    { value: 'centro_custo', label: 'Centro de Custo' },
    { value: 'forma_pagamento', label: 'Forma de Pagamento' },
    { value: 'tipo', label: 'Tipo (Entrada/Saída)' }
  ];

  useEffect(() => {
    loadLayouts();
  }, []);

  useEffect(() => {
    filterLayouts();
  }, [searchTerm, tipoFilter, layouts]);

  const loadLayouts = () => {
    // Banco de dados vazio - nenhum layout cadastrado
    setLayouts([]);
  };

  const filterLayouts = () => {
    let filtered = [...layouts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(layout =>
        layout.nome_layout.toLowerCase().includes(term) ||
        layout.descricao?.toLowerCase().includes(term)
      );
    }

    if (tipoFilter !== 'TODOS') {
      filtered = filtered.filter(layout => layout.tipo_arquivo === tipoFilter);
    }

    setFilteredLayouts(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addMapeamento = () => {
    setFormData(prev => ({
      ...prev,
      mapeamento_campos: [
        ...prev.mapeamento_campos,
        { origem: '', destino: '', nome_origem: '' }
      ]
    }));
  };

  const removeMapeamento = (index) => {
    setFormData(prev => ({
      ...prev,
      mapeamento_campos: prev.mapeamento_campos.filter((_, i) => i !== index)
    }));
  };

  const updateMapeamento = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      mapeamento_campos: prev.mapeamento_campos.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações
    if (!formData.nome_layout || !formData.tipo_arquivo) {
      alert('Preencha todos os campos obrigatórios (Nome e Tipo de Arquivo)');
      return;
    }

    if (editingId) {
      // Atualizar
      setLayouts(prev =>
        prev.map(layout => layout.id === editingId ? { ...formData, id: editingId } : layout)
      );
    } else {
      // Criar novo
      const newId = Math.max(...layouts.map(l => l.id), 0) + 1;
      setLayouts(prev => [...prev, { ...formData, id: newId }]);
    }

    resetForm();
  };

  const handleEdit = (layout) => {
    setFormData({
      ...layout,
      mapeamento_campos: layout.mapeamento_campos || [],
      regras_validacao: layout.regras_validacao || [],
      regras_transformacao: layout.regras_transformacao || []
    });
    setEditingId(layout.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este layout?')) {
      setLayouts(prev => prev.filter(layout => layout.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      nome_layout: '',
      tipo_arquivo: '',
      descricao: '',
      delimitador: ';',
      encoding: 'UTF-8',
      tem_cabecalho: true,
      linha_inicio_dados: 1,
      mapeamento_campos: [],
      regras_validacao: [],
      regras_transformacao: [],
      status: 'ATIVO'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    return status === 'ATIVO'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo) => {
    const found = tiposArquivo.find(t => t.value === tipo);
    return found ? found.label : tipo;
  };

  return (
    <DashboardLayout screenCode="ADM-003">
      <div className="space-y-6">
        {!showForm ? (
          <>
            {/* Filtros e Ações */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Busca */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Layout
                  </label>
                  <input
                    type="text"
                    placeholder="Nome ou descrição do layout..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filtro de Tipo */}
                <div className="w-full md:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Arquivo
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                  >
                    <option value="TODOS">Todos os Tipos</option>
                    {tiposArquivo.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                {/* Botão Novo */}
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  + Novo Layout
                </Button>
              </div>
            </Card>

            {/* Lista de Layouts */}
            <Card title="Layouts Configurados">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome do Layout
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo de Arquivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campos Mapeados
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLayouts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          Nenhum layout encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredLayouts.map((layout) => (
                        <tr key={layout.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {layout.nome_layout}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTipoLabel(layout.tipo_arquivo)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {layout.descricao}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {layout.mapeamento_campos?.length || 0} campos
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(layout.status)}`}>
                              {layout.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(layout)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(layout.id)}
                              className="text-red-600 hover:text-red-900"
                            >
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
          </>
        ) : (
          /* Formulário de Cadastro/Edição */
          <form onSubmit={handleSubmit}>
            <Card
              title={editingId ? 'Editar Layout de Importação' : 'Novo Layout de Importação'}
              subtitle="Configure o layout para importação de arquivos"
            >
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Layout *
                      </label>
                      <input
                        type="text"
                        name="nome_layout"
                        value={formData.nome_layout}
                        onChange={handleInputChange}
                        placeholder="Ex: Extrato Itaú - CSV"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Arquivo *
                      </label>
                      <select
                        name="tipo_arquivo"
                        value={formData.tipo_arquivo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Selecione o tipo</option>
                        {tiposArquivo.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Descreva o objetivo deste layout de importação"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações do Arquivo */}
                {(formData.tipo_arquivo === 'EXTRATO_CSV' || formData.tipo_arquivo === 'PLANILHA_EXCEL') && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Configurações do Arquivo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {formData.tipo_arquivo === 'EXTRATO_CSV' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delimitador
                          </label>
                          <select
                            name="delimitador"
                            value={formData.delimitador}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {delimitadores.map(del => (
                              <option key={del.value} value={del.value}>{del.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Encoding
                        </label>
                        <select
                          name="encoding"
                          value={formData.encoding}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {encodings.map(enc => (
                            <option key={enc} value={enc}>{enc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Linha Início Dados
                        </label>
                        <input
                          type="number"
                          name="linha_inicio_dados"
                          value={formData.linha_inicio_dados}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="tem_cabecalho"
                            checked={formData.tem_cabecalho}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Possui Cabeçalho
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mapeamento de Campos */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mapeamento de Campos
                    </h3>
                    <Button type="button" variant="outline" onClick={addMapeamento}>
                      + Adicionar Campo
                    </Button>
                  </div>

                  {formData.mapeamento_campos.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        Nenhum campo mapeado. Clique em "Adicionar Campo" para começar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.mapeamento_campos.map((campo, index) => (
                        <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Campo Origem
                              </label>
                              <input
                                type="text"
                                value={campo.origem}
                                onChange={(e) => updateMapeamento(index, 'origem', e.target.value)}
                                placeholder="Ex: coluna_1"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nome Original
                              </label>
                              <input
                                type="text"
                                value={campo.nome_origem}
                                onChange={(e) => updateMapeamento(index, 'nome_origem', e.target.value)}
                                placeholder="Ex: Data"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Campo Destino
                              </label>
                              <select
                                value={campo.destino}
                                onChange={(e) => updateMapeamento(index, 'destino', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">Selecione</option>
                                {camposDisponiveis.map(c => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeMapeamento(index)}
                            className="mt-6 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Remover campo"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Observações sobre Validações e Transformações */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Regras de Validação e Transformação
                      </h4>
                      <p className="text-sm text-blue-800">
                        As regras de validação e transformação dos dados serão configuradas em uma versão futura do sistema.
                        Por enquanto, configure o mapeamento básico dos campos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingId ? 'Atualizar' : 'Salvar'} Layout
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
