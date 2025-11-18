'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function EstruturaDREPage() {
  const [itens, setItens] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [tiposEstrutura, setTiposEstrutura] = useState([]);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    nivel: 1,
    tipo: 'RECEITA_BRUTA',
    tipo_estrutura_id: null,
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
    const salva = localStorage.getItem('empresaSelecionadaId');
    if (salva) setEmpresaId(Number(salva));
  }, []);

  useEffect(() => {
    carregarTiposEstrutura();
  }, []);

  useEffect(() => {
    if (tiposEstrutura.length > 0 && !formData.tipo_estrutura_id) {
      const correspondente = tiposEstrutura.find(
        (t) => (t.codigo || '').toUpperCase() === (formData.tipo || '').toUpperCase()
      );
      const padrao = correspondente || tiposEstrutura[0];
      if (padrao) {
        setFormData((prev) => ({
          ...prev,
          tipo_estrutura_id: Number(padrao.id),
          tipo: padrao.codigo || prev.tipo,
        }));
      }
    }
  }, [tiposEstrutura]);

  useEffect(() => {
    loadItens();
    carregarModelos();
  }, [empresaId]);

  useEffect(() => {
    if (modeloSelecionado) {
      loadItens(modeloSelecionado);
    }
  }, [modeloSelecionado]);

  const carregarTiposEstrutura = async () => {
    try {
      const resp = await fetch('/api/tipos-estrutura-dre');
      if (resp.ok) {
        const data = await resp.json();
        const normalizados = (data || []).map((tipo) => ({
          ...tipo,
          id: Number(tipo.id),
        }));
        setTiposEstrutura(normalizados);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de estrutura do DRE:', error);
    }
  };

  const carregarModelos = async () => {
    try {
      const resp = await fetch('/api/modelos-dre');
      if (resp.ok) {
        const data = await resp.json();
        const normalizados = (data || []).map((m) => ({
          ...m,
          id: Number(m.id),
        }));
        setModelos(normalizados);

        if (!modeloSelecionado && normalizados.length > 0) {
          const padrao = normalizados.find((m) => m.padrao === 1 || m.padrao === true);
          setModeloSelecionado(padrao?.id || normalizados[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar modelos DRE:', error);
    }
  };

  const loadItens = async (modeloId = modeloSelecionado) => {
    try {
      const params = new URLSearchParams();
      if (modeloId) params.append('modelo_id', modeloId);
      if (empresaId) params.append('empresa_id', empresaId);
      const query = params.toString();
      const response = await fetch(`/api/estrutura-dre${query ? `?${query}` : ''}`);
      const data = await response.json();

      if (data.success) {
        const normalizados = (data.data || []).map((item) => ({
          ...item,
          descricao: (item.descricao || '').trim(),
          codigo: (item.codigo || '').toString().trim(),
          tipo_estrutura_id: item.tipo_estrutura_id ? Number(item.tipo_estrutura_id) : null,
        }));
        const filtrados = normalizados.filter(item => Number(item.id) !== 0);
        setItens(filtrados);
      }
    } catch (error) {
      console.error('Erro ao carregar estrutura DRE:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTipoChange = (valorSelecionado) => {
    const encontrado = tiposEstrutura.find((t) => `${t.id}` === valorSelecionado);
    if (encontrado) {
      setFormData((prev) => ({
        ...prev,
        tipo_estrutura_id: Number(encontrado.id),
        tipo: encontrado.codigo || encontrado.nome,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tipo_estrutura_id: null,
        tipo: valorSelecionado,
      }));
    }
  };

  const obterTipoLabel = (codigo, tipoId) => {
    const porId = tiposEstrutura.find((t) => tipoId && Number(t.id) === Number(tipoId));
    if (porId) return porId.nome || porId.codigo;
    const porCodigo = tiposEstrutura.find(
      (t) => (t.codigo || '').toUpperCase() === (codigo || '').toUpperCase()
    );
    if (porCodigo) return porCodigo.nome || porCodigo.codigo;
    return tiposDRE.find((tipo) => tipo.value === codigo)?.label || codigo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo || !formData.descricao) {
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
        codigo: formData.codigo,
        descricao: formData.descricao,
        nivel: formData.nivel,
        tipo: formData.tipo,
        tipo_estrutura_id: formData.tipo_estrutura_id,
        ordem_exibicao: formData.ordem_exibicao,
        formula: formData.eh_totalizadora ? formData.formula : null,
        exibir_negativo: formData.exibir_negativo,
        negrito: formData.negrito,
        modelo_dre_id: modeloSelecionado || null,
        empresa_id: empresaId,
      };

      if (editingId) {
        // Atualizar item existente
        const response = await fetch('/api/estrutura-dre', {
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
                <p class="text-sm font-medium">Item DRE atualizado com sucesso!</p>
              </div>
            </div>
          `;
          document.body.appendChild(mensagem);
          setTimeout(() => mensagem.remove(), 5000);
        } else {
          throw new Error(data.error || 'Erro ao atualizar item DRE');
        }
      } else {
        // Criar novo item
        const response = await fetch('/api/estrutura-dre', {
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
                <p class="text-sm font-medium">Item DRE criado com sucesso!</p>
              </div>
            </div>
          `;
          document.body.appendChild(mensagem);
          setTimeout(() => mensagem.remove(), 5000);
        } else {
          throw new Error(data.error || 'Erro ao criar item DRE');
        }
      }

      resetForm();
      loadItens();
    } catch (error) {
      console.error('Erro ao salvar item DRE:', error);
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

  const handleEdit = (item) => {
    setFormData({
      codigo: item.codigo,
      descricao: item.descricao,
      nivel: item.nivel,
      tipo: item.tipo,
      tipo_estrutura_id: item.tipo_estrutura_id || null,
      ordem_exibicao: item.ordem_exibicao,
      eh_totalizadora: item.eh_totalizadora || false,
      formula: item.formula || '',
      exibir_negativo: item.exibir_negativo || false,
      negrito: item.negrito || false,
      italico: item.italico || false,
      cor_texto: item.cor_texto || '',
      status: item.status
    });
    if (item.modelo_dre_id) {
      setModeloSelecionado(Number(item.modelo_dre_id));
    }
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este item da estrutura DRE?')) {
      try {
        const response = await fetch(`/api/estrutura-dre?id=${id}`, {
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
                <p class="text-sm font-medium">Item DRE excluído com sucesso!</p>
              </div>
            </div>
          `;
          document.body.appendChild(mensagem);
          setTimeout(() => mensagem.remove(), 5000);
          loadItens();
        } else {
          throw new Error(data.error || 'Erro ao excluir item DRE');
        }
      } catch (error) {
        console.error('Erro ao excluir item DRE:', error);
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
      tipo_estrutura_id: null,
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

  const opcoesTipos = tiposEstrutura.length > 0
    ? [
        ...tiposEstrutura,
        ...tiposDRE
          .filter((tipo) => !tiposEstrutura.some((t) => (t.codigo || '').toUpperCase() === tipo.value))
          .map((tipo) => ({ id: tipo.value, codigo: tipo.value, nome: tipo.label })),
      ]
    : tiposDRE.map((tipo) => ({ id: tipo.value, codigo: tipo.value, nome: tipo.label }));

  return (
    <DashboardLayout screenCode="DRE-002" title="Estrutura DRE">
      <div className="space-y-6">
        {!showForm ? (
          <>
            <Card>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Estruture o DRE por modelo</h3>
                <p className="text-sm text-gray-600">
                  Cadastre a árvore de referência (Receita, Despesa e demais linhas) selecionando um modelo para visualizar e editar sua hierarquia.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                title="Modelos cadastrados"
                subtitle="Escolha o modelo para carregar a estrutura"
                actions={(
                  <Button variant="outline" onClick={() => window.location.href = '/modules/modelos-plano/planos-padroes'}>
                    Gerenciar modelos
                  </Button>
                )}
              >
                <div className="space-y-3">
                  {modelos.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum modelo encontrado. Cadastre em "Tipos de DRE".</p>
                  )}
                  {modelos.map((modelo) => {
                    const ativo = Number(modeloSelecionado) === Number(modelo.id);
                    return (
                      <button
                        key={modelo.id}
                        onClick={() => setModeloSelecionado(Number(modelo.id))}
                        className={`w-full text-left rounded-lg border px-4 py-3 transition ${ativo ? 'border-primary-200 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{modelo.nome_modelo}</p>
                            <p className="text-xs text-gray-500">{modelo.descricao || 'Sem descrição'}</p>
                          </div>
                          {ativo && <span className="text-xs px-2 py-1 rounded-full bg-white text-primary-700 border border-primary-200">Selecionado</span>}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-1 rounded-full bg-gray-100">{modelo.tipo_modelo}</span>
                          {modelo.padrao && <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">Padrão</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card
                title="Árvore do modelo selecionado"
                subtitle="Visualize e ajuste a hierarquia"
                actions={(
                  <Button variant="primary" onClick={() => setShowForm(true)}>
                    + Novo Item
                  </Button>
                )}
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="space-y-2">
                    {itens.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 group"
                      >
                        {/* Preview */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.codigo && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono border border-gray-200">
                                {item.codigo}
                              </span>
                            )}
                            <span style={getPreviewStyle(item)} className="text-sm">
                              {item.descricao || 'Sem descrição'}
                            </span>
                          </div>
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
                      <div className="text-center py-10 text-gray-500 text-sm">
                        Nenhum item cadastrado para este modelo.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-orange-50 border border-orange-200 text-orange-900 rounded-lg p-4 text-sm">
                    <p className="font-semibold">Monte sua árvore de referência</p>
                    <p className="mt-1 text-orange-800">Organize Receitas e Despesas em níveis hierárquicos. Utilize a ordem de exibição para manter o fluxo correto.</p>
                  </div>
                </div>
              </Card>
            </div>
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
                        value={formData.tipo_estrutura_id ? String(formData.tipo_estrutura_id) : formData.tipo}
                        onChange={(e) => handleTipoChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {opcoesTipos.map(tipo => (
                          <option key={tipo.id || tipo.codigo} value={tipo.id ? String(tipo.id) : tipo.codigo}>
                            {tipo.nome || tipo.label || tipo.codigo}
                          </option>
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
