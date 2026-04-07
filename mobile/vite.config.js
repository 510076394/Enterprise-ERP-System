import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    basicSsl() // 自动生成自签名证书
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3100,
    host: '0.0.0.0',
    hmr: {
      port: 3101, // 使用不同的端口避免冲突
      host: 'localhost',
      protocol: 'wss' // 使用 WSS 而不是 WS
    },
    // 禁用缓存
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    proxy: {
      '/api': {
        target: process.env.VITE_APP_API_BASE_URL || 'http://192.168.2.151:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;`,
        silenceDeprecations: ['legacy-js-api', 'import']
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
  },
});