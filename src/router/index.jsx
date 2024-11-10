import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '../components/layout/Layout';
import { ErrorFallback } from '../components/common/ErrorFallback';
import { Loading } from '../components/common/Loading';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage'));
const DiceGame = lazy(() => import('../pages/DiceGame'));
const AdminPanel = lazy(() => import('../components/admin/AdminPanel'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
        errorElement: <ErrorFallback />
      },
      {
        path: 'game',
        element: (
          <Suspense fallback={<Loading />}>
            <DiceGame />
          </Suspense>
        ),
        errorElement: <ErrorFallback />,
        loader: async () => {
          // Add any necessary data loading here
          return null;
        },
        shouldRevalidate: ({ currentUrl }) => {
          return currentUrl.pathname === '/game';
        }
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminPanel />
          </Suspense>
        ),
        errorElement: <ErrorFallback />
      }
    ]
  }
]); 