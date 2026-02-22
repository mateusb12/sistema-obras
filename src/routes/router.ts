export const APP_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ENGINEERING: '/engineering',
  INSPECTION: '/inspection',
  HISTORY: '/history',
  CORRECTIONS: '/correcoes',
  INVENTORY_DASHBOARD: '/inventory/dashboard',
  INVENTORY_REGISTRY: '/inventory/materials',
  INVENTORY_LOGS: '/inventory/logs',
  PERSONNEL_DASHBOARD: '/personnel/dashboard',
  PERSONNEL_LIST: '/personnel/employees',
  PERSONNEL_DETAILS: '/personnel/employees/:id',
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

export function navigateTo(path: string): void {
  const currentPath = getCurrentRoutePath()

  if (currentPath === path) {
    return
  }

  window.location.hash = path
}

export function getPersonnelDetailsPath(employeeId: string): string {
  return `/personnel/employees/${employeeId}`
}

export function getRouteParam(
  pathname: string,
  pattern: string,
): string | null {
  const [basePath] = pattern.split('/:')

  if (!pathname.startsWith(`${basePath}/`)) {
    return null
  }

  const param = pathname.slice(basePath.length + 1)
  return param || null
}
