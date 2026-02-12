import { useState } from 'react';
import type { FormEvent } from 'react';
import {Eye, EyeOff, Moon, Sun} from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import casasManagerLogo from '../assets/casasmanager.png';

const MOCK_CREDENTIALS = {
  email: 'user@email.com',
  password: '123456',
};

type DummyLoginPageProps = {
  onLoginSuccess: () => void;
};

export function DummyLoginPage({ onLoginSuccess }: DummyLoginPageProps) {
  const { isDark, toggleDarkMode } = useDarkMode();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLogin =
        email.trim().toLowerCase() === MOCK_CREDENTIALS.email &&
        password === MOCK_CREDENTIALS.password;

    if (!isValidLogin) {
      setError('Credenciais inválidas. Use os dados informados abaixo.');
      return;
    }

    setError('');
    onLoginSuccess();
  };

  return (
      <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">

        {/* 🔹 Dark mode toggle */}
        <button
            onClick={toggleDarkMode}
            className="absolute top-6 right-6 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? (
              <Sun className="text-yellow-500" size={22} />
          ) : (
              <Moon className="text-gray-700 dark:text-gray-300" size={22} />
          )}
        </button>

        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">

          <div className="px-8 pt-8 pb-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <img
                  src={casasManagerLogo}
                  alt="Casas Manager Logo"
                  className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Entrar no sistema
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Login simulado para validar a experiência
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-mail
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite seu e-mail"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>

                <div className="relative mt-1">
                  <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite sua senha"
                  />

                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-semibold hover:bg-blue-700 transition-colors"
              >
                Acessar
              </button>
            </form>
          </div>

          <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 px-6 py-4 text-sm">
            <p className="font-semibold uppercase tracking-wide text-gray-300 mb-2">
              Credenciais de teste
            </p>
            <p>mail = {MOCK_CREDENTIALS.email}</p>
            <p>password = {MOCK_CREDENTIALS.password}</p>
          </div>
        </div>
      </div>
  );
}
