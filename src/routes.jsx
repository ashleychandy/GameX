import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { Layout } from "./components/layout/Layout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import Loading from "./components/common/Loading";
import { useWallet } from "./contexts/WalletContext";
import { ErrorHandler } from "./components/common/ErrorHandler";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isConnected, isAdmin } = useWallet();
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/game" replace />;
  }
  
  return children;
};

// Lazy loaded components with proper error handling
const HomePage = lazy(() => 
  import("./pages/HomePage")
    .then(module => ({ default: module.HomePage }))
    .catch(error => {
      console.error("Error loading HomePage:", error);
      return { default: () => <ErrorHandler error={error} /> };
    })
);

const DiceGamePage = lazy(() => 
  import("./pages/DiceGamePage")
    .then(module => ({ default: module.DiceGamePage }))
    .catch(error => {
      console.error("Error loading DiceGamePage:", error);
      return { default: () => <ErrorHandler error={error} /> };
    })
);

const AdminPage = lazy(() => 
  import("./pages/AdminPage")
    .then(module => ({ default: module.AdminPage }))
    .catch(error => {
      console.error("Error loading AdminPage:", error);
      return { default: () => <ErrorHandler error={error} /> };
    })
);

const NotFoundPage = lazy(() => 
  import("./pages/NotFoundPage")
    .then(module => ({ default: module.NotFoundPage }))
    .catch(error => {
      console.error("Error loading NotFoundPage:", error);
      return { default: () => <ErrorHandler error={error} /> };
    })
);

// Loading wrapper component
const PageWrapper = ({ children }) => (
  <Suspense fallback={<Loading />}>
    {children}
  </Suspense>
);

// Router configuration with future flags
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/",
          element: <PageWrapper><HomePage /></PageWrapper>
        },
        {
          path: "/game",
          element: <PageWrapper><DiceGamePage /></PageWrapper>
        },
        {
          path: "/admin",
          element: (
            <PageWrapper>
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            </PageWrapper>
          )
        },
        {
          path: "*",
          element: <PageWrapper><NotFoundPage /></PageWrapper>
        }
      ]
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

// Helper function to get route metadata
export const getRouteMetadata = (pathname) => {
  const routes = {
    "/": { title: "Home" },
    "/game": { title: "Play Game" },
    "/admin": { title: "Admin Panel" },
  };
  return routes[pathname] || { title: "Page Not Found" };
};

export { router };
export default router;
