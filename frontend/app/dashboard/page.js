'use client';

import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfigurarFavoritosModal from '@/components/ui/ConfigurarFavoritosModal';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [empresaData, setEmpresaData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [telasFavoritas, setTelasFavoritas] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Atualizar hora a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Buscar dados da empresa
    carregarDadosEmpresa();

    // Carregar favoritos
    carregarFavoritos();

    return () => clearInterval(timer);
  }, []);

  const carregarDadosEmpresa = async () => {
    try {
      const response = await fetch('/api/administrativo/empresa');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setEmpresaData(data);
        } else {
          // Dados padrão se não houver empresa cadastrada
          setEmpresaData({
            nome_fantasia: 'Cristal Car',
            razao_social: 'Cristal Car Ltda',
            logo_path: null
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  const carregarFavoritos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/favoritos');
      if (response.ok) {
        const favoritos = await response.json();
        // Limitar a 6 favoritos no dashboard
        setTelasFavoritas(favoritos.slice(0, 6));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSaved = () => {
    // Recarregar favoritos após salvar configuração
    carregarFavoritos();
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <DashboardLayout title="Painel de Controle">
      <div className="space-y-6">
        {/* Boas-vindas */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {getGreeting()}, Administrador! 👋
              </h2>
              <p className="text-primary-100 text-lg">
                Bem-vindo ao sistema {empresaData?.nome_fantasia || 'Cristal Car'}
              </p>
              <p className="text-primary-200 text-sm mt-2">
                {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {/* Logo da Empresa */}
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border-2 border-white/20">
                {empresaData?.logo_path ? (
                  <img src={empresaData.logo_path} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center">
                    <div className="text-5xl mb-2">🚗</div>
                    <div className="text-xs text-primary-200">Cristal Car</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Telas Favoritas */}
        <Card
          title="⭐ Telas Favoritas"
          subtitle="Acesso rápido às suas telas mais utilizadas"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfigModal(true)}
            >
              Configurar
            </Button>
          }
        >
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando favoritos...</p>
            </div>
          ) : telasFavoritas.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhuma tela favorita
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Configure suas telas favoritas para acesso rápido
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowConfigModal(true)}
              >
                Configurar Favoritos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {telasFavoritas.map((tela, index) => (
                <a
                  key={tela.id || index}
                  href={tela.caminho_tela}
                  className="group p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors truncate">
                        {tela.nome_tela}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{tela.codigo_tela}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>

        {/* Modal de Configuração */}
        <ConfigurarFavoritosModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSave={handleConfigSaved}
        />
      </div>
    </DashboardLayout>
  );
}
