import { useEffect, useMemo, useState } from 'react'
import { FullLayout } from './components'
import { DummyLoginPage } from './components/DummyLoginPage'
import { PrivateRoute } from './routes/PrivateRoute'
import {
  APP_ROUTES,
  getCurrentRoutePath,
  getRouteParam,
  navigateTo,
} from './routes/router'
import { ROLES } from './auth/types'
import { AdminPanel, EngineeringPanel } from './pages/RolePanels'
import { useAuth } from './auth/useAuth'
import { InspectionPage } from './features/site-inspection-report'
import { HistoryPage } from './features/inspection-history'
import { ExecutiveDashboardPage } from './features/executive-dashboard'
import {
  ConsumptionLogPage,
  InventoryDashboard,
  MaterialRegistry,
} from './features/material-inventory'
import {
  ComplianceDashboard,
  EmployeeDetails,
  EmployeeList,
} from './features/personnel-compliance'

function App() {
  const { isAuthenticated } = useAuth()
  const [pathname, setPathname] = useState(getCurrentRoutePath())

  useEffect(() => {
    const onPathChange = () => {
      setPathname(getCurrentRoutePath())
    }

    window.addEventListener('hashchange', onPathChange)

    return () => {
      window.removeEventListener('hashchange', onPathChange)
    }
  }, [])

  useEffect(() => {
    if (pathname === '/') {
      navigateTo(isAuthenticated ? APP_ROUTES.DASHBOARD : APP_ROUTES.LOGIN)
    }
  }, [isAuthenticated, pathname])

  const currentScreen = useMemo(() => {
    if (pathname === APP_ROUTES.LOGIN) {
      return <DummyLoginPage />
    }

    if (pathname === APP_ROUTES.ADMIN) {
      return (
        <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
          <FullLayout currentRoute={pathname}>
            <AdminPanel />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.ENGINEERING) {
      return (
        <PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.ENGINEER]}>
          <FullLayout currentRoute={pathname}>
            <EngineeringPanel />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.DASHBOARD) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <ExecutiveDashboardPage />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.INSPECTION) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <InspectionPage />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.HISTORY) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <HistoryPage />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.INVENTORY_DASHBOARD) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <InventoryDashboard />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.INVENTORY_REGISTRY) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <MaterialRegistry />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.INVENTORY_LOGS) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <ConsumptionLogPage />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.PERSONNEL_DASHBOARD) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <ComplianceDashboard />
          </FullLayout>
        </PrivateRoute>
      )
    }

    const employeeId = getRouteParam(pathname, APP_ROUTES.PERSONNEL_DETAILS)
    if (employeeId) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <EmployeeDetails employeeId={employeeId} />
          </FullLayout>
        </PrivateRoute>
      )
    }

    if (pathname === APP_ROUTES.PERSONNEL_LIST) {
      return (
        <PrivateRoute>
          <FullLayout currentRoute={pathname}>
            <EmployeeList />
          </FullLayout>
        </PrivateRoute>
      )
    }

    return (
      <section className="mx-auto mt-10 max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-semibold">Página não encontrada</h2>
      </section>
    )
  }, [pathname])

  return currentScreen
}

export default App
