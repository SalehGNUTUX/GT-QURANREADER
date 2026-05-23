import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'fonts/*'],
      manifest: {
        name: 'GT Quran Reader',
        short_name: 'القرآن',
        description: 'عارض القرآن الكريم - PWA',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // الملفات الأساسية تُسبَق-تُكاش.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,otf}'],
        // صور المصاحف والصوت — CacheFirst بحدود.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname === 'raw.githubusercontent.com' && url.pathname.endsWith('.png'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-pages-images',
              expiration: {
                maxEntries: 700,
                maxAgeSeconds: 60 * 60 * 24 * 365, // سنة
              },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'everyayah.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-verse-audio',
              expiration: {
                maxEntries: 6300, // إجمالي الآيات
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'server8.mp3quran.net',
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-full-surah-audio',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'api.alquran.cloud',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'quran-text-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
});
