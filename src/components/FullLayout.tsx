import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Menu, Moon, Sun, X } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import casasManagerLogo from '../assets/casasmanager.png'
import { useAuth } from '../auth/useAuth'
import {
  APP_ROUTES,
  getCurrentRoutePath,
  getPersonnelDetailsPath,
  getRouteParam,
  navigateTo,
  type AppRoute,
} from '../routes/router'
import { ROLES } from '../auth/types'
import {
  getEmployeeById,
  PERSONNEL_COMPLIANCE_UPDATED_EVENT,
} from '../features/personnel-compliance/complianceService'

type FullLayoutProps = {
  children?: ReactNode
}

type NavItem = { label: string; route: AppRoute }

type ActiveEmployeeNav = {
  id: string
  fullName: string
}

const NAV_MODULES: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Geral',
    items: [{ label: 'Dashboard', route: APP_ROUTES.DASHBOARD }],
  },
  {
    label: 'Inspeção',
    items: [
      { label: 'Ficha de Inspeção', route: APP_ROUTES.INSPECTION },
      { label: 'Histórico', route: APP_ROUTES.HISTORY },
    ],
  },
  {
    label: 'Estoque',
    items: [
      { label: 'Dashboard', route: APP_ROUTES.INVENTORY_DASHBOARD },
      { label: 'Materiais', route: APP_ROUTES.INVENTORY_REGISTRY },
      { label: 'Consumo', route: APP_ROUTES.INVENTORY_LOGS },
    ],
  },
  {
    label: 'Pessoas & Compliance',
    items: [
      { label: 'Dashboard', route: APP_ROUTES.PERSONNEL_DASHBOARD },
      { label: 'Funcionários', route: APP_ROUTES.PERSONNEL_LIST },
    ],
  },
  {
    label: 'Operações',
    items: [
      { label: 'Engenharia', route: APP_ROUTES.ENGINEERING },
      { label: 'Admin', route: APP_ROUTES.ADMIN },
    ],
  },
]

const SIDEBAR_MIN_WIDTH = 240
const SIDEBAR_MAX_WIDTH = 420
const SIDEBAR_DEFAULT_WIDTH = 288

function getExpandedModulesState(pathname: string): Record<string, boolean> {
  const isPersonnelDetails =
    getRouteParam(pathname, APP_ROUTES.PERSONNEL_DETAILS) !== null

  const activeModule = NAV_MODULES.find((module) =>
    module.items.some((item) => item.route === pathname),
  )

  return Object.fromEntries(
    NAV_MODULES.map((module) => {
      const isPersonnelModule = module.label === 'Pessoas & Compliance'
      return [
        module.label,
        module.label === 'Inspeção' ||
          module.label === activeModule?.label ||
          (isPersonnelModule && isPersonnelDetails),
      ]
    }),
  )
}

export function FullLayout({ children }: FullLayoutProps) {
  const { isDark, toggleDarkMode } = useDarkMode()
  const { logout, user } = useAuth()
  const [pathname, setPathname] = useState(getCurrentRoutePath())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH)
  const [activeEmployeeNav, setActiveEmployeeNav] =
    useState<ActiveEmployeeNav | null>(null)
  const [isEmployeeSubmenuOpen, setIsEmployeeSubmenuOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      NAV_MODULES.map((module) => [module.label, module.label === 'Inspeção']),
    ),
  )

  useEffect(() => {
    const onPathChange = () => {
      const currentPath = getCurrentRoutePath()
      setPathname(currentPath)
      setExpandedModules((previous) => ({
        ...previous,
        ...getExpandedModulesState(currentPath),
      }))
      setIsSidebarOpen(false)
    }

    window.addEventListener('hashchange', onPathChange)

    return () => {
      window.removeEventListener('hashchange', onPathChange)
    }
  }, [])

  useEffect(() => {
    const activeEmployeeId = getRouteParam(
      pathname,
      APP_ROUTES.PERSONNEL_DETAILS,
    )

    const timer = window.setTimeout(() => {
      if (!activeEmployeeId) {
        setActiveEmployeeNav(null)
        return
      }

      void getEmployeeById(activeEmployeeId).then((employee) => {
        if (!employee) {
          setActiveEmployeeNav(null)
          return
        }

        setActiveEmployeeNav({ id: employee.id, fullName: employee.fullName })
      })
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [pathname])

  useEffect(() => {
    const reload = () => {
      const activeEmployeeId = getRouteParam(
        pathname,
        APP_ROUTES.PERSONNEL_DETAILS,
      )
      if (!activeEmployeeId) return

      void getEmployeeById(activeEmployeeId).then((employee) => {
        if (!employee) {
          setActiveEmployeeNav(null)
          return
        }

        setActiveEmployeeNav({ id: employee.id, fullName: employee.fullName })
      })
    }

    window.addEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, reload)

    return () => {
      window.removeEventListener(PERSONNEL_COMPLIANCE_UPDATED_EVENT, reload)
    }
  }, [pathname])

  const handleLogout = () => {
    logout()
    navigateTo(APP_ROUTES.LOGIN)
  }

  const handleSidebarResizeStart = () => {
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, event.clientX),
      )

      setSidebarWidth(nextWidth)
    }

    const handleMouseUp = () => {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const layoutStyle = {
    '--sidebar-width': `${sidebarWidth}px`,
  } as CSSProperties

  return (
    <div
      className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900"
      style={layoutStyle}
    >
      <button
        type="button"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-40 rounded-md border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-100 lg:hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        aria-label="Alternar menu lateral"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-label="Fechar menu lateral"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-700 dark:bg-gray-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ width: `var(--sidebar-width)` }}
      >
        <div className="border-b border-gray-200 px-5 py-5 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={casasManagerLogo}
              alt="Casas Manager Logo"
              className="h-10 w-auto object-contain"
            />

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Inspeção Digital
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Troque o papel pela eficiência digital
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sessão atual
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {user?.name} ({user?.role})
          </p>
        </div>

        <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5">
          {NAV_MODULES.map((module) => {
            const isExpanded = expandedModules[module.label]

            return (
              <div
                key={module.label}
                className="rounded-lg border border-gray-200 p-2 dark:border-gray-700"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() =>
                    setExpandedModules((previous) => ({
                      ...previous,
                      [module.label]: !previous[module.label],
                    }))
                  }
                >
                  {module.label}
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-2">
                    {module.items.map((item) => {
                      const isActive = pathname === item.route
                      const isEmployeeBaseItem =
                        item.route === APP_ROUTES.PERSONNEL_LIST &&
                        module.label === 'Pessoas & Compliance'
                      const detailPath = activeEmployeeNav
                        ? getPersonnelDetailsPath(activeEmployeeNav.id)
                        : ''
                      const isEmployeeDetailActive =
                        Boolean(detailPath) && pathname === detailPath

                      if (isEmployeeBaseItem) {
                        return (
                          <div key={item.route} className="space-y-1">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className={`flex-1 rounded-md border px-3 py-2 text-left text-sm transition ${
                                  isActive || isEmployeeDetailActive
                                    ? 'border-blue-600 bg-blue-50 font-medium text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => navigateTo(item.route)}
                              >
                                {item.label}
                              </button>

                              {activeEmployeeNav && (
                                <button
                                  type="button"
                                  className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                  onClick={() =>
                                    setIsEmployeeSubmenuOpen(
                                      (previous) => !previous,
                                    )
                                  }
                                  aria-label="Expandir funcionário selecionado"
                                >
                                  {isEmployeeSubmenuOpen ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronRight size={14} />
                                  )}
                                </button>
                              )}
                            </div>

                            {activeEmployeeNav && isEmployeeSubmenuOpen && (
                              <button
                                type="button"
                                className={`ml-3 w-[calc(100%-0.75rem)] rounded-md border px-3 py-2 text-left text-sm transition ${
                                  isEmployeeDetailActive
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => navigateTo(detailPath)}
                              >
                                {activeEmployeeNav.fullName}
                              </button>
                            )}
                          </div>
                        )
                      }

                      return (
                        <button
                          key={item.route}
                          type="button"
                          className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                            isActive
                              ? 'border-blue-600 bg-blue-50 font-medium text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => navigateTo(item.route)}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-gray-200 px-4 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} />
            )}
            {isDark ? 'Modo claro' : 'Modo escuro'}
          </button>

          <button
            type="button"
            className="w-full rounded-md bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>

        <button
          type="button"
          onMouseDown={handleSidebarResizeStart}
          aria-label="Redimensionar barra lateral"
          className="absolute right-0 top-0 hidden h-full w-1.5 translate-x-1/2 cursor-col-resize border-l border-transparent transition hover:border-blue-400 hover:bg-blue-500/20 lg:block"
        />
      </aside>

      <main className="mx-auto max-w-[2000px] px-6 py-6 pt-20 lg:ml-[var(--sidebar-width)] lg:pt-6">
        <div className="space-y-6">
          {user?.role === ROLES.VIEWER && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-100 p-4 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
              Perfil Viewer: acesso de visualização, sem permissões
              administrativas.
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  )
}
