import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawApiUrl = env.VITE_PROXY_TARGET || env.VITE_APP_API_URL || ''

  let proxyTarget = 'http://localhost:3001'
  if (rawApiUrl.startsWith('http')) {
    try {
      const url = new URL(rawApiUrl)
      proxyTarget = url.origin
    } catch {
      // ignore
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  }
})