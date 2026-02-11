import { useState } from 'react';
import type { FormEvent } from 'react';
import casasManagerLogo from '../assets/casasmanager.png';

const MOCK_CREDENTIALS = {
  email: 'user@email.com',
  password: '123456',
};

type DummyLoginPageProps = {
  onLoginSuccess: () => void;
};

export function DummyLoginPage({ onLoginSuccess }: DummyLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
        <div className="px-8 pt-8 pb-6 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <img
              src={casasManagerLogo}
              alt="Casas Manager Logo"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Entrar no sistema</h1>
              <p className="text-sm text-gray-500 mt-1">Login simulado para validar a experiência</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite seu e-mail"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua senha"
                autoComplete="off"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-semibold hover:bg-blue-700 transition-colors"
            >
              Acessar
            </button>
          </form>
        </div>

        <div className="bg-gray-900 text-gray-100 px-6 py-4 text-sm">
          <p className="font-semibold uppercase tracking-wide text-gray-300 mb-2">Credenciais de teste</p>
          <p>mail = {MOCK_CREDENTIALS.email}</p>
          <p>password = {MOCK_CREDENTIALS.password}</p>
        </div>
      </div>
    </div>
  );
}
