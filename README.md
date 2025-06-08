StoryHub - Aplikasi Berbagi Cerita

Catatan untuk Reviewer (Penting)
Pengujian PWA: Semua fungsionalitas PWA (installable, offline, app shell) telah diuji dan berfungsi dengan baik pada build produksi/preview aplikasi.

Service Worker di Mode Pengembangan (npm run dev): Untuk stabilitas dan menghindari potensi konflik dengan fitur Hot Module Replacement (HMR) Vite selama pengembangan, Service Worker dinonaktifkan secara default saat menjalankan npm run dev. Ini diatur melalui devOptions: { enabled: false } dalam konfigurasi vite-plugin-pwa di vite.config.js.

Keputusan ini diambil karena terdapat error "ServiceWorker script evaluation failed" saat SW diaktifkan di mode dev dengan konfigurasi injectManifest saat ini. Hal ini tidak mempengaruhi fungsionalitas PWA pada build produksi.

Cara Menguji Fungsionalitas PWA:

Pastikan semua dependensi terinstal: npm install

Buat build produksi aplikasi: npm run build

Sajikan direktori dist yang dihasilkan menggunakan server HTTP statis. Anda bisa menggunakan npm run preview yang disediakan Vite, atau server lain seperti npx serve dist atau npx http-server dist.

Buka aplikasi di browser (Chrome atau Edge direkomendasikan untuk pengujian PWA).

Gunakan Developer Tools (F12) > Tab "Application" untuk memeriksa:

Manifest: Pastikan manifest terbaca dengan benar.

Service Workers: Pastikan sw.js terdaftar, aktif, dan berjalan.

Cache Storage: Periksa cache yang dibuat oleh Workbox (misalnya, workbox-precache, story-api-cache, dll.).

Aktifkan mode "Offline" di DevTools untuk menguji akses offline.

Periksa prompt instalasi PWA di browser.

