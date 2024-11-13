import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Loading } from "./components/common/Loading";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { NotFoundPage } from "./pages/NotFoundPage";

// Lazy loaded components
const HomePage = lazy(() => import("./pages/HomePage"));
const DicePage = lazy(() => import("./pages/DicePage"));

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
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <DicePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

// Route metadata helper
export function getRouteMetadata(pathname) {
  const metadata = {
    '/': { title: 'Home' },
    '/dice': { title: 'Dice Game' },
  };
  return metadata[pathname] || { title: 'Unknown' };
} 