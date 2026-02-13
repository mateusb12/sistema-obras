import type { ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import type { Role } from '../auth/types'
import { APP_ROUTES, navigateTo } from './router'

type PrivateRouteProps = {
  children: ReactNode
  allowedRoles?: Role[]
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, hasRole } = useAuth()

  if (!isAuthenticated) {
    navigateTo(APP_ROUTES.LOGIN)
    return null
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <section className="mx-auto mt-10 max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
        <h2 className="text-xl font-bold">Acesso negado</h2>
        <p className="mt-2 text-sm">
          Seu perfil não possui permissão para esta página.
        </p>
      </section>
    )
  }

  return children
}
