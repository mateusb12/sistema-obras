import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import casasManagerLogo from '../assets/casasmanager.png'
import { useAuth } from '../auth/useAuth'
import { MOCK_USERS } from '../auth/mockUsers'
import { APP_ROUTES, navigateTo } from '../routes/router'

export function DummyLoginPage() {
  const { isDark, toggleDarkMode } = useDarkMode()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      login(email, password)
      setError('')
      navigateTo(APP_ROUTES.DASHBOARD)
    } catch {
      setError('Credenciais inválidas. Use uma das contas de teste abaixo.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4 transition-colors dark:bg-gray-900">
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {isDark ? (
          <Sun className="text-yellow-500" size={22} />
        ) : (
          <Moon className="text-gray-700 dark:text-gray-300" size={22} />
        )}
      </button>

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-colors dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-6 px-8 pt-8 pb-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src={casasManagerLogo}
              alt="Casas Manager Logo"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Entrar no sistema
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Login simulado com autenticação por token e perfil
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
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Digite seu e-mail"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Digite sua senha"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((currentValue) => !currentValue)
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Acessar
            </button>
          </form>
        </div>

        <div className="bg-gray-900 px-6 py-4 text-sm text-gray-100 dark:bg-gray-950">
          <p className="mb-2 font-semibold tracking-wide text-gray-300 uppercase">
            Credenciais de teste
          </p>

          {MOCK_USERS.map((mockUser) => (
            <p key={mockUser.id}>
              {mockUser.email} / {mockUser.password} ({mockUser.role})
            </p>
          ))}

          <button
            onClick={() => {
              if (!confirm('Deseja realmente RESETAR todos os dados locais?'))
                return

              localStorage.removeItem('cm.site-inspections')
              localStorage.removeItem('cm.site-inspections.active-draft')
              localStorage.removeItem('cm.auth.token')

              window.location.reload()
            }}
            className="
      mt-4 w-full text-center rounded-lg
      border border-red-500/40 bg-red-900/20
      text-red-300 py-2
      hover:bg-red-900/40 hover:border-red-400
      hover:text-red-200 hover:shadow-[0_0_12px_rgba(255,0,0,0.3)]
      transition-all duration-300 text-xs font-semibold
    "
          >
            🔥 Limpar cache do navegador (aperte isso para corrigir BUGS)
          </button>
        </div>
      </div>
    </div>
  )
}
