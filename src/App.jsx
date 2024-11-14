import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProviders } from '@/contexts';
import { router } from './router';
import { Loading } from '@/components/common/Loading';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <AppProviders>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AppProviders>
  );
} 