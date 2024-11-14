import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/Home';
import { DicePage } from '@/pages/DiceGame';
import { AdminPage } from '@/pages/Admin';

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
        path: 'play',
        element: <DicePage />
      },
      {
        path: 'admin',
        element: <AdminPage />
      }
    ]
  }
]); 