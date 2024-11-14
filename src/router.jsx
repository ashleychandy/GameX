import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Loading, ProtectedRoute, ErrorBoundary } from "@/components/common";
import { NotFoundPage } from "@/pages/NotFound/NotFoundPage";

// Lazy loaded components
const HomePage = lazy(() => import("@/pages/Home/HomePage"));
const DicePage = lazy(() => import("@/pages/DiceGame"));
const AdminPage = lazy(() => import("@/pages/Admin/AdminPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "dice",
        element: (
          <ErrorBoundary>
            <ProtectedRoute>
              <Suspense fallback={<Loading />}>
                <DicePage />
              </Suspense>
            </ProtectedRoute>
          </ErrorBoundary>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly>
            <Suspense fallback={<Loading />}>
              <AdminPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        ),
      }
    ],
  },
]);

// Route metadata helper
export const ROUTE_METADATA = {
  '/': { title: 'Home' },
  '/dice': { title: 'Dice Game' },
  '/admin': { title: 'Admin Dashboard' },
  '/profile': { title: 'Profile' },
};

export function getRouteMetadata(pathname) {
  return ROUTE_METADATA[pathname] || { title: 'Unknown' };
} 