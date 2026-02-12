import { useEffect, useMemo, useState } from "react";
import { FullLayout } from "./components";
import { DummyLoginPage } from "./components/DummyLoginPage";
import { PrivateRoute } from "./routes/PrivateRoute";
import { APP_ROUTES, getCurrentRoutePath, navigateTo } from "./routes/router";
import { ROLES } from "./auth/types";
import { AdminPanel, EngineeringPanel } from "./pages/RolePanels";
import { useAuth } from "./auth/useAuth";

function App() {
  const { isAuthenticated } = useAuth();
  const [pathname, setPathname] = useState(getCurrentRoutePath());

  useEffect(() => {
    const onPathChange = () => {
      setPathname(getCurrentRoutePath());
    };

    window.addEventListener("popstate", onPathChange);

    return () => {
      window.removeEventListener("popstate", onPathChange);
    };
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      navigateTo(isAuthenticated ? APP_ROUTES.DASHBOARD : APP_ROUTES.LOGIN);
    }
  }, [isAuthenticated, pathname]);

  const currentScreen = useMemo(() => {
    if (pathname === APP_ROUTES.LOGIN) {
      return <DummyLoginPage />;
    }

    if (pathname === APP_ROUTES.ADMIN) {
      return (
        <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
          <FullLayout>
            <AdminPanel />
          </FullLayout>
        </PrivateRoute>
      );
    }

    if (pathname === APP_ROUTES.ENGINEERING) {
      return (
        <PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.ENGINEER]}>
          <FullLayout>
            <EngineeringPanel />
          </FullLayout>
        </PrivateRoute>
      );
    }

    if (pathname === APP_ROUTES.DASHBOARD) {
      return (
        <PrivateRoute>
          <FullLayout />
        </PrivateRoute>
      );
    }

    return (
      <section className="mx-auto mt-10 max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-semibold">Página não encontrada</h2>
      </section>
    );
  }, [pathname]);

  return currentScreen;
}

export default App;
