'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import HelpButton from '@/app/components/ui/HelpButton';
import { helpContents } from '@/app/utils/helpContent';

export default function CadastroParceirosPage() {
  const [parceiros, setParceiros] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  const [formData, setFormData] = useState({
    id: null,
    tipo: 'CLIENTE',
    tipo_pessoa: 'FISICA',
    nome_fantasia: '',
    razao_social: '',
    cpf_cnpj: '',
    ie_rg: '',
    email: '',
    telefone: '',
    celular: '',
    site: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'RS',
    pais: 'Brasil',
    banco: '',
    agencia: '',
    conta: '',
    pix: '',
    limite_credito: 0,
    observacoes: '',
    ativo: true
  });

  const tiposParceiro = [
    { value: 'CLIENTE', label: 'Cliente', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    { value: 'FORNECEDOR', label: 'Fornecedor', icon: '🏭', color: 'bg-purple-100 text-purple-800' },
    { value: 'AMBOS', label: 'Cliente/Fornecedor', icon: '🔄', color: 'bg-green-100 text-green-800' }
  ];

  const tiposPessoa = [
    { value: 'FISICA', label: 'Pessoa Física', doc: 'CPF' },
    { value: 'JURIDICA', label: 'Pessoa Jurídica', doc: 'CNPJ' }
  ];

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    carregarParceiros();
  }, []);

  const carregarParceiros = async () => {
    try {
      const response = await fetch('/api/parceiros/cadastro');
      if (response.ok) {
        const data = await response.json();
        setParceiros(data);
      }
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modoEdicao
        ? `/api/parceiros/cadastro/${formData.id}`
        : '/api/parceiros/cadastro';

      const response = await fetch(url, {
        method: modoEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        carregarParceiros();
        setMostrarModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar parceiro:', error);
    }
  };

  const handleEditar = (parceiro) => {
    setFormData(parceiro);
    setModoEdicao(true);
    setMostrarModal(true);
  };

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este parceiro?')) return;

    try {
      const response = await fetch(`/api/parceiros/cadastro/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        carregarParceiros();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir parceiro');
      }
    } catch (error) {
      console.error('Erro ao excluir parceiro:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      tipo: 'CLIENTE',
      tipo_pessoa: 'FISICA',
      nome_fantasia: '',
      razao_social: '',
      cpf_cnpj: '',
      ie_rg: '',
      email: '',
      telefone: '',
      celular: '',
      site: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: 'RS',
      pais: 'Brasil',
      banco: '',
      agencia: '',
      conta: '',
      pix: '',
      limite_credito: 0,
      observacoes: '',
      ativo: true
    });
    setModoEdicao(false);
  };

  const handleNovo = () => {
    resetForm();
    setMostrarModal(true);
  };

  const buscarCEP = async () => {
    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
      alert('Digite um CEP válido com 8 dígitos');
      return;
    }

    try {
      const cepLimpo = formData.cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      setFormData({
        ...formData,
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente.');
    }
  };

  const formatarCPFCNPJ = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (formData.tipo_pessoa === 'FISICA') {
      // CPF: 000.000.000-00
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numeros
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .substring(0, 18);
    }
  };

  // Filtrar parceiros
  const parceirosFiltrados = parceiros.filter(parceiro => {
    const matchPesquisa = termoPesquisa === '' ||
      parceiro.nome_fantasia.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      parceiro.razao_social?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      parceiro.cpf_cnpj?.includes(termoPesquisa);

    const matchTipo = filtroTipo === 'TODOS' || parceiro.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' ||
      (filtroStatus === 'ATIVO' && parceiro.ativo) ||
      (filtroStatus === 'INATIVO' && !parceiro.ativo);

    return matchPesquisa && matchTipo && matchStatus;
  });

  const getTipoIcon = (tipo) => {
    return tiposParceiro.find(t => t.value === tipo)?.icon || '👤';
  };

  const getTipoLabel = (tipo) => {
    return tiposParceiro.find(t => t.value === tipo)?.label || tipo;
  };

  const getTipoColor = (tipo) => {
    return tiposParceiro.find(t => t.value === tipo)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout screenCode="PAR-001">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{parceiros.length}</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {parceiros.filter(p => p.tipo === 'CLIENTE' || p.tipo === 'AMBOS').length}
                </p>
              </div>
              <span className="text-3xl">👤</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fornecedores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {parceiros.filter(p => p.tipo === 'FORNECEDOR' || p.tipo === 'AMBOS').length}
                </p>
              </div>
              <span className="text-3xl">🏭</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {parceiros.filter(p => p.ativo).length}
                </p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Pesquisar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={termoPesquisa}
                  onChange={(e) => setTermoPesquisa(e.target.value)}
                  placeholder="Buscar por nome, razão social ou CPF/CNPJ..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <HelpButton helpContent={helpContents['PAR-001']} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">Todos os Tipos</option>
                {tiposParceiro.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">Todos</option>
                <option value="ATIVO">✅ Ativos</option>
                <option value="INATIVO">⛔ Inativos</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleNovo}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                ➕ Novo Parceiro
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Parceiros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parceirosFiltrados.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              {termoPesquisa || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS'
                ? '🔍 Nenhum parceiro encontrado com os filtros aplicados'
                : '👥 Nenhum parceiro cadastrado. Clique em "Novo Parceiro" para começar.'}
            </div>
          ) : (
            parceirosFiltrados.map((parceiro) => (
              <div
                key={parceiro.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${
                  parceiro.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getTipoIcon(parceiro.tipo)}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(parceiro.tipo)}`}>
                          {getTipoLabel(parceiro.tipo)}
                        </span>
                      </div>
                      <div className="font-bold text-gray-900">{parceiro.nome_fantasia}</div>
                      {parceiro.razao_social && parceiro.razao_social !== parceiro.nome_fantasia && (
                        <div className="text-xs text-gray-500">{parceiro.razao_social}</div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      parceiro.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {parceiro.ativo ? '✅' : '⛔'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    {parceiro.cpf_cnpj && (
                      <div className="font-mono">
                        {parceiro.tipo_pessoa === 'FISICA' ? '📄 CPF' : '📄 CNPJ'}: {parceiro.cpf_cnpj}
                      </div>
                    )}
                    {parceiro.telefone && (
                      <div>📞 {parceiro.telefone}</div>
                    )}
                    {parceiro.email && (
                      <div className="truncate">✉️ {parceiro.email}</div>
                    )}
                    {parceiro.cidade && (
                      <div>📍 {parceiro.cidade}/{parceiro.estado}</div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEditar(parceiro)}
                      className="flex-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(parceiro.id)}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Cadastro/Edição */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modoEdicao ? '✏️ Editar Parceiro' : '➕ Novo Parceiro'}
                  </h2>
                  <button
                    onClick={() => { setMostrarModal(false); resetForm(); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Informações Básicas */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    📋 Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Parceiro *
                      </label>
                      <select
                        required
                        value={formData.tipo}
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        {tiposParceiro.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.icon} {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Pessoa *
                      </label>
                      <select
                        required
                        value={formData.tipo_pessoa}
                        onChange={(e) => setFormData({...formData, tipo_pessoa: e.target.value, cpf_cnpj: ''})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        {tiposPessoa.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Fantasia *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome_fantasia}
                        onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Nome de exibição"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Razão Social
                      </label>
                      <input
                        type="text"
                        value={formData.razao_social}
                        onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Nome jurídico completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.tipo_pessoa === 'FISICA' ? 'CPF' : 'CNPJ'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cpf_cnpj}
                        onChange={(e) => setFormData({...formData, cpf_cnpj: formatarCPFCNPJ(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
                        placeholder={formData.tipo_pessoa === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.tipo_pessoa === 'FISICA' ? 'RG' : 'Inscrição Estadual'}
                      </label>
                      <input
                        type="text"
                        value={formData.ie_rg}
                        onChange={(e) => setFormData({...formData, ie_rg: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    📞 Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site
                      </label>
                      <input
                        type="url"
                        value={formData.site}
                        onChange={(e) => setFormData({...formData, site: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="(51) 3000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Celular
                      </label>
                      <input
                        type="tel"
                        value={formData.celular}
                        onChange={(e) => setFormData({...formData, celular: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="(51) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    📍 Endereço
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.cep}
                          onChange={(e) => setFormData({...formData, cep: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="00000-000"
                        />
                        <button
                          type="button"
                          onClick={buscarCEP}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          🔍
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => setFormData({...formData, numero: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={formData.complemento}
                        onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={formData.bairro}
                        onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({...formData, estado: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        {estados.map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        value={formData.pais}
                        onChange={(e) => setFormData({...formData, pais: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Bancários */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    🏦 Dados Bancários
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Banco
                      </label>
                      <input
                        type="text"
                        value={formData.banco}
                        onChange={(e) => setFormData({...formData, banco: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: 041 - Banrisul"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agência
                      </label>
                      <input
                        type="text"
                        value={formData.agencia}
                        onChange={(e) => setFormData({...formData, agencia: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conta
                      </label>
                      <input
                        type="text"
                        value={formData.conta}
                        onChange={(e) => setFormData({...formData, conta: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIX
                      </label>
                      <input
                        type="text"
                        value={formData.pix}
                        onChange={(e) => setFormData({...formData, pix: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="CPF/CNPJ, Email ou Telefone"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Comerciais */}
                {formData.tipo !== 'FORNECEDOR' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      💼 Informações Comerciais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Limite de Crédito (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.limite_credito}
                          onChange={(e) => setFormData({...formData, limite_credito: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Informações adicionais..."
                  />
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Parceiro ativo</span>
                  </label>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setMostrarModal(false); resetForm(); }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {modoEdicao ? '💾 Salvar Alterações' : '➕ Cadastrar Parceiro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Ajuda */}
        {mostrarAjuda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">❓ Ajuda - Cadastro de Parceiros</h2>
                  <button
                    onClick={() => setMostrarAjuda(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 O que são Parceiros?</h3>
                  <p className="text-gray-700">
                    Parceiros são pessoas ou empresas com as quais você mantém relações comerciais.
                    Podem ser clientes (que compram de você), fornecedores (de quem você compra)
                    ou ambos (relacionamento bilateral).
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Tipos de Parceiros</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-900">👤 Cliente</div>
                      <p className="text-sm text-gray-700">
                        Pessoas ou empresas que compram seus produtos ou serviços
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-medium text-purple-900">🏭 Fornecedor</div>
                      <p className="text-sm text-gray-700">
                        Pessoas ou empresas que fornecem produtos ou serviços para você
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-green-900">🔄 Cliente/Fornecedor</div>
                      <p className="text-sm text-gray-700">
                        Parceiros que atuam nas duas categorias (compra e venda)
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Campos Importantes</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Nome Fantasia:</strong> Nome pelo qual o parceiro é conhecido
                    </div>
                    <div>
                      <strong>Razão Social:</strong> Nome jurídico completo da empresa
                    </div>
                    <div>
                      <strong>CPF/CNPJ:</strong> Documento de identificação fiscal (obrigatório)
                    </div>
                    <div>
                      <strong>Limite de Crédito:</strong> Valor máximo que o cliente pode ter em aberto
                    </div>
                    <div>
                      <strong>PIX:</strong> Chave PIX para pagamentos (CPF/CNPJ, email ou telefone)
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Busca de CEP</h3>
                  <p className="text-gray-700">
                    Digite o CEP e clique no botão 🔍 para buscar automaticamente o endereço.
                    O sistema preencherá automaticamente: Logradouro, Bairro, Cidade e Estado.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Estatísticas</h3>
                  <p className="text-gray-700">
                    Na parte superior da tela você encontra:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>Total de parceiros cadastrados</li>
                    <li>Quantidade de clientes</li>
                    <li>Quantidade de fornecedores</li>
                    <li>Quantidade de parceiros ativos</li>
                  </ul>
                </section>

                <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">⚠️ Dicas Importantes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Preencha todos os dados possíveis para facilitar o relacionamento comercial</li>
                    <li>Mantenha os dados de contato sempre atualizados</li>
                    <li>Configure o limite de crédito para clientes quando necessário</li>
                    <li>Use o campo de observações para informações relevantes</li>
                    <li>Desative parceiros inativos ao invés de excluí-los</li>
                    <li>CPF/CNPJ é formatado automaticamente conforme o tipo de pessoa</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
