'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function EstruturaDREPage() {
  const [itens, setItens] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    nivel: 1,
    tipo: 'RECEITA_BRUTA',
    ordem_exibicao: 1,
    eh_totalizadora: false,
    formula: '',
    exibir_negativo: false,
    negrito: false,
    italico: false,
    cor_texto: '',
    status: 'ATIVO'
  });

  const tiposDRE = [
    { value: 'RECEITA_BRUTA', label: 'Receita Bruta' },
    { value: 'DEDUCOES', label: 'Deduções' },
    { value: 'RECEITA_LIQUIDA', label: 'Receita Líquida' },
    { value: 'CPV', label: 'Custo dos Produtos Vendidos (CPV)' },
    { value: 'LUCRO_BRUTO', label: 'Lucro Bruto' },
    { value: 'DESPESAS_OPERACIONAIS', label: 'Despesas Operacionais' },
    { value: 'DESPESAS_VENDAS', label: 'Despesas com Vendas' },
    { value: 'DESPESAS_ADMIN', label: 'Despesas Administrativas' },
    { value: 'DESPESAS_FINANCEIRAS', label: 'Despesas Financeiras' },
    { value: 'RECEITAS_FINANCEIRAS', label: 'Receitas Financeiras' },
    { value: 'RESULTADO_FINANCEIRO', label: 'Resultado Financeiro' },
    { value: 'OUTRAS_RECEITAS', label: 'Outras Receitas' },
    { value: 'OUTRAS_DESPESAS', label: 'Outras Despesas' },
    { value: 'EBITDA', label: 'EBITDA' },
    { value: 'LUCRO_OPERACIONAL', label: 'Lucro Operacional' },
    { value: 'RESULTADO_ANTES_IR', label: 'Resultado Antes do IR' },
    { value: 'IR_CSLL', label: 'IR e CSLL' },
    { value: 'LUCRO_LIQUIDO', label: 'Lucro Líquido' }
  ];

  const cores = [
    { value: '', label: 'Padrão (Preto)' },
    { value: '#16a34a', label: 'Verde (Positivo)' },
    { value: '#dc2626', label: 'Vermelho (Negativo)' },
    { value: '#2563eb', label: 'Azul (Destaque)' },
    { value: '#9333ea', label: 'Roxo (Especial)' },
    { value: '#ea580c', label: 'Laranja (Atenção)' }
  ];

  useEffect(() => {
    loadItens();
  }, []);

  const loadItens = () => {
    // Mock data - substituir por chamada API real
    const mockData = [
      {
        id: 1,
        codigo: '1',
        descricao: 'RECEITA BRUTA',
        nivel: 1,
        tipo: 'RECEITA_BRUTA',
        ordem_exibicao: 1,
        eh_totalizadora: true,
        formula: null,
        exibir_negativo: false,
        negrito: true,
        italico: false,
        cor_texto: '#16a34a',
        status: 'ATIVO'
      },
      {
        id: 2,
        codigo: '2',
        descricao: '(-) Deduções',
        nivel: 1,
        tipo: 'DEDUCOES',
        ordem_exibicao: 2,
        eh_totalizadora: true,
        formula: null,
        exibir_negativo: true,
        negrito: false,
        italico: false,
        cor_texto: '',
        status: 'ATIVO'
      },
      {
        id: 3,
        codigo: '3',
        descricao: '(=) RECEITA LÍQUIDA',
        nivel: 1,
        tipo: 'RECEITA_LIQUIDA',
        ordem_exibicao: 3,
        eh_totalizadora: true,
        formula: '{RECEITA_BRUTA} - {DEDUCOES}',
        exibir_negativo: false,
        negrito: true,
        italico: false,
        cor_texto: '#2563eb',
        status: 'ATIVO'
      },
      {
        id: 4,
        codigo: '4',
        descricao: '(-) CPV',
        nivel: 1,
        tipo: 'CPV',
        ordem_exibicao: 4,
        eh_totalizadora: true,
        formula: null,
        exibir_negativo: true,
        negrito: false,
        italico: false,
        cor_texto: '',
        status: 'ATIVO'
      },
      {
        id: 5,
        codigo: '5',
        descricao: '(=) LUCRO BRUTO',
        nivel: 1,
        tipo: 'LUCRO_BRUTO',
        ordem_exibicao: 5,
        eh_totalizadora: true,
        formula: '{RECEITA_LIQUIDA} - {CPV}',
        exibir_negativo: false,
        negrito: true,
        italico: false,
        cor_texto: '#16a34a',
        status: 'ATIVO'
      }
    ];
    setItens(mockData);
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

    if (editingId) {
      setItens(prev =>
        prev.map(item => item.id === editingId ? { ...formData, id: editingId } : item)
      );
    } else {
      const newId = Math.max(...itens.map(i => i.id), 0) + 1;
      const maxOrdem = Math.max(...itens.map(i => i.ordem_exibicao), 0);
      setItens(prev => [...prev, {
        ...formData,
        id: newId,
        ordem_exibicao: maxOrdem + 1
      }]);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setFormData({
      codigo: item.codigo,
      descricao: item.descricao,
      nivel: item.nivel,
      tipo: item.tipo,
      ordem_exibicao: item.ordem_exibicao,
      eh_totalizadora: item.eh_totalizadora || false,
      formula: item.formula || '',
      exibir_negativo: item.exibir_negativo || false,
      negrito: item.negrito || false,
      italico: item.italico || false,
      cor_texto: item.cor_texto || '',
      status: item.status
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este item da estrutura DRE?')) {
      setItens(prev => prev.filter(item => item.id !== id));
    }
  };

  const moveUp = (id) => {
    const index = itens.findIndex(i => i.id === id);
    if (index > 0) {
      const newItens = [...itens];
      [newItens[index - 1], newItens[index]] = [newItens[index], newItens[index - 1]];
      // Atualizar ordem_exibicao
      newItens.forEach((item, idx) => {
        item.ordem_exibicao = idx + 1;
      });
      setItens(newItens);
    }
  };

  const moveDown = (id) => {
    const index = itens.findIndex(i => i.id === id);
    if (index < itens.length - 1) {
      const newItens = [...itens];
      [newItens[index], newItens[index + 1]] = [newItens[index + 1], newItens[index]];
      // Atualizar ordem_exibicao
      newItens.forEach((item, idx) => {
        item.ordem_exibicao = idx + 1;
      });
      setItens(newItens);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      descricao: '',
      nivel: 1,
      tipo: 'RECEITA_BRUTA',
      ordem_exibicao: 1,
      eh_totalizadora: false,
      formula: '',
      exibir_negativo: false,
      negrito: false,
      italico: false,
      cor_texto: '',
      status: 'ATIVO'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getPreviewStyle = (item) => {
    const style = {
      color: item.cor_texto || '#000',
      fontWeight: item.negrito ? 'bold' : 'normal',
      fontStyle: item.italico ? 'italic' : 'normal',
      paddingLeft: `${item.nivel * 20}px`
    };
    return style;
  };

  return (
    <DashboardLayout title="Estrutura DRE" pageCode="FIN-002">
      <div className="space-y-6">
        {!showForm ? (
          <>
            {/* Ações */}
            <Card>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Demonstração do Resultado do Exercício (DRE)
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure a estrutura e formatação do relatório DRE
                  </p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  + Novo Item
                </Button>
              </div>
            </Card>

            {/* Preview da Estrutura DRE */}
            <Card title="Preview da Estrutura DRE" subtitle="Como será exibido no relatório">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-2">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 group"
                    >
                      {/* Preview */}
                      <div className="flex-1">
                        <span style={getPreviewStyle(item)} className="text-sm">
                          {item.descricao}
                        </span>
                        {item.eh_totalizadora && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                            Totalizadora
                          </span>
                        )}
                        {item.formula && (
                          <span className="ml-2 text-xs text-gray-500 font-mono">
                            {item.formula}
                          </span>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveUp(item.id)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                          title="Mover para cima"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveDown(item.id)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                          title="Mover para baixo"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}

                  {itens.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum item configurado. Clique em "+ Novo Item" para começar.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Fórmulas:</h4>
                <p className="text-sm text-blue-800">
                  Use <code className="bg-blue-100 px-1 rounded">{`{TIPO}`}</code> para referenciar valores de outros itens.
                  Exemplo: <code className="bg-blue-100 px-1 rounded">{`{RECEITA_BRUTA} - {DEDUCOES}`}</code>
                </p>
              </div>
            </Card>
          </>
        ) : (
          /* Formulário */
          <form onSubmit={handleSubmit}>
            <Card
              title={editingId ? 'Editar Item DRE' : 'Novo Item DRE'}
              subtitle="Configure o item da estrutura do DRE"
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
                        placeholder="Ex: 1, 1.1, etc"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nível
                      </label>
                      <input
                        type="number"
                        name="nivel"
                        value={formData.nivel}
                        onChange={handleInputChange}
                        min="1"
                        max="5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
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
                        Descrição *
                      </label>
                      <input
                        type="text"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        placeholder="Ex: RECEITA BRUTA, (-) Deduções, (=) LUCRO LÍQUIDO"
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
                        {tiposDRE.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Configurações de Cálculo */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Configurações de Cálculo
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="eh_totalizadora"
                        checked={formData.eh_totalizadora}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        É totalizadora (soma valores de contas vinculadas ou usa fórmula)
                      </span>
                    </label>

                    {formData.eh_totalizadora && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fórmula de Cálculo (opcional)
                        </label>
                        <input
                          type="text"
                          name="formula"
                          value={formData.formula}
                          onChange={handleInputChange}
                          placeholder="Ex: {RECEITA_BRUTA} - {DEDUCOES}"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use {`{TIPO}`} para referenciar outros itens. Ex: {`{RECEITA_LIQUIDA} - {CPV}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Formatação Visual */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Formatação Visual
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor do Texto
                      </label>
                      <select
                        name="cor_texto"
                        value={formData.cor_texto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {cores.map(cor => (
                          <option key={cor.value} value={cor.value}>{cor.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="negrito"
                          checked={formData.negrito}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          <strong>Negrito</strong>
                        </span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="italico"
                          checked={formData.italico}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          <em>Itálico</em>
                        </span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="exibir_negativo"
                          checked={formData.exibir_negativo}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          Exibir valores negativos (com sinal -)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Preview
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span
                      style={{
                        color: formData.cor_texto || '#000',
                        fontWeight: formData.negrito ? 'bold' : 'normal',
                        fontStyle: formData.italico ? 'italic' : 'normal',
                        paddingLeft: `${formData.nivel * 20}px`
                      }}
                      className="text-sm"
                    >
                      {formData.descricao || 'Digite uma descrição...'}
                    </span>
                    {formData.eh_totalizadora && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        Totalizadora
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingId ? 'Atualizar' : 'Salvar'} Item
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
