'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function FormasPagamentoPage() {
  const [formas, setFormas] = useState([]);
  const [filteredFormas, setFilteredFormas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    tipo: 'DINHEIRO',
    taxa_percentual: '0',
    taxa_fixa: '0',
    gera_movimento_bancario: true,
    status: 'ATIVO'
  });

  const tiposPagamento = [
    { value: 'DINHEIRO', label: 'Dinheiro', icon: '💵' },
    { value: 'PIX', label: 'PIX', icon: '📱' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: '💳' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: '💳' },
    { value: 'BOLETO', label: 'Boleto Bancário', icon: '🧾' },
    { value: 'TRANSFERENCIA', label: 'Transferência Bancária', icon: '🏦' },
    { value: 'CHEQUE', label: 'Cheque', icon: '📝' },
    { value: 'OUTROS', label: 'Outros', icon: '📌' }
  ];

  useEffect(() => {
    loadFormas();
  }, []);

  useEffect(() => {
    filterFormas();
  }, [searchTerm, tipoFilter, formas]);

  const loadFormas = () => {
    // Mock data - substituir por chamada API real
    const mockData = [
      {
        id: 1,
        codigo: 'FP001',
        descricao: 'Dinheiro',
        tipo: 'DINHEIRO',
        taxa_percentual: 0,
        taxa_fixa: 0,
        gera_movimento_bancario: false,
        status: 'ATIVO'
      },
      {
        id: 2,
        codigo: 'FP002',
        descricao: 'PIX',
        tipo: 'PIX',
        taxa_percentual: 0,
        taxa_fixa: 0,
        gera_movimento_bancario: true,
        status: 'ATIVO'
      },
      {
        id: 3,
        codigo: 'FP003',
        descricao: 'Cartão de Crédito - Visa',
        tipo: 'CARTAO_CREDITO',
        taxa_percentual: 3.50,
        taxa_fixa: 0,
        gera_movimento_bancario: true,
        status: 'ATIVO'
      },
      {
        id: 4,
        codigo: 'FP004',
        descricao: 'Boleto Bancário',
        tipo: 'BOLETO',
        taxa_percentual: 0,
        taxa_fixa: 2.50,
        gera_movimento_bancario: true,
        status: 'ATIVO'
      }
    ];
    setFormas(mockData);
  };

  const filterFormas = () => {
    let filtered = [...formas];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(forma =>
        forma.codigo.toLowerCase().includes(term) ||
        forma.descricao.toLowerCase().includes(term)
      );
    }

    if (tipoFilter !== 'TODOS') {
      filtered = filtered.filter(forma => forma.tipo === tipoFilter);
    }

    setFilteredFormas(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.codigo || !formData.descricao) {
      alert('Preencha código e descrição');
      return;
    }

    const dataToSave = {
      ...formData,
      taxa_percentual: parseFloat(formData.taxa_percentual) || 0,
      taxa_fixa: parseFloat(formData.taxa_fixa) || 0
    };

    if (editingId) {
      setFormas(prev =>
        prev.map(forma => forma.id === editingId ? { ...dataToSave, id: editingId } : forma)
      );
    } else {
      const newId = Math.max(...formas.map(f => f.id), 0) + 1;
      setFormas(prev => [...prev, { ...dataToSave, id: newId }]);
    }

    resetForm();
  };

  const handleEdit = (forma) => {
    setFormData({
      codigo: forma.codigo,
      descricao: forma.descricao,
      tipo: forma.tipo,
      taxa_percentual: forma.taxa_percentual?.toString() || '0',
      taxa_fixa: forma.taxa_fixa?.toString() || '0',
      gera_movimento_bancario: forma.gera_movimento_bancario !== undefined ? forma.gera_movimento_bancario : true,
      status: forma.status
    });
    setEditingId(forma.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      setFormas(prev => prev.filter(forma => forma.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      descricao: '',
      tipo: 'DINHEIRO',
      taxa_percentual: '0',
      taxa_fixa: '0',
      gera_movimento_bancario: true,
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

  const getTipoIcon = (tipo) => {
    const tipoObj = tiposPagamento.find(t => t.value === tipo);
    return tipoObj ? tipoObj.icon : '📌';
  };

  const getTipoLabel = (tipo) => {
    const tipoObj = tiposPagamento.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  return (
    <DashboardLayout screenCode="FIN-010">
      <div className="space-y-6">
        {!showForm ? (
          <>
            {/* Filtros e Ações */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Forma de Pagamento
                  </label>
                  <input
                    type="text"
                    placeholder="Código ou descrição..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="w-full md:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                  >
                    <option value="TODOS">Todos os Tipos</option>
                    {tiposPagamento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button variant="primary" onClick={() => setShowForm(true)}>
                  + Nova Forma de Pagamento
                </Button>
              </div>
            </Card>

            {/* Lista de Formas de Pagamento */}
            <Card title="Formas de Pagamento Cadastradas">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxa %
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxa Fixa
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFormas.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          Nenhuma forma de pagamento encontrada
                        </td>
                      </tr>
                    ) : (
                      filteredFormas.map((forma) => (
                        <tr key={forma.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {forma.codigo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {forma.descricao}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="flex items-center">
                              <span className="mr-2">{getTipoIcon(forma.tipo)}</span>
                              {getTipoLabel(forma.tipo)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {forma.taxa_percentual > 0 ? `${forma.taxa_percentual.toFixed(2)}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {forma.taxa_fixa > 0 ? `R$ ${forma.taxa_fixa.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(forma.status)}`}>
                              {forma.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(forma)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(forma.id)}
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
          /* Formulário */
          <form onSubmit={handleSubmit}>
            <Card
              title={editingId ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
              subtitle="Configure a forma de pagamento"
            >
              <div className="space-y-6">
                {/* Dados Básicos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Dados Básicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código *
                      </label>
                      <input
                        type="text"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        placeholder="Ex: FP001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição *
                      </label>
                      <input
                        type="text"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        placeholder="Ex: Cartão de Crédito Visa"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo *
                      </label>
                      <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {tiposPagamento.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.icon} {tipo.label}
                          </option>
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
                  </div>
                </div>

                {/* Taxas e Prazos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Taxas e Prazos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa Percentual (%)
                      </label>
                      <input
                        type="number"
                        name="taxa_percentual"
                        value={formData.taxa_percentual}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Taxa percentual sobre o valor
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa Fixa (R$)
                      </label>
                      <input
                        type="number"
                        name="taxa_fixa"
                        value={formData.taxa_fixa}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Valor fixo por transação
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Configurações
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="gera_movimento_bancario"
                        checked={formData.gera_movimento_bancario}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        Gera movimento bancário (integração com conciliação bancária)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Resumo de Custo */}
                {(parseFloat(formData.taxa_percentual) > 0 || parseFloat(formData.taxa_fixa) > 0) && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Exemplo de Custo em R$ 1.000,00:
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      {parseFloat(formData.taxa_percentual) > 0 && (
                        <div>Taxa percentual: R$ {(1000 * parseFloat(formData.taxa_percentual) / 100).toFixed(2)}</div>
                      )}
                      {parseFloat(formData.taxa_fixa) > 0 && (
                        <div>Taxa fixa: R$ {parseFloat(formData.taxa_fixa).toFixed(2)}</div>
                      )}
                      <div className="font-semibold pt-2 border-t border-blue-300">
                        Valor líquido: R$ {(
                          1000 -
                          (1000 * parseFloat(formData.taxa_percentual || 0) / 100) -
                          parseFloat(formData.taxa_fixa || 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingId ? 'Atualizar' : 'Salvar'} Forma de Pagamento
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
