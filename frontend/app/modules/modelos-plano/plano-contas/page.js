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
  const [empresaId, setEmpresaId] = useState(null);

  useEffect(() => {
    const salva = localStorage.getItem('empresaSelecionadaId');
    if (salva) {
      setEmpresaId(Number(salva));
    }
  }, []);

  useEffect(() => {
    loadContas();
  }, [empresaId]);

  const loadContas = async () => {
    try {
      const url = empresaId ? `/api/plano-contas?empresa_id=${empresaId}` : '/api/plano-contas';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const normalizados = data.data.map((item) => ({
          ...item,
          compoe_dre: item.compoe_dre === 1 || item.compoe_dre === true,
          aceita_lancamento: item.aceita_lancamento === 1 || item.aceita_lancamento === true,
          utilizado_objetivo: item.utilizado_objetivo === 1 || item.utilizado_objetivo === true,
        }));

        // Construir árvore hierárquica
        const tree = buildTree(normalizados);
        setContas(tree);
      }
    } catch (error) {
      console.error('Erro ao carregar plano de contas:', error);
    }
  };

  const buildTree = (items) => {
    const map = {};
    const roots = [];

    // Criar mapa de itens
    items.forEach(item => {
      map[item.id] = { ...item, filhos: [] };
    });

    // Construir árvore
    items.forEach(item => {
      if (item.conta_pai_id) {
        if (map[item.conta_pai_id]) {
          map[item.conta_pai_id].filhos.push(map[item.id]);
        }
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.codigo_conta || !formData.descricao) {
      const mensagem = document.createElement('div');
      mensagem.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50';
      mensagem.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">Preencha código e descrição</p>
          </div>
        </div>
      `;
      document.body.appendChild(mensagem);
      setTimeout(() => mensagem.remove(), 5000);
      return;
    }

    try {
      const payload = {
        ...formData,
        compoe_dre: !!formData.compoe_dre,
        empresa_id: empresaId,
      };

      if (editingId) {
        // Atualizar conta existente
        const response = await fetch('/api/plano-contas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId })
        });

        const data = await response.json();

        if (data.success) {
          const mensagem = document.createElement('div');
          mensagem.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50';
          mensagem.innerHTML = `
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">Conta atualizada com sucesso!</p>
              </div>
            </div>
          `;
          document.body.appendChild(mensagem);
          setTimeout(() => mensagem.remove(), 5000);
        } else {
          throw new Error(data.error || 'Erro ao atualizar conta');
        }
      } else {
        // Criar nova conta
        const response = await fetch('/api/plano-contas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
          const mensagem = document.createElement('div');
          mensagem.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50';
          mensagem.innerHTML = `
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">Conta criada com sucesso!</p>
              </div>
            </div>
          `;
          document.body.appendChild(mensagem);
          setTimeout(() => mensagem.remove(), 5000);
        } else {
          throw new Error(data.error || 'Erro ao criar conta');
        }
      }

      resetForm();
      loadContas(); // Recarregar árvore
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      const mensagem = document.createElement('div');
      mensagem.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50';
      mensagem.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">Erro ao salvar: ${error.message}</p>
          </div>
        </div>
      `;
      document.body.appendChild(mensagem);
      setTimeout(() => mensagem.remove(), 5000);
    }
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

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja inativar esta conta?')) {
      try {
        const response = await fetch(`/api/plano-contas?id=${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          const mensagem = document.createElement('div');
          mensagem.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50';
          mensagem.innerHTML = `
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">Conta inativada com sucesso!</p>
              </div>
            </div>
          `;
          document.body.appendChild(mensagem);
          setTimeout(() => mensagem.remove(), 5000);
          loadContas();
        } else {
          throw new Error(data.error || 'Erro ao inativar conta');
        }
      } catch (error) {
        console.error('Erro ao inativar conta:', error);
        const mensagem = document.createElement('div');
        mensagem.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50';
        mensagem.innerHTML = `
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium">Erro: ${error.message}</p>
            </div>
          </div>
        `;
        document.body.appendChild(mensagem);
        setTimeout(() => mensagem.remove(), 5000);
      }
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
