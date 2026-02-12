const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export const APP_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ENGINEERING: '/engineering',
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`.replace(/\/+/g, '/');
}

export function getCurrentRoutePath(): string {
  const pathname = window.location.pathname;

  if (!BASE_PATH || BASE_PATH === '/') {
    return pathname;
  }

  if (pathname.startsWith(BASE_PATH)) {
    const normalized = pathname.slice(BASE_PATH.length);
    return normalized || '/';
  }

  return pathname;
}

export function navigateTo(path: AppRoute): void {
  const fullPath = withBasePath(path);

  if (window.location.pathname === fullPath) {
    return;
  }

  window.history.pushState({}, '', fullPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
