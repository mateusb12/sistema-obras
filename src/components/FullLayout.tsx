import { Moon, Sun, FileText } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { InspectionPage } from '../features/site-inspection-report';

export function FullLayout() {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <UpperBar isDark={isDark} toggleDarkMode={toggleDarkMode} />

        <main className="max-w-[2000px] mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 min-h-[calc(100vh-89px)]">
            <InspectionPage />
          </div>
        </main>
      </div>
  );
}

/* -------------------------------------------------------
   INTERNAL COMPONENT — stays inside the same file
------------------------------------------------------- */
type UpperBarProps = {
    isDark: boolean;
    toggleDarkMode: () => void;
};


function UpperBar({ isDark, toggleDarkMode }: UpperBarProps) {
  return (
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[2000px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600 dark:text-blue-400" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inspeção Digital
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Troque o papel pela eficiência digital
              </p>
            </div>
          </div>

          <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
          >
            {isDark ? (
                <Sun className="text-yellow-500" size={24} />
            ) : (
                <Moon className="text-gray-700" size={24} />
            )}
          </button>
        </div>
      </header>
  );
}
