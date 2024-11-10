import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { HomePage } from '../pages/HomePage';
import { DiceGamePage } from '../pages/DiceGamePage';
import { AdminPage } from '../pages/AdminPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'game',
        element: <DiceGamePage />
      },
      {
        path: 'admin',
        element: <AdminPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]); 