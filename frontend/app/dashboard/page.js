'use client';

import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [empresaData, setEmpresaData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Atualizar hora a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Buscar dados da empresa
    carregarDadosEmpresa();

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

        <Card title="Atalhos rápidos" subtitle="Acesse rapidamente as telas principais do sistema">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{
              titulo: 'Cadastro da Empresa', descricao: 'Revise ou atualize os dados oficiais', caminho: '/modules/administrativo/empresa'
            }, {
              titulo: 'Plano de Contas', descricao: 'Mantenha a hierarquia contábil em dia', caminho: '/modules/modelos-plano/plano-contas'
            }, {
              titulo: 'Formas de Pagamento', descricao: 'Configure meios de cobrança e recebimento', caminho: '/modules/financeiro/formas-pagamento'
            }].map((atalho, idx) => (
              <a
                key={idx}
                href={atalho.caminho}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">{atalho.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">{atalho.descricao}</p>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
