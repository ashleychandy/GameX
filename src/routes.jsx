import { createBrowserRouter } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { Layout } from "./components/layout/Layout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import Loading from "./components/common/Loading";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const DiceGamePage = lazy(() => import("./pages/DiceGame"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PageWrapper = ({ children }) => (
  <Suspense fallback={<Loading />}>
    {children}
  </Suspense>
);

// Route metadata configuration
const routeMetadata = {
  '/': {
    title: 'Home',
    description: 'Welcome to GameX Platform'
  },
  '/game': {
    title: 'Dice Game',
    description: 'Play the GameX Dice Game'
  },
  '/admin': {
    title: 'Admin Dashboard',
    description: 'GameX Platform Administration'
  }
};

export const getRouteMetadata = (pathname) => {
  return routeMetadata[pathname] || {
    title: 'Page Not Found',
    description: 'The requested page could not be found'
  };
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <PageWrapper><HomePage /></PageWrapper>
      },
      {
        path: "game",
        element: (
          <PageWrapper>
            <ProtectedRoute>
              <DiceGamePage />
            </ProtectedRoute>
          </PageWrapper>
        )
      },
      {
        path: "admin",
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
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorBehavior: true
  }
});
