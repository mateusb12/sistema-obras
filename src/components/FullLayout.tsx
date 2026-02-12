import type { ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { InspectionPage } from '../features/site-inspection-report';
import casasManagerLogo from '../assets/casasmanager.png';
import { useAuth } from '../auth/useAuth';
import { APP_ROUTES, navigateTo } from '../routes/router';
import { ROLES } from '../auth/types';

type FullLayoutProps = {
  children?: ReactNode;
};

export function FullLayout({ children }: FullLayoutProps) {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigateTo(APP_ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <UpperBar isDark={isDark} toggleDarkMode={toggleDarkMode} />

      <main className="mx-auto max-w-[2000px]">
        <div className="min-h-[calc(100vh-89px)] space-y-4 bg-white p-6 dark:bg-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sessão atual</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {user?.name} ({user?.role})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600"
                onClick={() => navigateTo(APP_ROUTES.DASHBOARD)}
              >
                Dashboard
              </button>
              <button
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600"
                onClick={() => navigateTo(APP_ROUTES.ENGINEERING)}
              >
                Engenharia
              </button>
              <button
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600"
                onClick={() => navigateTo(APP_ROUTES.ADMIN)}
              >
                Admin
              </button>
              <button
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
                onClick={handleLogout}
              >
                Sair
              </button>
            </div>
          </div>

          {user?.role === ROLES.VIEWER && (
            <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-900">
              Perfil Viewer: acesso de visualização, sem permissões administrativas.
            </p>
          )}

          {children}
          <InspectionPage />
        </div>
      </main>
    </div>
  );
}

type UpperBarProps = {
  isDark: boolean;
  toggleDarkMode: () => void;
};

function UpperBar({ isDark, toggleDarkMode }: UpperBarProps) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-[2000px] items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <img src={casasManagerLogo} alt="Casas Manager Logo" className="h-10 w-auto object-contain" />

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inspeção Digital</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Troque o papel pela eficiência digital</p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="text-yellow-500" size={24} /> : <Moon className="text-gray-700" size={24} />}
        </button>
      </div>
    </header>
  );
}
