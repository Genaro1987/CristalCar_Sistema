'use client';

import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import { useState, useEffect, useMemo } from 'react';

const dicasDashboard = [
  {
    titulo: 'Fluxo de caixa saudável',
    descricao: 'Atualize o plano de contas e acompanhe semanalmente os saldos bancários para evitar surpresas.',
    emoji: '📊'
  },
  {
    titulo: 'Equipes alinhadas',
    descricao: 'Registre responsáveis por área e defina quem aprova cada processo para reduzir retrabalho.',
    emoji: '🤝'
  },
  {
    titulo: 'Processos padronizados',
    descricao: 'Use os modelos de DRE para definir tipos e estrutura, garantindo relatórios consistentes.',
    emoji: '⚙️'
  },
  {
    titulo: 'Controle de custos',
    descricao: 'Separe despesas fixas e variáveis para facilitar análises de ponto de equilíbrio.',
    emoji: '💡'
  },
  {
    titulo: 'Revisão de preços',
    descricao: 'Centralize as tabelas de preço e mantenha histórico de alterações para auditoria rápida.',
    emoji: '📈'
  }
];

export default function DashboardPage() {
  const [empresaData, setEmpresaData] = useState(null);
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [seedDicas, setSeedDicas] = useState(Date.now());

  useEffect(() => {
    // Atualizar hora a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const salva = localStorage.getItem('empresaSelecionadaId');
    if (salva) {
      setEmpresaSelecionadaId(Number(salva));
    }

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    carregarDadosEmpresa();
  }, [empresaSelecionadaId]);

  const carregarDadosEmpresa = async () => {
    try {
      const query = empresaSelecionadaId ? `?id=${empresaSelecionadaId}` : '';
      const response = await fetch(`/api/administrativo/empresa${query}`);
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

  const dicasSelecionadas = useMemo(() => {
    const embaralhadas = [...dicasDashboard].sort(() => 0.5 - Math.random());
    return embaralhadas.slice(0, 3);
  }, [seedDicas]);

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
            <div className="flex items-center justify-center py-8">
              {empresaData?.logo_path ? (
                <img src={empresaData.logo_path} alt="Logo" className="w-144 h-144 object-contain" />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-2">🚗</div>
                  <div className="text-sm text-primary-200">Cristal Car</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card
          title="Você sabia?"
          subtitle="Dicas rápidas para melhorar a gestão e os processos"
          actions={(
            <button
              onClick={() => setSeedDicas(Date.now())}
              className="text-sm text-primary-50 hover:text-white underline"
            >
              Ver novas dicas
            </button>
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dicasSelecionadas.map((dica, index) => (
              <div key={index} className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">{dica.emoji}</span> {dica.titulo}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {dica.descricao}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
