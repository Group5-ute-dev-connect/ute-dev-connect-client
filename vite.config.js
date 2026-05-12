import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load biến từ .env
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL;
  
  let proxyTarget = 'http://localhost:5000';
  let proxyPath = '/api';
  
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      proxyTarget = `${url.protocol}//${url.host}`;
      proxyPath = url.pathname;
    } catch (e) {
      console.warn("Lỗi parse VITE_API_URL trong cấu hình proxy");
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        [proxyPath]: {
          target: proxyTarget,
          changeOrigin: true,
        }
      }
    }
  }
})