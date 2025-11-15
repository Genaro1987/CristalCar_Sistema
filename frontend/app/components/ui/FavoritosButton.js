'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FavoritosButton({ screenCode, screenName, screenPath }) {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState([]);
  const [isFavorito, setIsFavorito] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  useEffect(() => {
    // Verifica se a tela atual é favorita
    if (screenCode) {
      const existe = favoritos.some(fav => fav.codigo_tela === screenCode);
      setIsFavorito(existe);
    }
  }, [favoritos, screenCode]);

  const carregarFavoritos = async () => {
    try {
      const response = await fetch('/api/favoritos');
      if (response.ok) {
        const data = await response.json();
        setFavoritos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const toggleFavorito = async () => {
    if (!screenCode || !screenName || !screenPath) return;

    setLoading(true);
    try {
      if (isFavorito) {
        // Remover
        const response = await fetch(`/api/favoritos?codigo_tela=${screenCode}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await carregarFavoritos();
        }
      } else {
        // Adicionar
        const response = await fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codigo_tela: screenCode,
            nome_tela: screenName,
            caminho_tela: screenPath,
            ordem: favoritos.length
          })
        });

        if (response.ok) {
          await carregarFavoritos();
        }
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    } finally {
      setLoading(false);
    }
  };

  const navegarPara = (caminho) => {
    setShowDropdown(false);
    router.push(caminho);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Botão de Favoritar Tela Atual */}
        {screenCode && (
          <button
            onClick={toggleFavorito}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              isFavorito
                ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorito ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        )}

        {/* Botão para Mostrar Favoritos */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors relative"
            title="Meus favoritos"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            {favoritos.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {favoritos.length}
              </span>
            )}
          </button>

          {/* Dropdown de Favoritos */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Meus Favoritos
                  </h3>
                  <p className="text-orange-100 text-xs mt-1">
                    {favoritos.length} {favoritos.length === 1 ? 'tela favorita' : 'telas favoritas'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {favoritos.length === 0 ? (
                    <div className="p-8 text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-gray-300 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm">Nenhuma tela favorita</p>
                      <p className="text-gray-400 text-xs mt-2">
                        Clique na estrela para adicionar telas aos seus favoritos
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {favoritos.map((favorito, index) => (
                        <button
                          key={favorito.id}
                          onClick={() => navegarPara(favorito.caminho_tela)}
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                                {favorito.nome_tela}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 font-mono">
                                {favorito.codigo_tela}
                              </div>
                            </div>
                            <svg
                              className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
