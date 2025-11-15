'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedModule, setExpandedModule] = useState(null);

  const menuItems = [
    {
      id: 'home',
      name: 'Início',
      icon: '🏠',
      href: '/dashboard',
      submenu: []
    },
    {
      id: 'cadastros',
      name: 'Cadastros',
      icon: '📋',
      submenu: [
        {
          id: 'administrativo',
          name: 'Administrativo',
          submenu: [
            { name: 'Cadastro da Empresa', href: '/modules/administrativo/empresa' },
            { name: 'Funcionários', href: '/modules/administrativo/funcionarios' },
            { name: 'Layouts de Importação', href: '/modules/administrativo/layouts' },
            { name: 'Configuração de Backup', href: '/modules/administrativo/backup' },
            { name: 'Registro de Log', href: '/modules/administrativo/logs' },
          ]
        },
        {
          id: 'modelos-plano',
          name: 'Modelos de Plano',
          submenu: [
            { name: 'Plano de Contas', href: '/modules/modelos-plano/plano-contas' },
            { name: 'Estrutura DRE', href: '/modules/modelos-plano/estrutura-dre' },
          ]
        },
        {
          id: 'financeiro',
          name: 'Financeiro',
          submenu: [
            { name: 'Formas de Pagamento', href: '/modules/financeiro/formas-pagamento' },
            { name: 'Condições de Pagamento', href: '/modules/financeiro/condicoes-pagamento' },
            { name: 'Cadastro de Bancos', href: '/modules/financeiro/bancos' },
            { name: 'Regras de Conciliação', href: '/modules/financeiro/regras-conciliacao' },
          ]
        },
        {
          id: 'parceiros',
          name: 'Parceiros',
          submenu: [
            { name: 'Cadastro de Parceiros', href: '/modules/parceiros/cadastro' },
          ]
        },
        {
          id: 'tabelas',
          name: 'Cadastro de Tabelas',
          submenu: [
            { name: 'Tabelas de Preços', href: '/modules/tabelas-precos/cadastro' },
            { name: 'Histórico de Alterações', href: '/modules/tabelas-precos/historico' },
          ]
        },
      ]
    },
  ];

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const isActive = (href) => pathname === href;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-secondary-800 to-secondary-900 text-white shadow-xl overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
              Cristal Car
            </h1>
            <p className="text-xs text-secondary-400">Sistema ERP</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {/* Item Principal */}
              {item.submenu.length === 0 ? (
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'hover:bg-secondary-700 text-secondary-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleModule(item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-secondary-700 text-secondary-300 hover:text-white"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedModule === item.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Submenu Nível 1 */}
                  {expandedModule === item.id && (
                    <ul className="mt-2 ml-4 space-y-1">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.id}>
                          <details className="group">
                            <summary className="cursor-pointer list-none px-4 py-2 rounded-lg text-sm text-secondary-400 hover:bg-secondary-700 hover:text-white transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <span>▸ {subitem.name}</span>
                                <svg
                                  className="w-3 h-3 transition-transform group-open:rotate-90"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </summary>

                            {/* Submenu Nível 2 */}
                            <ul className="mt-1 ml-4 space-y-1">
                              {subitem.submenu.map((subsubitem, idx) => (
                                <li key={idx}>
                                  <Link
                                    href={subsubitem.href}
                                    className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                                      isActive(subsubitem.href)
                                        ? 'bg-primary-500 text-white font-medium'
                                        : 'text-secondary-400 hover:bg-secondary-700 hover:text-white'
                                    }`}
                                  >
                                    • {subsubitem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-700 bg-secondary-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-secondary-400">Administrador</p>
          </div>
          <button className="text-secondary-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
