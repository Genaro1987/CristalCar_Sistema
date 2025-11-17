'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function CadastroEmpresaPage() {
  const [formData, setFormData] = useState({
    id: null,
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    telefone: '',
    celular: '',
    email: '',
    website: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    regime_tributario: 'SIMPLES_NACIONAL',
    data_abertura: '',
    logo_path: '',
    observacoes: '',
    padrao: false
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  useEffect(() => {
    carregarDadosEmpresa();
    carregarListaEmpresas();
  }, []);

  const carregarListaEmpresas = async () => {
    try {
      const response = await fetch('/api/administrativo/empresa?all=true');
      if (response.ok) {
        const lista = await response.json();
        setEmpresas(lista);

        if (!empresaSelecionada && lista.length > 0) {
          const padrao = lista.find(emp => emp.padrao);
          const idSelecionado = padrao?.id || lista[0].id;
          setEmpresaSelecionada(idSelecionado);
          await carregarDadosEmpresa(idSelecionado, false);
        }
      }
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
    }
  };

  const carregarDadosEmpresa = async (id = null, atualizarSelecao = true) => {
    try {
      const url = id ? `/api/administrativo/empresa?id=${id}` : '/api/administrativo/empresa';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData({
            id: data.id,
            razao_social: data.razao_social || '',
            nome_fantasia: data.nome_fantasia || '',
            cnpj: data.cnpj || data.cpf_cnpj || '',
            inscricao_estadual: data.inscricao_estadual || '',
            inscricao_municipal: data.inscricao_municipal || '',
            telefone: data.telefone || '',
            celular: data.celular || '',
            email: data.email || '',
            website: data.website || data.site || '',
            endereco: data.endereco || '',
            numero: data.numero || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            cep: data.cep || '',
            regime_tributario: data.regime_tributario || 'SIMPLES_NACIONAL',
            data_abertura: data.data_abertura || '',
            logo_path: data.logo_path || '',
            observacoes: data.observacoes || '',
            padrao: data.padrao || false
          });
          if (data.logo_path) {
            setLogoPreview(data.logo_path);
          }
          if (atualizarSelecao && data.id) {
            setEmpresaSelecionada(data.id);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados da empresa' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelecionarEmpresa = async (id) => {
    setEmpresaSelecionada(id);
    await carregarDadosEmpresa(id);
  };

  const iniciarNovaEmpresa = () => {
    setEmpresaSelecionada(null);
    setFormData({
      id: null,
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      inscricao_estadual: '',
      inscricao_municipal: '',
      telefone: '',
      celular: '',
      email: '',
      website: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      regime_tributario: 'SIMPLES_NACIONAL',
      data_abertura: '',
      logo_path: '',
      observacoes: '',
      padrao: empresas.length === 0
    });
    setLogoPreview(null);
    setMessage(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logo_path: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/administrativo/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Dados da empresa salvos com sucesso!'
        });

        // Recarregar dados
        if (result?.id) {
          setEmpresaSelecionada(result.id);
        }
        await carregarListaEmpresas();
        await carregarDadosEmpresa(result?.id || formData.id);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Erro ao salvar dados da empresa'
        });
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao salvar dados da empresa'
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substr(0, 18);
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .substr(0, 15);
  };

  const formatCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substr(0, 9);
  };

  return (
    <DashboardLayout screenCode="ADM-001">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensagem de Sucesso/Erro */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Logo da Empresa */}
        <Card title="Logo da Empresa" subtitle="Imagem que será exibida em documentos e no sistema">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs mt-2">Logo</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block">
                <span className="sr-only">Escolher logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    cursor-pointer"
                />
              </label>
              <p className="mt-2 text-sm text-gray-500">
                Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB
              </p>
            </div>
          </div>
        </Card>

        {/* Dados Principais */}
        <Card title="Dados Principais" subtitle="Informações básicas da empresa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razão Social *
              </label>
              <input
                type="text"
                name="razao_social"
                value={formData.razao_social}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Fantasia *
              </label>
              <input
                type="text"
                name="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ *
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange({ target: { name: 'cnpj', value: formatCNPJ(e.target.value) }})}
                required
                placeholder="00.000.000/0001-00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inscrição Estadual
              </label>
              <input
                type="text"
                name="inscricao_estadual"
                value={formData.inscricao_estadual}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inscrição Municipal
              </label>
              <input
                type="text"
                name="inscricao_municipal"
                value={formData.inscricao_municipal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regime Tributário
              </label>
              <select
                name="regime_tributario"
                value={formData.regime_tributario}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                <option value="LUCRO_REAL">Lucro Real</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Abertura
              </label>
              <input
                type="date"
                name="data_abertura"
                value={formData.data_abertura}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="padrao"
                  checked={formData.padrao}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Definir esta empresa como padrão</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">A empresa padrão será carregada automaticamente nas telas.</p>
            </div>
          </div>
        </Card>

        {/* Contatos */}
        <Card title="Contatos" subtitle="Informações de contato da empresa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange({ target: { name: 'telefone', value: formatPhone(e.target.value) }})}
                placeholder="(00) 0000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                onChange={(e) => handleInputChange({ target: { name: 'celular', value: formatPhone(e.target.value) }})}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="www.exemplo.com.br"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card title="Endereço" subtitle="Localização da empresa">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEP
              </label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={(e) => handleInputChange({ target: { name: 'cep', value: formatCEP(e.target.value) }})}
                placeholder="00000-000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complemento
              </label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bairro
              </label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Observações */}
        <Card title="Observações" subtitle="Informações adicionais">
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Digite observações ou anotações sobre a empresa..."
          />
        </Card>

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
