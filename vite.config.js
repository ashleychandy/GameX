import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    envPrefix: [
      'VITE_',
      'CHAIN_LINK_',
      'MINTER_',
      'BURNER_'
    ],
    define: {
      'process.env': env
    },
    server: {
      port: 3000,
      open: true,
      historyApiFallback: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    }
  };
});
