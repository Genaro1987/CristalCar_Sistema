'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { useToast } from '@/app/components/ui/ToastProvider';

export default function RegistroLogPage() {
  const [configs, setConfigs] = useState([]);
  const [filteredConfigs, setFilteredConfigs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduloFilter, setModuloFilter] = useState('TODOS');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const { addToast } = useToast();

  // Definição de todas as telas do sistema
  const telasDisponiveis = [
    { modulo: 'ADMINISTRATIVO', tela: 'CADASTRO_EMPRESA', nome: 'Cadastro da Empresa', codigo: 'ADM-001' },
    { modulo: 'ADMINISTRATIVO', tela: 'FUNCIONARIOS', nome: 'Funcionários', codigo: 'ADM-002' },
    { modulo: 'ADMINISTRATIVO', tela: 'LAYOUTS_IMPORTACAO', nome: 'Layouts de Importação', codigo: 'ADM-003' },
    { modulo: 'ADMINISTRATIVO', tela: 'CONFIGURACAO_BACKUP', nome: 'Configuração de Backup', codigo: 'ADM-004' },
    { modulo: 'ADMINISTRATIVO', tela: 'REGISTRO_LOG', nome: 'Registro de Log', codigo: 'ADM-005' },
    { modulo: 'MODELOS_PLANO', tela: 'PLANO_CONTAS', nome: 'Plano de Contas', codigo: 'FIN-001' },
    { modulo: 'MODELOS_PLANO', tela: 'ESTRUTURA_DRE', nome: 'Estrutura DRE', codigo: 'FIN-002' },
    { modulo: 'FINANCEIRO', tela: 'FORMAS_PAGAMENTO', nome: 'Formas de Pagamento', codigo: 'FIN-010' },
    { modulo: 'FINANCEIRO', tela: 'CONDICOES_PAGAMENTO', nome: 'Condições de Pagamento', codigo: 'FIN-011' },
    { modulo: 'FINANCEIRO', tela: 'CADASTRO_BANCOS', nome: 'Cadastro de Bancos', codigo: 'FIN-012' },
    { modulo: 'FINANCEIRO', tela: 'REGRAS_CONCILIACAO', nome: 'Regras de Conciliação', codigo: 'FIN-013' },
    { modulo: 'PARCEIROS', tela: 'CADASTRO_PARCEIROS', nome: 'Cadastro de Parceiros', codigo: 'PAR-001' },
    { modulo: 'TABELAS_PRECOS', tela: 'TABELAS_PRECOS', nome: 'Tabelas de Preços', codigo: 'TAB-001' },
    { modulo: 'TABELAS_PRECOS', tela: 'HISTORICO_ALTERACOES', nome: 'Histórico de Alterações', codigo: 'TAB-002' }
  ];

  const modulos = ['ADMINISTRATIVO', 'MODELOS_PLANO', 'FINANCEIRO', 'PARCEIROS', 'TABELAS_PRECOS'];

  useEffect(() => {
    loadConfigs();
    loadLogs();
  }, []);

  useEffect(() => {
    filterConfigs();
  }, [searchTerm, moduloFilter, configs]);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/administrativo/logs?logs=1');
      if (!response.ok) throw new Error('Falha ao buscar telas');

      const { configs: configuracoes = [], logs: registros = [] } = await response.json();
      const normalizados = configuracoes.map((cfg) => ({
        ...cfg,
        nome: cfg.tela,
      }));
      setConfigs(normalizados);
      setLogs(registros);
    } catch (error) {
      console.error('Erro ao carregar telas para log:', error);
      // Fallback para lista estática
      setConfigs(
        telasDisponiveis.map((tela) => ({
          id: tela.codigo,
          modulo: tela.modulo,
          tela: tela.nome,
          codigo: tela.codigo,
          registrar_log: false,
          registrar_visualizacao: true,
          registrar_inclusao: true,
          registrar_edicao: true,
          registrar_exclusao: true,
        }))
      );
    }
  };

  const loadLogs = () => {
    // Banco de dados vazio - nenhum log registrado
    setLogs([]);
  };

  const filterConfigs = () => {
    let filtered = [...configs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(config =>
        config.nome?.toLowerCase().includes(term) ||
        config.codigo.toLowerCase().includes(term) ||
        config.tela.toLowerCase().includes(term)
      );
    }

    if (moduloFilter !== 'TODOS') {
      filtered = filtered.filter(config => config.modulo === moduloFilter);
    }

    setFilteredConfigs(filtered);
  };

  const handleConfigChange = (id, field, value) => {
    setConfigs(prev =>
      prev.map(config =>
        config.id === id ? { ...config, [field]: value } : config
      )
    );
  };

  const handleSaveAll = () => {
    fetch('/api/administrativo/logs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs }),
    })
      .then((resp) => {
        if (!resp.ok) throw new Error('Falha ao salvar configurações');
        addToast({
          type: 'success',
          title: 'Configurações atualizadas',
          message: 'Preferências de auditoria salvas com sucesso.',
        });
      })
      .catch((err) => {
        console.error(err);
        addToast({
          type: 'error',
          title: 'Erro ao salvar',
          message: 'Não foi possível gravar as configurações de log.',
        });
      });
  };

  const handleAtivarTodas = () => {
    setConfigs(prev =>
      prev.map(config => ({
        ...config,
        registrar_log: true,
        registrar_inclusao: true,
        registrar_edicao: true,
        registrar_exclusao: true
      }))
    );
  };

  const handleDesativarTodas = () => {
    setConfigs(prev =>
      prev.map(config => ({
        ...config,
        registrar_log: false,
        registrar_visualizacao: false,
        registrar_inclusao: false,
        registrar_edicao: false,
        registrar_exclusao: false
      }))
    );
  };

  const getAcaoBadge = (acao) => {
    const badges = {
      VISUALIZAR: 'bg-blue-100 text-blue-800',
      INCLUIR: 'bg-green-100 text-green-800',
      EDITAR: 'bg-yellow-100 text-yellow-800',
      EXCLUIR: 'bg-red-100 text-red-800',
      IMPRIMIR: 'bg-purple-100 text-purple-800',
      EXPORTAR: 'bg-indigo-100 text-indigo-800'
    };
    return badges[acao] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString('pt-BR');
  };

  return (
    <DashboardLayout screenCode="ADM-005">
      <div className="space-y-6">
        {/* Informação */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Configuração de Auditoria
              </h4>
              <p className="text-sm text-blue-800">
                Configure quais telas devem registrar as ações dos usuários. Os logs incluem informações sobre quem fez a ação,
                quando foi feita, qual registro foi afetado e os dados antes/depois das alterações.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setShowLogs(false)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                !showLogs
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuração por Tela
            </button>
            <button
              onClick={() => setShowLogs(true)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                showLogs
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consultar Logs
            </button>
          </nav>
        </div>

        {!showLogs ? (
          <>
            {/* Filtros e Ações */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Busca */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Tela
                  </label>
                  <input
                    type="text"
                    placeholder="Nome, código ou identificador da tela..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filtro de Módulo */}
                <div className="w-full md:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Módulo
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={moduloFilter}
                    onChange={(e) => setModuloFilter(e.target.value)}
                  >
                    <option value="TODOS">Todos os Módulos</option>
                    {modulos.map(modulo => (
                      <option key={modulo} value={modulo}>{modulo.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                {/* Ações em Massa */}
                <Button variant="outline" onClick={handleAtivarTodas}>
                  Ativar Todas
                </Button>
                <Button variant="outline" onClick={handleDesativarTodas}>
                  Desativar Todas
                </Button>
                <Button variant="primary" onClick={handleSaveAll}>
                  Salvar Configurações
                </Button>
              </div>
            </Card>

            {/* Lista de Configurações */}
            <Card title="Configurações de Log por Tela">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tela
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Módulo
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ativo
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visualizar
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Incluir
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Editar
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Excluir
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredConfigs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          Nenhuma tela encontrada
                        </td>
                      </tr>
                    ) : (
                      filteredConfigs.map((config) => (
                        <tr key={config.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{config.nome || config.tela}</div>
                            <div className="text-xs text-gray-500">{config.codigo}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config.modulo.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={config.registrar_log}
                              onChange={(e) => handleConfigChange(config.id, 'registrar_log', e.target.checked)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={config.registrar_visualizacao}
                              onChange={(e) => handleConfigChange(config.id, 'registrar_visualizacao', e.target.checked)}
                              disabled={!config.registrar_log}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={config.registrar_inclusao}
                              onChange={(e) => handleConfigChange(config.id, 'registrar_inclusao', e.target.checked)}
                              disabled={!config.registrar_log}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={config.registrar_edicao}
                              onChange={(e) => handleConfigChange(config.id, 'registrar_edicao', e.target.checked)}
                              disabled={!config.registrar_log}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={config.registrar_exclusao}
                              onChange={(e) => handleConfigChange(config.id, 'registrar_exclusao', e.target.checked)}
                              disabled={!config.registrar_log}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
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
          /* Consulta de Logs */
          <Card title="Logs de Ações" subtitle="Histórico de ações registradas no sistema">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Módulo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Nenhum log registrado
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(log.criado_em)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.usuario}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.modulo.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.tela.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAcaoBadge(log.acao)}`}>
                            {log.acao}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{log.registro_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip_address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Nota:</strong> Em uma implementação futura, será possível filtrar logs por data, usuário, módulo e ação,
                além de visualizar os detalhes completos de cada log incluindo os dados antes/depois das alterações.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
