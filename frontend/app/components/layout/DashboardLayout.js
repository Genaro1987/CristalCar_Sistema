'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastProvider } from '../ui/ToastProvider';

export default function DashboardLayout({ children, screenCode = '', onShowHelp }) {
  // Mapeamento de códigos para nomes de telas
  const screenNames = {
    'ADM-001': 'Cadastro da Empresa',
    'ADM-002': 'Funcionários',
    'ADM-003': 'Layouts de Importação',
    'ADM-004': 'Configuração de Backup',
    'ADM-005': 'Registro de Log',
    'FIN-001': 'Plano de Contas',
    'FIN-002': 'Estrutura DRE',
    'FIN-010': 'Formas de Pagamento',
    'FIN-011': 'Condições de Pagamento',
    'FIN-012': 'Cadastro de Bancos',
    'FIN-013': 'Regras de Conciliação',
    'PAR-001': 'Cadastro de Parceiros',
    'TAB-001': 'Tabelas de Preços',
    'TAB-002': 'Histórico de Alterações',
  };

  const screenName = screenNames[screenCode] || 'Página Inicial';

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="ml-80">
          {/* Header */}
          <Header
            screenCode={screenCode}
            screenName={screenName}
            onShowHelp={onShowHelp}
          />

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
