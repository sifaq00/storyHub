// src/pages/NotFoundPage.js
import { navigateTo } from "../App.js";

export default class NotFoundPage {
  constructor() {
    // Tidak ada state khusus yang diperlukan untuk halaman ini
  }

  afterRender() {
    // Tambahkan event listener untuk tombol kembali
    document.getElementById('back-home-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/');
    });

    document.querySelectorAll('[data-navigate]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.getAttribute('href').substring(1);
            navigateTo(path);
        });
    });
  }

  render() {
    const page = document.createElement('main');
    page.id = 'main-content';
    page.tabIndex = -1;
    page.className = 'flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-50 px-4 sm:px-6 lg:px-8';

    page.innerHTML = `
      <div class="text-center">
        <div class="mb-4">
          <i class="fas fa-compass text-6xl text-blue-300"></i>
        </div>
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">404</h1>
        <h2 class="mt-2 text-2xl sm:text-3xl font-semibold text-gray-700">Halaman Tidak Ditemukan</h2>
        <p class="mt-4 max-w-md mx-auto text-base text-gray-500">
          Oops! Sepertinya Anda tersesat. Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div class="mt-8">
          <a href="#/" data-navigate id="back-home-btn" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
            <i class="fas fa-home mr-2"></i>
            Kembali ke Beranda
          </a>
        </div>
      </div>
    `;

    return page;
  }
}
