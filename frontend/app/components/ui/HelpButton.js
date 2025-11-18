'use client';

import { useState } from 'react';

/**
 * Componente HelpButton - Botão de Ajuda Reutilizável
 */
export default function HelpButton({ title = "Ajuda", content, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão de Ajuda Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-40 group"
        title="Abrir ajuda"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 text-sm bg-gray-900 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ajuda
        </span>
      </button>

      {/* Modal de Ajuda */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho */}
            <div className="bg-primary-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold">{title}</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6">
              {children || (content ? <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} /> : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">Nenhum conteúdo de ajuda disponível</p>
                  <p className="mt-2">A documentação para esta tela ainda não foi criada.</p>
                </div>
              ))}
            </div>

            {/* Rodapé */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
