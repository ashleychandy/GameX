import { createBrowserRouter } from "react-router-dom";
import React, { lazy } from "react";
import { Layout } from "./components/layout/Layout";
import Loading from "./components/common/Loading";
import { ErrorHandler } from "./components/common/ErrorHandler";

// Lazy loaded components with proper default exports
const HomePage = lazy(() => import("./pages/Home"));
const DiceGamePage = lazy(() => import("./pages/DiceGame"));

// Router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorHandler />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<Loading />}>
            <HomePage />
          </React.Suspense>
        )
      },
      {
        path: "game",
        element: (
          <React.Suspense fallback={<Loading />}>
            <DiceGamePage />
          </React.Suspense>
        )
      }
    ]
  }
]);

// Route metadata
export const routes = {
  '/': {
    title: 'Home',
    description: 'Welcome to GameX',
    icon: 'home'
  },
  '/game': {
    title: 'Dice Game',
    description: 'Play and earn with our provably fair dice game',
    icon: 'casino'
  }
};

export const getRouteMetadata = (path) => routes[path] || routes['/'];
export const getRouteTitle = (path) => getRouteMetadata(path).title;
export const getRouteDescription = (path) => getRouteMetadata(path).description;
export const getRouteIcon = (path) => getRouteMetadata(path).icon;
