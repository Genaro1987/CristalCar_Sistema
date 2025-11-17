"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const mensagensBoasVindas = [
  "Selecione a empresa para personalizar os dados do painel.",
  "Escolha a organização que deseja operar agora.",
  "Comece selecionando a empresa para aplicar os filtros do sistema.",
];

export default function HomePage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  useEffect(() => {
    if (empresas.length === 0) return;
    const salva = localStorage.getItem("empresaSelecionadaId");
    if (salva) {
      const encontrada = empresas.find((emp) => `${emp.id}` === `${salva}`);
      if (encontrada) {
        setEmpresaSelecionada(encontrada.id);
      }
    } else {
      const padrao = empresas.find((emp) => emp.padrao);
      if (padrao) setEmpresaSelecionada(padrao.id);
    }
  }, [empresas]);

  const mensagemAleatoria = useMemo(() => {
    const index = Math.floor(Math.random() * mensagensBoasVindas.length);
    return mensagensBoasVindas[index];
  }, []);

  const carregarEmpresas = async () => {
    try {
      setCarregando(true);
      const response = await fetch("/api/administrativo/empresa?all=true");
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data || []);
      } else {
        setErro("Não foi possível carregar as empresas.");
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      setErro("Erro ao carregar empresas.");
    } finally {
      setCarregando(false);
    }
  };

  const handleSelecionar = (empresaId) => {
    setEmpresaSelecionada(empresaId);
    localStorage.setItem("empresaSelecionadaId", empresaId);
  };

  const prosseguir = () => {
    if (!empresaSelecionada) return;
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-primary-600">Bem-vindo</p>
          <h1 className="text-3xl font-bold text-gray-900">Selecione a empresa para iniciar</h1>
          <p className="text-gray-600">{mensagemAleatoria}</p>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="flex items-center justify-center py-12 text-gray-500">Carregando empresas...</div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Nenhuma empresa cadastrada ainda.</p>
              <p className="text-sm text-gray-500 mt-2">Cadastre uma empresa para continuar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {empresas.map((empresa) => {
                const ativa = `${empresaSelecionada}` === `${empresa.id}`;
                return (
                  <button
                    key={empresa.id}
                    onClick={() => handleSelecionar(empresa.id)}
                    className={`text-left rounded-xl border transition shadow-sm p-4 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      ativa
                        ? "border-primary-200 bg-primary-50"
                        : "border-gray-200 bg-white hover:border-primary-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Empresa</p>
                        <h2 className="text-lg font-semibold text-gray-900">{empresa.nome_fantasia || empresa.razao_social}</h2>
                        {empresa.cnpj && (
                          <p className="text-xs text-gray-500">CNPJ: {empresa.cnpj}</p>
                        )}
                        {empresa.cidade && (
                          <p className="text-xs text-gray-500">{empresa.cidade} - {empresa.estado}</p>
                        )}
                      </div>
                      {ativa && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white text-primary-700 border border-primary-200">
                          Selecionada
                        </span>
                      )}
                    </div>
                    {empresa.padrao && !ativa && (
                      <span className="mt-3 inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-amber-100 text-amber-800">
                        Sugestão padrão
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-500">
              A empresa selecionada será usada em todas as telas do sistema.
            </p>
            <button
              onClick={prosseguir}
              disabled={!empresaSelecionada}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                empresaSelecionada
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Ir para o painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
