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
        crypto: 'crypto-browserify'
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
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  }
})
