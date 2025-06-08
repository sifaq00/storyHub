import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },

  css: {
    postcss: {
      plugins: [
        tailwindcss(), 
        autoprefixer()
      ]
    }
  },

  optimizeDeps: {
    include: ['tailwindcss']
  },

  plugins: [
    VitePWA({
      strategies: 'injectManifest', 
      srcDir: 'src',                
      filename: 'sw.js',            

      manifest: {
        name: 'Bagikan Ceritamu',
        short_name: 'StoryHub',
        description: 'Platform untuk berbagi cerita dan menginspirasi dunia.',
        theme_color: '#ffffff',        
        background_color: '#ffffff',  
        display: 'standalone',        
        scope: '/',                   
        start_url: '/',              
        icons: [
          { src: 'icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],

        shortcuts: [
          {
            "name": "Tambah Cerita Baru",
            "short_name": "Cerita Baru",
            "description": "Membuka halaman untuk membuat cerita baru",
            "url": "/#/post-story", // URL lengkap termasuk hash untuk membuka halaman tambah cerita
            "icons": [{ "src": "/icons/icon-add.png", "sizes": "96x96" }] // Ganti dengan path ikon shortcut Anda
          }
        ],

        screenshots: [
          {
            "src": "/screenshots/Screenshot-desktop2.png", // Path ke screenshot desktop Anda
            "type": "image/png",
            "sizes": "1433x817", // Sesuaikan dengan ukuran screenshot Anda
            "form_factor": "wide" // Menandakan ini untuk layar lebar
          },
          {
            "src": "/screenshots/Screenshot-mobile.png", // Path ke screenshot mobile Anda
            "type": "image/png",
            "sizes": "417x828", // Sesuaikan dengan ukuran screenshot Anda
            "form_factor": "narrow" // Menandakan ini untuk layar sempit
          }
        ]
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2,ttf,eot}'],
      },

      registerType: 'autoUpdate', 
      
      devOptions: {
        enabled: false, 
        type: 'module', 
      },
    }),
  ],
  publicDir: 'public'
});