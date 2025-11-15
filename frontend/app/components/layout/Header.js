'use client';

import { useState } from 'react';

export default function Header({ title, pageCode = '' }) {
  const openDocumentation = () => {
    // Abre a documentação da tela em nova janela
    const docUrl = `/docs/${pageCode || 'general'}`;
    window.open(docUrl, '_blank', 'width=800,height=600,scrollbars=yes');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Título da Página */}
          <div>
            <h1 className="text-2xl font-bold text-primary-600">{title}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-secondary-500">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {pageCode && (
                <>
                  <span className="text-secondary-300">•</span>
                  <span className="text-xs text-secondary-400 font-mono bg-secondary-50 px-2 py-0.5 rounded">
                    {pageCode}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center space-x-4">
            {/* Pesquisa Rápida */}
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Ajuda / Documentação */}
            <button
              onClick={openDocumentation}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Abrir documentação desta tela"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
