'use client';

import { useState } from 'react';

export default function HelpButton({ helpContent }) {
  const [showModal, setShowModal] = useState(false);

  if (!helpContent) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
        title="Ajuda"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ajuda - {helpContent.title}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {helpContent.sections.map((section, index) => (
                <div key={index} className={index > 0 ? 'mt-6' : ''}>
                  {section.heading && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                      {section.icon && <span className="mr-2">{section.icon}</span>}
                      {section.heading}
                    </h3>
                  )}

                  {section.content && (
                    <div className="text-gray-700 space-y-2">
                      {typeof section.content === 'string' ? (
                        <p>{section.content}</p>
                      ) : (
                        section.content
                      )}
                    </div>
                  )}

                  {section.items && (
                    <div className="space-y-2">
                      {section.items.map((item, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.tips && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-orange-900 mb-2">💡 Dicas</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {section.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
