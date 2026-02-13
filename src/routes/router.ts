export const APP_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ENGINEERING: '/engineering',
  INSPECTION: '/inspection',
  HISTORY: '/history',
  INVENTORY_DASHBOARD: '/inventory/dashboard',
  INVENTORY_REGISTRY: '/inventory/materials',
  INVENTORY_LOGS: '/inventory/logs',
  PERSONNEL_DASHBOARD: '/personnel/dashboard',
  PERSONNEL_LIST: '/personnel/employees',
} as const

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]

export function getCurrentRoutePath(): string {
  const hash = window.location.hash

  if (!hash) {
    return '/'
  }

  const normalizedHash = hash.startsWith('#') ? hash.slice(1) : hash

  return normalizedHash || '/'
}

export function navigateTo(path: AppRoute): void {
  const currentPath = getCurrentRoutePath()

  if (currentPath === path) {
    return
  }

  window.location.hash = path
}
