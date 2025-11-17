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
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-10 text-white">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-sm text-primary-100">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <h2 className="text-4xl font-bold">
              {getGreeting()}, Administrador! 👋
            </h2>
            <p className="text-primary-100 text-lg">
              Bem-vindo ao sistema {empresaData?.nome_fantasia || 'Cristal Car'}
            </p>
            <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              {empresaData?.logo_path ? (
                <img src={empresaData.logo_path} alt="Logo" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-2">🚗</div>
                  <div className="text-sm text-primary-200">Cristal Car</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
