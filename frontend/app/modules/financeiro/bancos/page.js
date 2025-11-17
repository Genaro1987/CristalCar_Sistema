'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function BancosPage() {
  const [bancos, setBancos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [mostrarConfigOFX, setMostrarConfigOFX] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [bancoSelecionado, setBancoSelecionado] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    codigo: '',
    nome: '',
    nome_completo: '',
    site: '',
    telefone: '',
    agencia: '',
    conta: '',
    tipo_conta: 'CORRENTE',
    permite_ofx: false,
    config_ofx: null,
    observacoes: '',
    ativo: true
  });

  const [configOFX, setConfigOFX] = useState({
    campo_data: 'DTPOSTED',
    campo_valor: 'TRNAMT',
    campo_documento: 'CHECKNUM',
    campo_descricao: 'MEMO',
    campo_tipo: 'TRNTYPE',
    campo_id_transacao: 'FITID',
    usar_dtuser: false,
    separador_decimal: ',',
    formato_data: 'YYYYMMDD',
    ignorar_duplicatas: true,
    dias_retroativos: 90
  });

  const tiposConta = [
    { value: 'CORRENTE', label: 'Conta Corrente', icon: '🏦' },
    { value: 'POUPANCA', label: 'Conta Poupança', icon: '💰' },
    { value: 'INVESTIMENTO', label: 'Conta Investimento', icon: '📈' },
    { value: 'APLICACAO', label: 'Aplicação', icon: '💹' }
  ];

  // Campos disponíveis no padrão OFX
  const camposOFX = [
    { value: 'DTPOSTED', label: 'DTPOSTED - Data da Postagem', desc: 'Data em que a transação foi processada' },
    { value: 'DTUSER', label: 'DTUSER - Data do Usuário', desc: 'Data informada pelo usuário' },
    { value: 'DTAVAIL', label: 'DTAVAIL - Data Disponível', desc: 'Data em que o valor ficou disponível' },
    { value: 'TRNAMT', label: 'TRNAMT - Valor da Transação', desc: 'Valor da movimentação (+ ou -)' },
    { value: 'FITID', label: 'FITID - ID da Transação', desc: 'Identificador único da transação' },
    { value: 'CHECKNUM', label: 'CHECKNUM - Número do Documento', desc: 'Número do cheque ou documento' },
    { value: 'REFNUM', label: 'REFNUM - Número de Referência', desc: 'Número de referência bancário' },
    { value: 'MEMO', label: 'MEMO - Descrição/Histórico', desc: 'Descrição da transação' },
    { value: 'TRNTYPE', label: 'TRNTYPE - Tipo de Transação', desc: 'DEBIT, CREDIT, etc.' },
    { value: 'NAME', label: 'NAME - Nome', desc: 'Nome relacionado à transação' },
    { value: 'PAYEE', label: 'PAYEE - Beneficiário', desc: 'Nome do beneficiário' }
  ];

  // Templates pré-configurados
  const templatesOFX = {
    banrisul: {
      nome: 'Banrisul (Padrão)',
      config: {
        campo_data: 'DTPOSTED',
        campo_valor: 'TRNAMT',
        campo_documento: 'CHECKNUM',
        campo_descricao: 'MEMO',
        campo_tipo: 'TRNTYPE',
        campo_id_transacao: 'FITID',
        usar_dtuser: false,
        separador_decimal: ',',
        formato_data: 'YYYYMMDD',
        ignorar_duplicatas: true,
        dias_retroativos: 90
      }
    },
    bradesco: {
      nome: 'Bradesco',
      config: {
        campo_data: 'DTPOSTED',
        campo_valor: 'TRNAMT',
        campo_documento: 'REFNUM',
        campo_descricao: 'MEMO',
        campo_tipo: 'TRNTYPE',
        campo_id_transacao: 'FITID',
        usar_dtuser: false,
        separador_decimal: '.',
        formato_data: 'YYYYMMDD',
        ignorar_duplicatas: true,
        dias_retroativos: 60
      }
    },
    itau: {
      nome: 'Itaú',
      config: {
        campo_data: 'DTUSER',
        campo_valor: 'TRNAMT',
        campo_documento: 'CHECKNUM',
        campo_descricao: 'MEMO',
        campo_tipo: 'TRNTYPE',
        campo_id_transacao: 'FITID',
        usar_dtuser: true,
        separador_decimal: '.',
        formato_data: 'YYYYMMDD',
        ignorar_duplicatas: true,
        dias_retroativos: 90
      }
    },
    generico: {
      nome: 'Genérico (Padrão OFX)',
      config: {
        campo_data: 'DTPOSTED',
        campo_valor: 'TRNAMT',
        campo_documento: 'CHECKNUM',
        campo_descricao: 'MEMO',
        campo_tipo: 'TRNTYPE',
        campo_id_transacao: 'FITID',
        usar_dtuser: false,
        separador_decimal: '.',
        formato_data: 'YYYYMMDD',
        ignorar_duplicatas: true,
        dias_retroativos: 90
      }
    }
  };

  useEffect(() => {
    carregarBancos();
  }, []);

  const carregarBancos = async () => {
    try {
      const response = await fetch('/api/financeiro/bancos');
      if (response.ok) {
        const data = await response.json();
        const normalizados = (data || []).map((item) => ({
          id: item.id,
          codigo: item.codigo || item.codigo_banco || '',
          nome: item.nome || item.nome_banco || '',
          nome_completo: item.nome_completo || item.nome_banco || '',
          site: item.site || '',
          telefone: item.telefone || '',
          agencia: item.agencia || '',
          conta: item.conta || '',
          tipo_conta: item.tipo_conta || 'CORRENTE',
          permite_ofx: item.permite_ofx === 1 || item.permite_ofx === true,
          config_ofx: item.config_ofx || null,
          observacoes: item.observacoes || '',
          ativo: item.ativo === 1 || item.ativo === true || item.status === 'ATIVO'
        }));
        setBancos(normalizados);
      }
    } catch (error) {
      console.error('Erro ao carregar bancos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agencia || !formData.conta) {
      alert('Informe agência e conta antes de salvar.');
      return;
    }

    try {
      const dadosParaSalvar = {
        ...formData,
        codigo_banco: formData.codigo || formData.codigo_banco,
        nome_banco: formData.nome || formData.nome_banco,
        status: formData.ativo ? 'ATIVO' : 'INATIVO',
        config_ofx: formData.permite_ofx ? JSON.stringify(configOFX) : null
      };

      const url = modoEdicao
        ? `/api/financeiro/bancos/${formData.id}`
        : '/api/financeiro/bancos';

      const response = await fetch(url, {
        method: modoEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaSalvar)
      });

      if (response.ok) {
        carregarBancos();
        setMostrarModal(false);
        resetForm();
      } else {
        const erro = await response.json();
        alert(erro.error || 'Não foi possível salvar o banco.');
      }
    } catch (error) {
      console.error('Erro ao salvar banco:', error);
      alert('Falha ao salvar banco. Confira os dados e tente novamente.');
    }
  };

  const handleEditar = (banco) => {
    setFormData({
      ...banco,
      codigo: banco.codigo,
      nome: banco.nome,
      ativo: banco.ativo,
    });
    if (banco.config_ofx) {
      try {
        setConfigOFX(JSON.parse(banco.config_ofx));
      } catch (e) {
        console.error('Erro ao parsear config OFX:', e);
      }
    }
    setModoEdicao(true);
    setMostrarModal(true);
  };

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este banco?')) return;

    try {
      const response = await fetch(`/api/financeiro/bancos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        carregarBancos();
      }
    } catch (error) {
      console.error('Erro ao excluir banco:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      codigo: '',
      nome: '',
      nome_completo: '',
      site: '',
      telefone: '',
      agencia: '',
      conta: '',
      tipo_conta: 'CORRENTE',
      permite_ofx: false,
      config_ofx: null,
      observacoes: '',
      ativo: true
    });
    setConfigOFX({
      campo_data: 'DTPOSTED',
      campo_valor: 'TRNAMT',
      campo_documento: 'CHECKNUM',
      campo_descricao: 'MEMO',
      campo_tipo: 'TRNTYPE',
      campo_id_transacao: 'FITID',
      usar_dtuser: false,
      separador_decimal: ',',
      formato_data: 'YYYYMMDD',
      ignorar_duplicatas: true,
      dias_retroativos: 90
    });
    setModoEdicao(false);
  };

  const handleNovo = () => {
    resetForm();
    setMostrarModal(true);
  };

  const aplicarTemplate = (templateKey) => {
    const template = templatesOFX[templateKey];
    if (template) {
      setConfigOFX(template.config);
      alert(`Template "${template.nome}" aplicado com sucesso!`);
    }
  };

  const abrirConfigOFX = (banco) => {
    setBancoSelecionado(banco);
    if (banco.config_ofx) {
      try {
        setConfigOFX(JSON.parse(banco.config_ofx));
      } catch (e) {
        console.error('Erro ao parsear config OFX:', e);
      }
    }
    setMostrarConfigOFX(true);
  };

  const salvarConfigOFX = async () => {
    try {
      const response = await fetch(`/api/financeiro/bancos/${bancoSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bancoSelecionado,
          config_ofx: JSON.stringify(configOFX)
        })
      });

      if (response.ok) {
        carregarBancos();
        setMostrarConfigOFX(false);
        alert('Configuração OFX salva com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar config OFX:', error);
    }
  };

  // Filtrar bancos
  const bancosFiltrados = bancos.filter(banco => {
    const matchPesquisa = termoPesquisa === '' ||
      banco.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      banco.codigo?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      banco.nome_completo?.toLowerCase().includes(termoPesquisa.toLowerCase());

    const matchStatus = filtroStatus === 'TODOS' ||
      (filtroStatus === 'ATIVO' && banco.ativo) ||
      (filtroStatus === 'INATIVO' && !banco.ativo);

    return matchPesquisa && matchStatus;
  });

  const getTipoContaIcon = (tipo) => {
    return tiposConta.find(t => t.value === tipo)?.icon || '🏦';
  };

  const getTipoContaLabel = (tipo) => {
    return tiposConta.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <DashboardLayout screenCode="FIN-012">
      <div className="space-y-6">
        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Pesquisar
              </label>
              <input
                type="text"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                placeholder="Buscar por código, nome ou nome completo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
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
                ➕ Novo Banco
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Bancos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bancosFiltrados.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              {termoPesquisa || filtroStatus !== 'TODOS'
                ? '🔍 Nenhum banco encontrado com os filtros aplicados'
                : '🏦 Nenhum banco cadastrado. Clique em "Novo Banco" para começar.'}
            </div>
          ) : (
            bancosFiltrados.map((banco) => (
              <div
                key={banco.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${
                  banco.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTipoContaIcon(banco.tipo_conta)}</span>
                      <div>
                        <div className="font-bold text-gray-900">{banco.nome}</div>
                        {banco.codigo && (
                          <div className="text-xs text-gray-500">Código: {banco.codigo}</div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      banco.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {banco.ativo ? '✅' : '⛔'}
                    </span>
                  </div>

                  {banco.nome_completo && (
                    <div className="text-sm text-gray-600 mb-2">{banco.nome_completo}</div>
                  )}

                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    {banco.agencia && (
                      <div>📍 Agência: {banco.agencia}</div>
                    )}
                    {banco.conta && (
                      <div>💳 Conta: {banco.conta}</div>
                    )}
                    <div>🏦 {getTipoContaLabel(banco.tipo_conta)}</div>
                  </div>

                  {banco.permite_ofx && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-900 font-medium">📂 Importação OFX Ativa</span>
                        <button
                          onClick={() => abrirConfigOFX(banco)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ⚙️
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEditar(banco)}
                      className="flex-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(banco.id)}
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
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modoEdicao ? '✏️ Editar Banco' : '➕ Novo Banco'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Código */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Banco
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 041 (Banrisul), 237 (Bradesco)..."
                    />
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Banco *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: Banrisul, Bradesco..."
                    />
                  </div>

                  {/* Nome Completo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: Banco do Estado do Rio Grande do Sul S.A."
                    />
                  </div>

                  {/* Site */}
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

                  {/* Telefone */}
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

                  {/* Agência */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agência
                    </label>
                    <input
                      type="text"
                      value={formData.agencia}
                      onChange={(e) => setFormData({...formData, agencia: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="0000"
                    />
                  </div>

                  {/* Conta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conta
                    </label>
                    <input
                      type="text"
                      value={formData.conta}
                      onChange={(e) => setFormData({...formData, conta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="00000-0"
                    />
                  </div>

                  {/* Tipo de Conta */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Conta *
                    </label>
                    <select
                      required
                      value={formData.tipo_conta}
                      onChange={(e) => setFormData({...formData, tipo_conta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {tiposConta.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.icon} {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Permite OFX */}
                  <div className="md:col-span-2">
                    <label className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <input
                        type="checkbox"
                        checked={formData.permite_ofx}
                        onChange={(e) => setFormData({...formData, permite_ofx: e.target.checked})}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        📂 Permitir importação de extratos OFX
                      </span>
                    </label>
                  </div>

                  {/* Configuração OFX */}
                  {formData.permite_ofx && (
                    <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-blue-900">⚙️ Configuração OFX</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => aplicarTemplate('banrisul')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Banrisul
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarTemplate('bradesco')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Bradesco
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarTemplate('itau')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Itaú
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarTemplate('generico')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Genérico
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campo Data
                          </label>
                          <select
                            value={configOFX.campo_data}
                            onChange={(e) => setConfigOFX({...configOFX, campo_data: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {camposOFX.filter(c => c.value.includes('DT')).map(campo => (
                              <option key={campo.value} value={campo.value}>{campo.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campo Valor
                          </label>
                          <select
                            value={configOFX.campo_valor}
                            onChange={(e) => setConfigOFX({...configOFX, campo_valor: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {camposOFX.filter(c => c.value === 'TRNAMT').map(campo => (
                              <option key={campo.value} value={campo.value}>{campo.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campo Documento
                          </label>
                          <select
                            value={configOFX.campo_documento}
                            onChange={(e) => setConfigOFX({...configOFX, campo_documento: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {camposOFX.filter(c => ['CHECKNUM', 'REFNUM', 'FITID'].includes(c.value)).map(campo => (
                              <option key={campo.value} value={campo.value}>{campo.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campo Descrição
                          </label>
                          <select
                            value={configOFX.campo_descricao}
                            onChange={(e) => setConfigOFX({...configOFX, campo_descricao: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {camposOFX.filter(c => ['MEMO', 'NAME', 'PAYEE'].includes(c.value)).map(campo => (
                              <option key={campo.value} value={campo.value}>{campo.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Separador Decimal
                          </label>
                          <select
                            value={configOFX.separador_decimal}
                            onChange={(e) => setConfigOFX({...configOFX, separador_decimal: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value=",">Vírgula (,)</option>
                            <option value=".">Ponto (.)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dias Retroativos
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={configOFX.dias_retroativos}
                            onChange={(e) => setConfigOFX({...configOFX, dias_retroativos: parseInt(e.target.value) || 90})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={configOFX.ignorar_duplicatas}
                              onChange={(e) => setConfigOFX({...configOFX, ignorar_duplicatas: e.target.checked})}
                              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Ignorar transações duplicadas (mesmo ID)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  <div className="md:col-span-2">
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
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Banco ativo</span>
                    </label>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
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
                    {modoEdicao ? '💾 Salvar Alterações' : '➕ Cadastrar Banco'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Configuração OFX */}
        {mostrarConfigOFX && bancoSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    ⚙️ Configuração OFX - {bancoSelecionado.nome}
                  </h2>
                  <button
                    onClick={() => setMostrarConfigOFX(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-900">
                    <strong>ℹ️ Informação:</strong> Configure como os campos do arquivo OFX serão interpretados.
                    Use os botões abaixo para aplicar templates pré-configurados.
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => aplicarTemplate('banrisul')}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📋 Banrisul
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarTemplate('bradesco')}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📋 Bradesco
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarTemplate('itau')}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📋 Itaú
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarTemplate('generico')}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📋 Genérico
                  </button>
                </div>

                <div className="space-y-4">
                  {camposOFX.map(campo => (
                    <div key={campo.value} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm text-gray-900">{campo.label}</div>
                      <div className="text-xs text-gray-600">{campo.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setMostrarConfigOFX(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarConfigOFX}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    💾 Salvar Configuração
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ajuda */}
        {mostrarAjuda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">❓ Ajuda - Cadastro de Bancos</h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🏦 O que é o Cadastro de Bancos?</h3>
                  <p className="text-gray-700">
                    Este módulo permite cadastrar as contas bancárias da sua empresa e configurar a
                    importação automática de extratos no formato OFX (Open Financial Exchange).
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📂 O que é OFX?</h3>
                  <p className="text-gray-700 mb-2">
                    OFX (Open Financial Exchange) é um formato padrão para troca de dados financeiros.
                    A maioria dos bancos permite exportar extratos neste formato.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900 mb-1">Principais Campos OFX:</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li><strong>DTPOSTED:</strong> Data em que a transação foi processada pelo banco</li>
                      <li><strong>TRNAMT:</strong> Valor da transação (positivo = crédito, negativo = débito)</li>
                      <li><strong>FITID:</strong> Identificador único da transação</li>
                      <li><strong>CHECKNUM:</strong> Número do documento (cheque, boleto, etc.)</li>
                      <li><strong>MEMO:</strong> Descrição/histórico da transação</li>
                      <li><strong>TRNTYPE:</strong> Tipo (DEBIT, CREDIT, INT, FEE, etc.)</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Configuração OFX para Banrisul</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      Para configurar a importação de extratos do Banrisul:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Marque a opção "Permitir importação de extratos OFX"</li>
                      <li>Clique no botão "Banrisul" para aplicar o template pré-configurado</li>
                      <li>Ajuste se necessário:
                        <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                          <li>Separador decimal: Vírgula (,)</li>
                          <li>Dias retroativos: 90 dias</li>
                          <li>Ignorar duplicatas: Ativado</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Templates Disponíveis</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">🏦 Banrisul</div>
                      <p className="text-sm text-gray-600">
                        Configuração otimizada para Banco do Estado do Rio Grande do Sul
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">🏦 Bradesco</div>
                      <p className="text-sm text-gray-600">
                        Configuração para Banco Bradesco
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">🏦 Itaú</div>
                      <p className="text-sm text-gray-600">
                        Configuração para Banco Itaú (usa DTUSER ao invés de DTPOSTED)
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">🏦 Genérico</div>
                      <p className="text-sm text-gray-600">
                        Configuração padrão OFX para outros bancos
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Pesquisa</h3>
                  <p className="text-gray-700">
                    Use o campo de pesquisa para encontrar bancos por código, nome ou nome completo.
                    O filtro de status permite visualizar apenas bancos ativos ou inativos.
                  </p>
                </section>

                <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">⚠️ Dicas Importantes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Configure o código do banco conforme o padrão BACEN (ex: 041 = Banrisul)</li>
                    <li>Mantenha os dados de agência e conta atualizados</li>
                    <li>Teste a importação OFX com um extrato pequeno primeiro</li>
                    <li>O sistema ignora automaticamente transações duplicadas</li>
                    <li>Desative bancos que não estão mais em uso ao invés de excluí-los</li>
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
