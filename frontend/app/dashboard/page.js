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

  const quickActions = [
    { title: 'Nova Movimentação', icon: '➕', href: '/modules/financeiro/movimentacao', color: 'bg-primary-500' },
    { title: 'Cadastrar Parceiro', icon: '👤', href: '/modules/parceiros/cadastro', color: 'bg-blue-500' },
    { title: 'Importar XML', icon: '📄', href: '/modules/importacao/xml', color: 'bg-green-500' },
    { title: 'Relatórios', icon: '📈', href: '/modules/relatorios', color: 'bg-purple-500' },
  ];

  const recentActivities = [
    { type: 'Recebimento', description: 'Cliente ABC - NF 12345', value: 'R$ 2.500,00', time: 'Há 2 horas', status: 'success' },
    { type: 'Pagamento', description: 'Fornecedor XYZ - Boleto 67890', value: 'R$ 1.200,00', time: 'Há 4 horas', status: 'info' },
    { type: 'Cadastro', description: 'Novo cliente: João Silva', value: '-', time: 'Há 6 horas', status: 'neutral' },
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ações Rápidas */}
          <div className="lg:col-span-1">
            <Card title="Ações Rápidas" className="h-full">
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center space-x-4 p-4 rounded-lg ${action.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="font-medium">{action.title}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Atividades Recentes */}
          <div className="lg:col-span-2">
            <Card
              title="Atividades Recentes"
              subtitle="Últimas movimentações do sistema"
              actions={
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              }
            >
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'info' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-800">{activity.type}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{activity.value}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Avisos e Lembretes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="⚠️ Contas Vencendo" className="border-l-4 border-l-warning">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Fornecedor ABC - Vence hoje</span>
                <span className="font-semibold text-warning-dark">R$ 3.500,00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Aluguel - Vence em 2 dias</span>
                <span className="font-semibold text-warning-dark">R$ 2.800,00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">IPTU - Vence em 5 dias</span>
                <span className="font-semibold text-warning-dark">R$ 1.200,00</span>
              </div>
            </div>
          </Card>

          <Card title="📢 Lembretes do Sistema" className="border-l-4 border-l-info">
            <div className="space-y-3">
              <div className="flex items-start space-x-3 py-2">
                <span className="text-blue-500">•</span>
                <p className="text-gray-700 text-sm">Backup automático configurado para hoje às 02:00</p>
              </div>
              <div className="flex items-start space-x-3 py-2">
                <span className="text-blue-500">•</span>
                <p className="text-gray-700 text-sm">15 clientes com aniversário este mês</p>
              </div>
              <div className="flex items-start space-x-3 py-2">
                <span className="text-blue-500">•</span>
                <p className="text-gray-700 text-sm">Conciliação bancária pendente para o mês atual</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
