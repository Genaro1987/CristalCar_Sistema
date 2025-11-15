'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function PlanoContasPage() {
  const [contas, setContas] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    codigo_conta: '',
    descricao: '',
    tipo: 'RECEITA',
    nivel: 1,
    conta_pai_id: null,
    compoe_dre: true,
    tipo_gasto: '',
    aceita_lancamento: true,
    utilizado_objetivo: false,
    status: 'ATIVO',
    observacoes: ''
  });

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = () => {
    // Mock data - substituir por chamada API real
    const mockData = [
      {
        id: 1,
        codigo_conta: '1',
        descricao: 'RECEITAS',
        tipo: 'RECEITA',
        nivel: 1,
        conta_pai_id: null,
        compoe_dre: true,
        aceita_lancamento: false,
        status: 'ATIVO',
        filhos: [
          {
            id: 2,
            codigo_conta: '1.1',
            descricao: 'Receitas Operacionais',
            tipo: 'RECEITA',
            nivel: 2,
            conta_pai_id: 1,
            compoe_dre: true,
            aceita_lancamento: false,
            status: 'ATIVO',
            filhos: [
              {
                id: 3,
                codigo_conta: '1.1.1',
                descricao: 'Vendas de Serviços',
                tipo: 'RECEITA',
                nivel: 3,
                conta_pai_id: 2,
                compoe_dre: true,
                aceita_lancamento: true,
                status: 'ATIVO',
                filhos: []
              },
              {
                id: 4,
                codigo_conta: '1.1.2',
                descricao: 'Vendas de Produtos',
                tipo: 'RECEITA',
                nivel: 3,
                conta_pai_id: 2,
                compoe_dre: true,
                aceita_lancamento: true,
                status: 'ATIVO',
                filhos: []
              }
            ]
          }
        ]
      },
      {
        id: 5,
        codigo_conta: '2',
        descricao: 'DESPESAS',
        tipo: 'DESPESA',
        nivel: 1,
        conta_pai_id: null,
        compoe_dre: true,
        aceita_lancamento: false,
        status: 'ATIVO',
        filhos: [
          {
            id: 6,
            codigo_conta: '2.1',
            descricao: 'Despesas Operacionais',
            tipo: 'DESPESA',
            nivel: 2,
            conta_pai_id: 5,
            compoe_dre: true,
            aceita_lancamento: false,
            status: 'ATIVO',
            tipo_gasto: 'FIXO',
            filhos: [
              {
                id: 7,
                codigo_conta: '2.1.1',
                descricao: 'Pessoal',
                tipo: 'DESPESA',
                nivel: 3,
                conta_pai_id: 6,
                compoe_dre: true,
                aceita_lancamento: false,
                tipo_gasto: 'FIXO',
                status: 'ATIVO',
                filhos: [
                  {
                    id: 8,
                    codigo_conta: '2.1.1.01',
                    descricao: 'Salários',
                    tipo: 'DESPESA',
                    nivel: 4,
                    conta_pai_id: 7,
                    compoe_dre: true,
                    aceita_lancamento: true,
                    tipo_gasto: 'FIXO',
                    status: 'ATIVO',
                    filhos: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
    setContas(mockData);
    // Expandir nível 1 por padrão
    setExpandedNodes(new Set([1, 5]));
  };

  const toggleNode = (id) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
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

    // Validações
    if (!formData.codigo_conta || !formData.descricao) {
      alert('Preencha código e descrição');
      return;
    }

    if (editingId) {
      // Atualizar conta existente
      // TODO: implementar atualização recursiva
      alert('Conta atualizada!');
    } else {
      // Criar nova conta
      alert('Nova conta criada!');
    }

    resetForm();
    loadContas(); // Recarregar árvore
  };

  const handleAddRoot = () => {
    setParentId(null);
    setFormData({
      ...formData,
      codigo_conta: '',
      descricao: '',
      nivel: 1,
      conta_pai_id: null,
      aceita_lancamento: false // Contas raiz geralmente não aceitam lançamento
    });
    setShowForm(true);
  };

  const handleAddChild = (parent) => {
    setParentId(parent.id);
    // Gerar próximo código baseado no pai
    const proximoCodigo = gerarProximoCodigo(parent);
    setFormData({
      ...formData,
      codigo_conta: proximoCodigo,
      descricao: '',
      tipo: parent.tipo, // Herda o tipo do pai
      nivel: parent.nivel + 1,
      conta_pai_id: parent.id,
      tipo_gasto: parent.tipo_gasto || '',
      aceita_lancamento: parent.nivel >= 2 // A partir do nível 3, pode aceitar lançamento
    });
    setShowForm(true);
  };

  const gerarProximoCodigo = (parent) => {
    // TODO: implementar lógica para gerar próximo código
    // Por agora, retorna um placeholder
    const baseCode = parent.codigo_conta;
    return `${baseCode}.X`;
  };

  const handleEdit = (conta) => {
    setFormData({
      codigo_conta: conta.codigo_conta,
      descricao: conta.descricao,
      tipo: conta.tipo,
      nivel: conta.nivel,
      conta_pai_id: conta.conta_pai_id,
      compoe_dre: conta.compoe_dre !== undefined ? conta.compoe_dre : true,
      tipo_gasto: conta.tipo_gasto || '',
      aceita_lancamento: conta.aceita_lancamento !== undefined ? conta.aceita_lancamento : true,
      utilizado_objetivo: conta.utilizado_objetivo || false,
      status: conta.status,
      observacoes: conta.observacoes || ''
    });
    setEditingId(conta.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta conta? Todas as contas filhas também serão excluídas.')) {
      // TODO: implementar exclusão recursiva
      alert('Conta excluída!');
      loadContas();
    }
  };

  const resetForm = () => {
    setFormData({
      codigo_conta: '',
      descricao: '',
      tipo: 'RECEITA',
      nivel: 1,
      conta_pai_id: null,
      compoe_dre: true,
      tipo_gasto: '',
      aceita_lancamento: true,
      utilizado_objetivo: false,
      status: 'ATIVO',
      observacoes: ''
    });
    setEditingId(null);
    setParentId(null);
    setShowForm(false);
  };

  const renderTree = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    const filteredNodes = nodes.filter(node => {
      if (tipoFilter !== 'TODOS' && node.tipo !== tipoFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return node.codigo_conta.toLowerCase().includes(term) ||
               node.descricao.toLowerCase().includes(term);
      }
      return true;
    });

    return filteredNodes.map(node => (
      <div key={node.id} className="mb-1">
        <div
          className={`flex items-center p-2 hover:bg-gray-50 rounded ${
            level === 0 ? 'bg-gray-100 font-semibold' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {/* Ícone de expansão */}
          {node.filhos && node.filhos.length > 0 ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="mr-2 w-5 h-5 flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              {expandedNodes.has(node.id) ? '▼' : '▶'}
            </button>
          ) : (
            <span className="mr-2 w-5"></span>
          )}

          {/* Código e Descrição */}
          <div className="flex-1">
            <span className={`font-mono text-sm ${node.tipo === 'RECEITA' ? 'text-green-700' : 'text-red-700'}`}>
              {node.codigo_conta}
            </span>
            <span className="ml-3 text-gray-900">{node.descricao}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center space-x-2 mr-4">
            {node.aceita_lancamento && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                Lança
              </span>
            )}
            {node.tipo_gasto && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                {node.tipo_gasto}
              </span>
            )}
            {node.status === 'INATIVO' && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded">
                Inativo
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleAddChild(node)}
              className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"
              title="Adicionar conta filha"
            >
              + Filha
            </button>
            <button
              onClick={() => handleEdit(node)}
              className="text-xs px-2 py-1 text-primary-600 hover:bg-primary-50 rounded"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(node.id)}
              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
            >
              Excluir
            </button>
          </div>
        </div>

        {/* Renderizar filhos se expandido */}
        {expandedNodes.has(node.id) && node.filhos && node.filhos.length > 0 && (
          <div>
            {renderTree(node.filhos, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <DashboardLayout screenCode="FIN-001">
      <div className="space-y-6">
        {!showForm ? (
          <>
            {/* Filtros e Ações */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Busca */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Conta
                  </label>
                  <input
                    type="text"
                    placeholder="Código ou descrição..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filtro de Tipo */}
                <div className="w-full md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="RECEITA">Receitas</option>
                    <option value="DESPESA">Despesas</option>
                  </select>
                </div>

                {/* Botões */}
                <Button variant="outline" onClick={() => {
                  setExpandedNodes(new Set());
                }}>
                  Recolher Todos
                </Button>
                <Button variant="primary" onClick={handleAddRoot}>
                  + Nova Conta Raiz
                </Button>
              </div>
            </Card>

            {/* Árvore de Contas */}
            <Card title="Hierarquia do Plano de Contas" subtitle="Estrutura em árvore até 9 níveis">
              <div className="bg-white rounded-lg border border-gray-200">
                {renderTree(contas)}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Legenda:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-800">
                  <div><span className="font-mono text-green-700">Verde</span> = Receita</div>
                  <div><span className="font-mono text-red-700">Vermelho</span> = Despesa</div>
                  <div><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Lança</span> = Aceita lançamento</div>
                  <div><span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">FIXO/VARIAVEL</span> = Tipo de gasto</div>
                </div>
              </div>
            </Card>
          </>
        ) : (
          /* Formulário de Cadastro/Edição */
          <form onSubmit={handleSubmit}>
            <Card
              title={editingId ? 'Editar Conta' : parentId ? 'Nova Conta Filha' : 'Nova Conta Raiz'}
              subtitle={parentId ? `Será criada como filha da conta selecionada` : ''}
            >
              <div className="space-y-6">
                {/* Dados Básicos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Dados Básicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código da Conta *
                      </label>
                      <input
                        type="text"
                        name="codigo_conta"
                        value={formData.codigo_conta}
                        onChange={handleInputChange}
                        placeholder="Ex: 1.1.1.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formato hierárquico (ex: 1 ou 1.1 ou 1.1.1 etc)
                      </p>
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
                        max="9"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Nível na hierarquia (1 a 9)
                      </p>
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
                        placeholder="Nome da conta"
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
                        disabled={!!parentId}
                      >
                        <option value="RECEITA">Receita</option>
                        <option value="DESPESA">Despesa</option>
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

                {/* Configurações */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Configurações
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.tipo === 'DESPESA' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Gasto
                        </label>
                        <select
                          name="tipo_gasto"
                          value={formData.tipo_gasto}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Não definido</option>
                          <option value="FIXO">Fixo</option>
                          <option value="VARIAVEL">Variável</option>
                        </select>
                      </div>
                    )}

                    <div className="md:col-span-2 space-y-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="compoe_dre"
                          checked={formData.compoe_dre}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          Compõe DRE (Demonstração de Resultado)
                        </span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="aceita_lancamento"
                          checked={formData.aceita_lancamento}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          Aceita lançamento direto (contas sintéticas não aceitam)
                        </span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="utilizado_objetivo"
                          checked={formData.utilizado_objetivo}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          Utilizado em objetivos e metas
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingId ? 'Atualizar' : 'Salvar'} Conta
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
