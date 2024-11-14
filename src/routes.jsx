import React, { lazy, Suspense } from "react";
import { Layout } from "@/components/layout";
import { Loading } from "@/components/common";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

const HomePage = lazy(() => import("@/pages/Home/HomePage"));
const DicePage = lazy(() => import("@/pages/DiceGame"));

const routes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
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
      }
    ],
  },
];

export function getRouteMetadata(pathname) {
  // Example implementation
  const metadata = {
    '/': { title: 'Home' },
    '/dice': { title: 'Dice Game' },
    // Add more routes and their metadata as needed
  };

  return metadata[pathname] || { title: 'Unknown' };
}

export default routes;
