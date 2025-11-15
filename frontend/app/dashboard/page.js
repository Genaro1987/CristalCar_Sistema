'use client';

import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [empresaData, setEmpresaData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Atualizar hora a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Buscar dados da empresa (mock por enquanto)
    setEmpresaData({
      nome_fantasia: 'Cristal Car',
      razao_social: 'Cristal Car Ltda',
      logo_path: null
    });

    return () => clearInterval(timer);
  }, []);

  // Telas favoritas do usuário (será configurável no futuro)
  const [telasFavoritas, setTelasFavoritas] = useState([
    { codigo: 'ADM-001', nome: 'Cadastro da Empresa', href: '/modules/administrativo/empresa', icon: '🏢' },
    { codigo: 'FIN-001', nome: 'Plano de Contas', href: '/modules/modelos-plano/plano-contas', icon: '📊' },
    { codigo: 'PAR-001', nome: 'Cadastro de Parceiros', href: '/modules/parceiros/cadastro', icon: '👥' },
    { codigo: 'FIN-002', nome: 'Movimentação Financeira', href: '/modules/financeiro/movimentacao', icon: '💰' },
  ]);

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
            <Button variant="ghost" size="sm">
              Configurar
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {telasFavoritas.map((tela, index) => (
              <a
                key={index}
                href={tela.href}
                className="group p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{tela.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                      {tela.nome}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{tela.codigo}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors"
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
        </Card>
      </div>
    </DashboardLayout>
  );
}
