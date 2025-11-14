"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Salvar dados do usuário no localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        // Redirecionar para dashboard
        router.push("/dashboard");
      } else {
        setError(data.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div>
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            CristalCar ERP
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-300">
            Sistema de Gestão Automotiva
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="card mt-8">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="alert-danger">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="username" className="form-label">
                  Usuário ou E-mail
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="form-input"
                  placeholder="Digite seu usuário"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="senha" className="form-label">
                  Senha
                </label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="form-input"
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="form-checkbox"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-secondary-700"
                  >
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="card-footer">
            <p className="text-xs text-center text-secondary-600">
              Usuário padrão: <span className="font-semibold">admin</span> | Senha:{" "}
              <span className="font-semibold">admin123</span>
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center">
          <p className="text-sm text-secondary-400">
            © 2024 CristalCar. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
