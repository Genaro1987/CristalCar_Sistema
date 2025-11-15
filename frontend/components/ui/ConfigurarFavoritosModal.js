'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from '@/app/components/ui/Button';

export default function ConfigurarFavoritosModal({ isOpen, onClose, onSave }) {
  const [telasDisponiveis, setTelasDisponiveis] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTelas, setSelectedTelas] = useState([]);

  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar todas as telas do sistema
      let responseTelas = await fetch('/api/administrativo/telas');
      if (responseTelas.ok) {
        let telas = await responseTelas.json();

        // Se não houver telas, inicializar o sistema
        if (telas.length === 0) {
          console.log('Nenhuma tela encontrada. Inicializando telas do sistema...');
          const initResponse = await fetch('/api/administrativo/telas', {
            method: 'POST'
          });

          if (initResponse.ok) {
            // Recarregar telas após inicialização
            responseTelas = await fetch('/api/administrativo/telas');
            if (responseTelas.ok) {
              telas = await responseTelas.json();
            }
          }
        }

        setTelasDisponiveis(telas);
      }

      // Carregar favoritos atuais
      const responseFavoritos = await fetch('/api/favoritos');
      if (responseFavoritos.ok) {
        const favs = await responseFavoritos.json();
        setFavoritos(favs);
        // Pré-selecionar os favoritos atuais
        setSelectedTelas(favs.map(f => f.codigo_tela));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTela = (codigoTela) => {
    setSelectedTelas(prev => {
      if (prev.includes(codigoTela)) {
        return prev.filter(c => c !== codigoTela);
      } else {
        return [...prev, codigoTela];
      }
    });
  };

  const handleSalvar = async () => {
    setLoading(true);
    try {
      // Identificar o que precisa ser adicionado e removido
      const favoritosAtuais = favoritos.map(f => f.codigo_tela);
      const paraAdicionar = selectedTelas.filter(c => !favoritosAtuais.includes(c));
      const paraRemover = favoritosAtuais.filter(c => !selectedTelas.includes(c));

      // Adicionar novos favoritos
      for (const codigoTela of paraAdicionar) {
        const tela = telasDisponiveis.find(t => t.codigo_tela === codigoTela);
        if (tela) {
          await fetch('/api/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              codigo_tela: tela.codigo_tela,
              nome_tela: tela.nome_tela,
              caminho_tela: tela.caminho_tela,
              ordem: selectedTelas.indexOf(codigoTela)
            })
          });
        }
      }

      // Remover favoritos desmarcados
      for (const codigoTela of paraRemover) {
        await fetch(`/api/favoritos?codigo_tela=${codigoTela}`, {
          method: 'DELETE'
        });
      }

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
      alert('Erro ao salvar favoritos');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar telas por módulo
  const telasPorModulo = telasDisponiveis.reduce((acc, tela) => {
    if (!acc[tela.modulo]) {
      acc[tela.modulo] = [];
    }
    acc[tela.modulo].push(tela);
    return acc;
  }, {});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⭐ Configurar Telas Favoritas"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Selecione as telas que deseja exibir no painel de controle como favoritas.
          Você pode selecionar até 6 telas.
        </p>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando...</p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  {selectedTelas.length} de 6 telas selecionadas
                </span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {Object.entries(telasPorModulo).map(([modulo, telas]) => (
                <div key={modulo} className="border-b border-gray-200 last:border-b-0">
                  <div className="bg-gray-50 px-4 py-2 font-semibold text-sm text-gray-700 sticky top-0">
                    {modulo}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {telas.map(tela => {
                      const isSelected = selectedTelas.includes(tela.codigo_tela);
                      const isDisabled = !isSelected && selectedTelas.length >= 6;

                      return (
                        <label
                          key={tela.codigo_tela}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleTela(tela.codigo_tela)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {tela.nome_tela}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                              {tela.codigo_tela}
                            </div>
                          </div>
                          {isSelected && (
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSalvar}
            disabled={loading || selectedTelas.length === 0}
          >
            {loading ? 'Salvando...' : 'Salvar Favoritos'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
