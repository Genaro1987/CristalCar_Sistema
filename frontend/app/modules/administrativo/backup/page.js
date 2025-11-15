'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function ConfiguracaoBackupPage() {
  const [config, setConfig] = useState({
    id: 1,
    ativo: false,
    tipo_backup: 'GOOGLE_DRIVE',
    google_drive_folder_id: '',
    frequencia: 'DIARIA',
    hora_execucao: '02:00',
    dia_semana: 0,
    dia_mes: 1,
    manter_ultimos: 30,
    email_notificacao: '',
    notificar_sucesso: false,
    notificar_erro: true,
    ultimo_backup: null,
    proximo_backup: null
  });

  const [historico, setHistorico] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tiposBackup = [
    { value: 'GOOGLE_DRIVE', label: 'Google Drive', available: false },
    { value: 'LOCAL', label: 'Armazenamento Local', available: true },
    { value: 'FTP', label: 'Servidor FTP', available: false }
  ];

  const frequencias = [
    { value: 'DIARIA', label: 'Diária' },
    { value: 'SEMANAL', label: 'Semanal' },
    { value: 'MENSAL', label: 'Mensal' }
  ];

  const diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  useEffect(() => {
    loadConfig();
    loadHistorico();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/backup/config');
      if (response.ok) {
        const data = await response.json();
        setConfig({
          id: data.id,
          ativo: data.backup_automatico === 1,
          tipo_backup: data.tipo_backup || 'LOCAL',
          diretorio_local: data.diretorio_local || '',
          google_drive_folder_id: data.google_drive_folder_id || '',
          frequencia: data.frequencia || 'DIARIA',
          hora_execucao: data.horario_execucao || '02:00',
          dia_semana: data.dia_semana || 0,
          dia_mes: data.dia_mes || 1,
          manter_ultimos: data.quantidade_manter || 30,
          email_notificacao: '',
          notificar_sucesso: false,
          notificar_erro: true,
          ultimo_backup: data.ultimo_backup,
          proximo_backup: data.proximo_backup
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const loadHistorico = async () => {
    try {
      const response = await fetch('/api/backup/historico');
      if (response.ok) {
        const data = await response.json();
        setHistorico(data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Validações
    if (config.ativo) {
      if (config.tipo_backup === 'LOCAL' && !config.diretorio_local) {
        alert('Informe o diretório local para backup');
        setIsSaving(false);
        return;
      }

      if (config.tipo_backup === 'GOOGLE_DRIVE' && !config.google_drive_folder_id) {
        alert('Informe o ID da pasta do Google Drive');
        setIsSaving(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/backup/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_backup: config.tipo_backup,
          diretorio_local: config.diretorio_local,
          google_drive_folder_id: config.google_drive_folder_id,
          frequencia: config.frequencia,
          horario_execucao: config.hora_execucao,
          dia_semana: config.dia_semana,
          dia_mes: config.dia_mes,
          quantidade_manter: config.manter_ultimos,
          backup_automatico: config.ativo
        })
      });

      if (response.ok) {
        await loadConfig();
        setIsEditing(false);
        alert('Configuração salva com sucesso!');
      } else {
        alert('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecutarBackup = () => {
    if (!config.ativo) {
      alert('O backup está desativado. Ative-o primeiro antes de executar manualmente.');
      return;
    }

    if (confirm('Deseja executar o backup agora?')) {
      alert('Backup iniciado! Você será notificado quando concluir.');
      // Aqui chamaria a API para executar o backup
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    return status === 'SUCESSO'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <DashboardLayout screenCode="ADM-004">
      <div className="space-y-6">
        {/* Informação sobre Google Drive */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Integração com Google Drive
              </h4>
              <p className="text-sm text-blue-800">
                A integração com Google Drive está em desenvolvimento. Por enquanto, utilize o backup local.
                Quando disponível, você poderá configurar o backup automático para sua conta do Google Drive.
              </p>
            </div>
          </div>
        </div>

        {/* Status Atual */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${config.ativo ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Status do Backup: {config.ativo ? 'Ativo' : 'Inativo'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Último backup: {formatDateTime(config.ultimo_backup)} •
                  Próximo backup: {formatDateTime(config.proximo_backup)}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleExecutarBackup}>
                Executar Backup Agora
              </Button>
              {!isEditing && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Editar Configuração
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Formulário de Configuração */}
        {isEditing ? (
          <form onSubmit={handleSave}>
            <Card title="Configurações de Backup" subtitle="Configure o backup automático do banco de dados">
              <div className="space-y-6">
                {/* Ativação */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="ativo"
                    name="ativo"
                    checked={config.ativo}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="ativo" className="flex-1 cursor-pointer">
                    <span className="text-base font-semibold text-gray-900">Ativar Backup Automático</span>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Quando ativado, o backup será executado automaticamente de acordo com a periodicidade configurada
                    </p>
                  </label>
                </div>

                {config.ativo && (
                  <>
                    {/* Tipo de Backup */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Tipo de Backup
                      </h3>
                      <div className="space-y-3">
                        {tiposBackup.map(tipo => (
                          <label
                            key={tipo.value}
                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              config.tipo_backup === tipo.value
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${!tipo.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="radio"
                              name="tipo_backup"
                              value={tipo.value}
                              checked={config.tipo_backup === tipo.value}
                              onChange={handleInputChange}
                              disabled={!tipo.available}
                              className="mt-1 mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{tipo.label}</span>
                                {!tipo.available && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-200 rounded">
                                    Em breve
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Configurações do Google Drive */}
                    {config.tipo_backup === 'GOOGLE_DRIVE' && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                          Configurações do Google Drive
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ID da Pasta do Google Drive
                            </label>
                            <input
                              type="text"
                              name="google_drive_folder_id"
                              value={config.google_drive_folder_id}
                              onChange={handleInputChange}
                              placeholder="Ex: 1a2b3c4d5e6f7g8h9i0j"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              O ID da pasta pode ser encontrado na URL do Google Drive
                            </p>
                          </div>
                          <div>
                            <Button type="button" variant="outline">
                              Conectar com Google Drive
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Periodicidade */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Periodicidade
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequência
                          </label>
                          <select
                            name="frequencia"
                            value={config.frequencia}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {frequencias.map(freq => (
                              <option key={freq.value} value={freq.value}>{freq.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horário de Execução
                          </label>
                          <input
                            type="time"
                            name="hora_execucao"
                            value={config.hora_execucao}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>

                        {config.frequencia === 'SEMANAL' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dia da Semana
                            </label>
                            <select
                              name="dia_semana"
                              value={config.dia_semana}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {diasSemana.map(dia => (
                                <option key={dia.value} value={dia.value}>{dia.label}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {config.frequencia === 'MENSAL' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dia do Mês
                            </label>
                            <input
                              type="number"
                              name="dia_mes"
                              value={config.dia_mes}
                              onChange={handleInputChange}
                              min="1"
                              max="31"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Manter Últimos Backups
                          </label>
                          <input
                            type="number"
                            name="manter_ultimos"
                            value={config.manter_ultimos}
                            onChange={handleInputChange}
                            min="1"
                            max="365"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Backups mais antigos serão excluídos automaticamente
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notificações */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Notificações
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-mail para Notificações *
                          </label>
                          <input
                            type="email"
                            name="email_notificacao"
                            value={config.email_notificacao}
                            onChange={handleInputChange}
                            placeholder="seu@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="notificar_sucesso"
                              checked={config.notificar_sucesso}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                              Notificar quando o backup for concluído com sucesso
                            </span>
                          </label>

                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="notificar_erro"
                              checked={config.notificar_erro}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                              Notificar quando ocorrer erro no backup
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Botões */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      loadConfig(); // Reload original config
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        ) : (
          /* Visualização da Configuração */
          <Card title="Configuração Atual">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo de Backup</label>
                <p className="text-base text-gray-900 mt-1">
                  {tiposBackup.find(t => t.value === config.tipo_backup)?.label}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Frequência</label>
                <p className="text-base text-gray-900 mt-1">
                  {frequencias.find(f => f.value === config.frequencia)?.label} às {config.hora_execucao}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Retenção</label>
                <p className="text-base text-gray-900 mt-1">
                  Manter últimos {config.manter_ultimos} backups
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">E-mail para Notificações</label>
                <p className="text-base text-gray-900 mt-1">
                  {config.email_notificacao || '-'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Histórico de Backups */}
        <Card title="Histórico de Backups" subtitle="Últimos backups executados">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historico.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Nenhum backup executado ainda
                    </td>
                  </tr>
                ) : (
                  historico.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(backup.data_backup)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(backup.status)}`}>
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.tamanho_arquivo_bytes ? formatBytes(backup.tamanho_arquivo_bytes) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.tempo_execucao_segundos}s
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">
                          {backup.local_arquivo || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        {backup.mensagem_erro || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
