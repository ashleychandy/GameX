import { createBrowserRouter } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { Loading } from "./components/common/Loading";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const DiceGame = lazy(() => import("./pages/DiceGame"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Route metadata
export const routeMetadata = {
  '/': {
    title: 'Home',
    description: 'Welcome to GameX Platform'
  },
  '/game': {
    title: 'Dice Game',
    description: 'Play the GameX Dice Game'
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
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        )
      },
      {
        path: "game",
        element: (
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <DiceGame />
            </ProtectedRoute>
          </Suspense>
        )
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<Loading />}>
            <NotFoundPage />
          </Suspense>
        )
      }
    ]
  }
]);
