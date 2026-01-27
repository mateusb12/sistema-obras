import { type ReactNode } from 'react';
import { Moon, Sun, FileText } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

interface FullLayoutProps {
  children: ReactNode;
}

export function FullLayout({ children }: FullLayoutProps) {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[2000px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600 dark:text-blue-400" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Digital Inspection
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Replace paper forms with digital precision
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[2000px] mx-auto">
        {children}
      </main>
    </div>
  );
}
