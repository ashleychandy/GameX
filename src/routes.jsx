import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { Layout } from "./components/layout/Layout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import Loading from "./components/common/Loading";
import { useWallet } from "./contexts/WalletContext";
import { GAME_CONFIG } from "./utils/constants";
import { ErrorHandler } from "./components/common/ErrorHandler";

// Modify ProtectedRoute to only protect specific actions rather than entire pages
const ProtectedRoute = ({ children, requireAdmin, requireAuth }) => {
  const { isConnected, isAdmin } = useWallet();
  const location = useLocation();

  // Only protect admin routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/game" replace />;
  }

  // For auth-required routes, render children but components will handle connection state
  return children;
};

// Lazy loaded components
const HomePage = lazy(() => import("./pages/HomePage").then(module => ({ default: module.HomePage })));
const DiceGamePage = lazy(() => import("./pages/DiceGamePage").then(module => ({ default: module.DiceGamePage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then(module => ({ default: module.AdminPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(module => ({ default: module.NotFoundPage })));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage").then(module => ({ default: module.LeaderboardPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then(module => ({ default: module.ProfilePage })));

// Enhanced loading wrapper with error boundary
const PageWrapper = ({ children, title }) => (
  <ErrorBoundary fallback={<ErrorHandler />}>
    <Suspense fallback={<Loading message={`Loading ${title}...`} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Route configuration with metadata
export const routeConfig = {
  home: {
    path: "/",
    title: "Home",
    requiresAuth: false,
    element: <HomePage />,
  },
  game: {
    path: "/game",
    title: "Play Game",
    requiresAuth: true,
    element: <DiceGamePage />,
  },
  admin: {
    path: "/admin",
    title: "Admin Panel",
    requiresAuth: true,
    requireAdmin: true,
    element: <AdminPage />,
  },
  leaderboard: {
    path: "/leaderboard",
    title: "Leaderboard",
    requiresAuth: false,
    element: <LeaderboardPage />,
  },
  profile: {
    path: "/profile/:address",
    title: "Player Profile",
    requiresAuth: false,
    element: <ProfilePage />,
  },
};

// Build route definitions
const buildRoutes = () => {
  const routes = [];

  Object.entries(routeConfig).forEach(([key, config]) => {
    const route = {
      path: config.path,
      element: (
        <PageWrapper title={config.title}>
          {config.requiresAuth ? (
            <ProtectedRoute
              requireAuth={config.requiresAuth}
              requireAdmin={config.requireAdmin}
            >
              {config.element}
            </ProtectedRoute>
          ) : (
            config.element
          )}
        </PageWrapper>
      ),
      meta: {
        title: config.title,
        requiresAuth: config.requiresAuth,
        requireAdmin: config.requireAdmin,
      },
    };

    routes.push(route);
  });

  // Add catch-all route
  routes.push({
    path: "*",
    element: (
      <PageWrapper title="Not Found">
        <NotFoundPage />
      </PageWrapper>
    ),
    meta: {
      title: "Page Not Found",
    },
  });

  return routes;
};

// Create router configuration
const routerConfig = {
  path: "/",
  element: <Layout />,
  errorElement: <ErrorBoundary />,
  children: buildRoutes(),
};

// Create and export router instance
export const router = createBrowserRouter([routerConfig], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

// Route metadata helper
export const getRouteMetadata = (pathname) => {
  const findMeta = (routes, path) => {
    for (const route of routes) {
      if (route.path === path) return route.meta;
      if (route.children) {
        const childMeta = findMeta(route.children, path);
        if (childMeta) return childMeta;
      }
    }
    return null;
  };

  return findMeta([routerConfig], pathname) || {};
};

// Route path constants
export const ROUTES = Object.fromEntries(
  Object.entries(routeConfig).map(([key, config]) => [
    key.toUpperCase(),
    config.path,
  ])
);

// Route utilities
export const RouteUtils = {
  generateProfilePath: (address) => `/profile/${address}`,
  isProtectedRoute: (pathname) => {
    const metadata = getRouteMetadata(pathname);
    return metadata.requiresAuth || metadata.requireAdmin;
  },
};

// Remove duplicate ProtectedRoute definition
export default router;
