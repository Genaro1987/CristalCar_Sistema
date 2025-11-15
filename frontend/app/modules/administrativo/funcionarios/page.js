'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    codigo_unico: '',
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    telefone: '',
    celular: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    cargo: '',
    departamento: '',
    data_admissao: '',
    data_demissao: '',
    salario: '',
    horario_entrada: '',
    horario_saida: '',
    horario_almoco_inicio: '',
    horario_almoco_fim: '',
    dias_trabalho: [],
    status: 'ATIVO',
    observacoes: ''
  });

  const diasSemana = [
    { value: 'SEG', label: 'Segunda' },
    { value: 'TER', label: 'Terça' },
    { value: 'QUA', label: 'Quarta' },
    { value: 'QUI', label: 'Quinta' },
    { value: 'SEX', label: 'Sexta' },
    { value: 'SAB', label: 'Sábado' },
    { value: 'DOM', label: 'Domingo' }
  ];

  const departamentos = [
    'Administrativo',
    'Financeiro',
    'Vendas',
    'Compras',
    'Estoque',
    'TI',
    'RH',
    'Diretoria'
  ];

  useEffect(() => {
    loadFuncionarios();
  }, []);

  useEffect(() => {
    filterFuncionarios();
  }, [searchTerm, statusFilter, funcionarios]);

  const loadFuncionarios = async () => {
    try {
      const response = await fetch('/api/administrativo/funcionarios');
      if (response.ok) {
        const data = await response.json();
        // Converte dias_trabalho de string para array
        const funcionariosFormatados = data.map(func => ({
          ...func,
          dias_trabalho: func.dias_trabalho ? func.dias_trabalho.split(',') : []
        }));
        setFuncionarios(funcionariosFormatados);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const filterFuncionarios = () => {
    let filtered = [...funcionarios];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(func =>
        func.nome_completo.toLowerCase().includes(term) ||
        func.cpf.includes(term) ||
        func.codigo_unico.toLowerCase().includes(term) ||
        func.cargo?.toLowerCase().includes(term) ||
        func.departamento?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter(func => func.status === statusFilter);
    }

    setFilteredFuncionarios(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Auto-formatação
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    } else if (name === 'telefone' || name === 'celular') {
      formattedValue = formatPhone(value);
    } else if (name === 'salario') {
      formattedValue = formatCurrency(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleDiasTrabalhoChange = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_trabalho.includes(dia)
        ? prev.dias_trabalho.filter(d => d !== dia)
        : [...prev.dias_trabalho, dia];
      return { ...prev, dias_trabalho: dias };
    });
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.nome_completo || !formData.cpf || !formData.data_admissao) {
      alert('Preencha todos os campos obrigatórios (Nome, CPF e Data de Admissão)');
      return;
    }

    // Gera código único automaticamente se for novo
    const dataToSave = { ...formData };
    if (!editingId && !formData.codigo_unico) {
      const nextNum = funcionarios.length + 1;
      dataToSave.codigo_unico = `FUNC-${String(nextNum).padStart(3, '0')}`;
    }

    try {
      const url = editingId
        ? `/api/administrativo/funcionarios/${editingId}`
        : '/api/administrativo/funcionarios';

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        await loadFuncionarios();
        resetForm();
      } else {
        alert('Erro ao salvar funcionário');
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      alert('Erro ao salvar funcionário');
    }
  };

  const handleEdit = (funcionario) => {
    setFormData({
      ...funcionario,
      dias_trabalho: funcionario.dias_trabalho ? funcionario.dias_trabalho.split(',') : []
    });
    setEditingId(funcionario.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        const response = await fetch(`/api/administrativo/funcionarios/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadFuncionarios();
        } else {
          alert('Erro ao excluir funcionário');
        }
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        alert('Erro ao excluir funcionário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo_unico: '',
      nome_completo: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      telefone: '',
      celular: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      cargo: '',
      departamento: '',
      data_admissao: '',
      data_demissao: '',
      salario: '',
      horario_entrada: '',
      horario_saida: '',
      horario_almoco_inicio: '',
      horario_almoco_fim: '',
      dias_trabalho: [],
      status: 'ATIVO',
      observacoes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      ATIVO: 'bg-green-100 text-green-800',
      INATIVO: 'bg-gray-100 text-gray-800',
      DEMITIDO: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.INATIVO;
  };

  return (
    <DashboardLayout screenCode="ADM-002">
      <div className="space-y-6">
        {!showForm ? (
          <>
            {/* Filtros e Ações */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Busca */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Funcionário
                  </label>
                  <input
                    type="text"
                    placeholder="Nome, CPF, código, cargo ou departamento..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filtro de Status */}
                <div className="w-full md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="ATIVO">Ativos</option>
                    <option value="INATIVO">Inativos</option>
                    <option value="DEMITIDO">Demitidos</option>
                  </select>
                </div>

                {/* Botão Novo */}
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  + Novo Funcionário
                </Button>
              </div>
            </Card>

            {/* Lista de Funcionários */}
            <Card title="Funcionários Cadastrados">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admissão
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
                    {filteredFuncionarios.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          Nenhum funcionário encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredFuncionarios.map((funcionario) => (
                        <tr key={funcionario.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {funcionario.codigo_unico}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {funcionario.nome_completo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {funcionario.cpf}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {funcionario.cargo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {funcionario.departamento}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(funcionario.data_admissao).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(funcionario.status)}`}>
                              {funcionario.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(funcionario)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(funcionario.id)}
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
              title={editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
              subtitle={editingId ? `Código: ${formData.codigo_unico}` : 'Preencha os dados do funcionário'}
            >
              <div className="space-y-6">
                {/* Dados Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF *
                      </label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        maxLength="14"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RG
                      </label>
                      <input
                        type="text"
                        name="rg"
                        value={formData.rg}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contatos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Contatos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        maxLength="15"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Celular
                      </label>
                      <input
                        type="text"
                        name="celular"
                        value={formData.celular}
                        onChange={handleInputChange}
                        maxLength="16"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Endereço
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço Completo
                      </label>
                      <input
                        type="text"
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleInputChange}
                        placeholder="Rua, Número, Complemento, Bairro"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UF
                      </label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Selecione</option>
                        <option value="SP">SP</option>
                        <option value="RJ">RJ</option>
                        <option value="MG">MG</option>
                        <option value="RS">RS</option>
                        {/* Adicionar outros estados */}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP
                      </label>
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleInputChange}
                        maxLength="9"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Profissionais */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Dados Profissionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cargo
                      </label>
                      <input
                        type="text"
                        name="cargo"
                        value={formData.cargo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento
                      </label>
                      <select
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Selecione</option>
                        {departamentos.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salário
                      </label>
                      <input
                        type="text"
                        name="salario"
                        value={formData.salario}
                        onChange={handleInputChange}
                        placeholder="0,00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Admissão *
                      </label>
                      <input
                        type="date"
                        name="data_admissao"
                        value={formData.data_admissao}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Demissão
                      </label>
                      <input
                        type="date"
                        name="data_demissao"
                        value={formData.data_demissao}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ao informar a data de demissão, o status será alterado para DEMITIDO automaticamente
                      </p>
                    </div>
                  </div>
                </div>

                {/* Horário de Trabalho */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Horário de Trabalho
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entrada
                      </label>
                      <input
                        type="time"
                        name="horario_entrada"
                        value={formData.horario_entrada}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saída
                      </label>
                      <input
                        type="time"
                        name="horario_saida"
                        value={formData.horario_saida}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Início Almoço
                      </label>
                      <input
                        type="time"
                        name="horario_almoco_inicio"
                        value={formData.horario_almoco_inicio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fim Almoço
                      </label>
                      <input
                        type="time"
                        name="horario_almoco_fim"
                        value={formData.horario_almoco_fim}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dias de Trabalho
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {diasSemana.map(dia => (
                          <label
                            key={dia.value}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.dias_trabalho.includes(dia.value)}
                              onChange={() => handleDiasTrabalhoChange(dia.value)}
                              className="mr-2"
                            />
                            {dia.label}
                          </label>
                        ))}
                      </div>
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
                    {editingId ? 'Atualizar' : 'Salvar'} Funcionário
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
