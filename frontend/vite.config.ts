import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // manualChunks: {
        //   // Vendor chunks
        //   'react-vendor': ['react', 'react-dom'],
        //   'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
        //   'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        //   'state-vendor': ['zustand'],
        // },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging (disabled in prod)
    sourcemap: false,
    // Minification settings
    minify: 'esbuild',
    target: 'esnext',
  },
  // Optimize dev server
  server: {
    hmr: true,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'lucide-react'],
  },
})
