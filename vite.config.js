import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        process: 'process/browser',
        buffer: 'buffer',
        util: 'util',
        stream: 'stream-browserify',
        crypto: 'crypto-browserify',
        '@assets': resolve(__dirname, 'src/assets')
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    define: {
      'process.env': env,
      global: 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      },
      include: ['buffer', 'process/browser']
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'framer-motion', 'styled-components'],
          },
        },
      },
      sourcemap: true,
    },
    server: {
      port: 3000,
      open: true
    },
    assetsInclude: ['**/*.svg']
  }
})
