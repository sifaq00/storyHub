import { navigateTo } from '../App.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HomeModel from '../models/HomeModel.js';
import HomePresenter from '../presenters/HomePresenter.js';
import Footer from '../components/Footer.js';
import { clearAllData } from '../utils/indexedDB-helper.js';

export default class HomePage {
  constructor() {
    this.state = {
      stories: [], loading: true, error: null, currentDateTime: this.getCurrentDateTime(),
      showScrollButton: false, currentPage: 1, totalStories: 0, pageSize: 18,
      location: 0, dataFromCache: false,
    };
    this.presenter = new HomePresenter(this, new HomeModel(), navigateTo);
    this.storiesLoaded = false;
    this.bindMethods();
  }

  bindMethods() {
    this.scrollToTop = this.scrollToTop.bind(this);
    this.render = this.render.bind(this);
    this.updateDateTime = this.updateDateTime.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleClearOfflineData = this.handleClearOfflineData.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }

  getCurrentDateTime() {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  }

  updateDateTime() {
    this.state.currentDateTime = this.getCurrentDateTime();
    const dateTimeElement = document.getElementById('current-datetime');
    if (dateTimeElement) {
      dateTimeElement.innerHTML = this.getDateTimeHTML();
    }
  }

  getDateTimeHTML() {
    return `
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="flex items-center gap-1 text-blue-600">
          <i class="fas fa-calendar-day text-xs sm:text-sm"></i>
          <span class="text-xs sm:text-sm font-medium">${this.state.currentDateTime.date}</span>
        </div>
        <div class="w-px h-4 sm:h-5 bg-gray-300"></div>
        <div class="flex items-center gap-1 text-blue-600">
          <i class="fas fa-clock text-xs sm:text-sm"></i>
          <span class="text-xs sm:text-sm font-medium">${this.state.currentDateTime.time}</span>
        </div>
      </div>
    `;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  handleScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const shouldShow = scrollPosition > 300;
    if (shouldShow !== this.state.showScrollButton) {
      this.state.showScrollButton = shouldShow;
      const scrollButton = document.getElementById('scroll-to-top');
      if (scrollButton) {
        scrollButton.classList.toggle('opacity-0', !shouldShow);
        scrollButton.classList.toggle('translate-y-4', !shouldShow);
        scrollButton.classList.toggle('pointer-events-none', !shouldShow);
      }
    }
  }

  showLoading() {
    this.state.loading = true;
    this.updateView();
  }

  showError(msg) {
    this.state.error = msg;
    this.state.loading = false;
    this.updateView();
  }

  showStories(stories, page, total, fromCache) {
    this.state = { ...this.state, stories, loading: false, error: null, currentPage: page, totalStories: total, dataFromCache: fromCache };
    this.updateView();
  }

  showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container-main');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container-main';
      toastContainer.className = 'fixed bottom-5 right-5 z-[9999] space-y-3 w-auto max-w-md';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-600',
      error: 'bg-rose-600',
      warning: 'bg-amber-500',
      info: 'bg-blue-600'
    };
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    }

    toast.className = `text-white px-4 py-3 rounded-lg shadow-xl flex items-center justify-between transform transition-all duration-300 ${colors[type]} animate-fadeInUp`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${icons[type]} mr-3 text-lg"></i>
        <span class="text-sm">${message}</span>
      </div>
      <button class="ml-4 text-white/80 hover:text-white text-lg">
        <i class="fas fa-times"></i>
      </button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.classList.remove('animate-fadeInUp');
      toast.classList.add('opacity-0', 'scale-95');
      setTimeout(() => toast.remove(), 300);
    });
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('animate-fadeInUp');
      toast.classList.add('opacity-0', 'scale-95');
      setTimeout(() => { 
        if (toast.parentNode === toastContainer) {
            toast.remove();
        }
        if (toastContainer.children.length === 0) {
            toastContainer.remove();
        }
    }, 300);
    }, 5000);
  }

  async handleClearOfflineData() {
    const confirmClear = window.confirm("Apakah Anda yakin ingin menghapus semua data cerita yang tersimpan offline (termasuk cache API)?");
    if (!confirmClear) return;
    
    this.showToast('Menghapus data offline...', 'info');
    try {
      await clearAllData();
      console.log('[HomePage] Data IndexedDB dihapus.');

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_API_CACHES' });
        console.log('[HomePage] Pesan untuk menghapus cache API dikirim ke Service Worker.');
      }

      this.showToast('Semua data offline berhasil dihapus.', 'success');
      
      this.state.stories = [];
      this.state.dataFromCache = false;
      this.storiesLoaded = false;
      this.presenter.loadStories(1, this.state.pageSize, this.state.location);
    } catch (error) {
      console.error('Gagal menghapus data offline:', error);
      this.showToast('Gagal menghapus data offline.', 'error');
    }
  }

  handlePageClick(e) {
    e.preventDefault();
    const target = e.target.closest('.pagination-btn'); 
    if (!target) return;

    const page = parseInt(e.target.dataset.page, 10);
    if (!isNaN(page) && page !== this.state.currentPage) {
      this.presenter.loadStories(page, this.state.pageSize, this.state.location);
    }
  }

  handleSaveClick(event) {
    const saveButton = event.target.closest('.save-story-btn');
    if (saveButton) {
      event.preventDefault();
      event.stopPropagation();
      
      const storyId = saveButton.dataset.id;
      const storyToSave = this.state.stories.find(story => story.id === storyId);
      
      if (storyToSave) {
        this.presenter.saveStoryForOffline(storyToSave);
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-check"></i>';
      }
    }
  }

  afterRender() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        disable: window.innerWidth < 640
      });
    }

    this.datetimeInterval = setInterval(this.updateDateTime, 60000);
    window.addEventListener('scroll', this.handleScroll);

    const scrollToTopBtn = document.querySelector('#scroll-to-top');
    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener('click', this.scrollToTop);
    }
    
    const storiesGrid = document.querySelector('.stories-grid');
    if (storiesGrid) {
      storiesGrid.addEventListener('click', this.handleSaveClick);
    }

    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        if (e.target.closest('.save-story-btn')) {
          return;
        }
        e.preventDefault();
        const path = link.getAttribute('href').substring(1);
        this.presenter.navigateTo(path);
      });
    });

    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', this.handlePageClick);
    });

    const filterLocation = document.getElementById('filter-location');
    if (filterLocation) {
      filterLocation.value = this.state.location;
      filterLocation.addEventListener('change', (e) => {
        this.state.location = e.target.checked ? 1 : 0;
        this.presenter.loadStories(1, this.state.pageSize, this.state.location);
      });
    }

    const clearDataBtn = document.getElementById('clear-offline-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', this.handleClearOfflineData);
    }

    if (!this.storiesLoaded && this.state.stories.length === 0 && !this.state.error) {
      this.storiesLoaded = true;
      this.presenter.loadStories(1, this.state.pageSize, this.state.location);
    }
  }

  cleanup() {
    if (this.datetimeInterval) {
      clearInterval(this.datetimeInterval);
    }
    window.removeEventListener('scroll', this.handleScroll);
    const storiesGrid = document.querySelector('.stories-grid');
    if (storiesGrid) {
      storiesGrid.removeEventListener('click', this.handleSaveClick);
    }
  }

  updateView() {
    const oldMain = document.getElementById('main-content');
    const newMain = this.render();
    if (oldMain && newMain) {
        oldMain.parentNode.replaceChild(newMain, oldMain);
        this.afterRender();
    } else if (newMain && !oldMain) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            const currentMain = appContainer.querySelector('#main-content');
            if (currentMain) currentMain.remove();
            
            appContainer.appendChild(newMain);
            this.afterRender();
        }
    }
  }

  render() {
    const page = document.createElement('main');
    page.id = 'main-content'; 
    page.tabIndex = -1;
    page.className = 'flex flex-col min-h-screen';

    if (this.state.loading) {
      page.innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
          ${LoadingSpinner({ size: 'lg' }).outerHTML}
        </div>
      `;
      return page;
    }

    if (this.state.error) {
      page.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center text-center p-6 bg-gray-50">
          <div class="bg-red-50 text-red-700 p-6 rounded-xl shadow-md border border-red-200 max-w-lg w-full">
            <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
            <h2 class="text-xl font-semibold mb-2">Oops, Terjadi Kesalahan</h2>
            <p class="mb-4">${this.state.error}</p>
            ${this.state.error.toLowerCase().includes('login') ? 
              `<a href="#/login" data-navigate class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Login di Sini</a>` :
              `<button onclick="location.reload()" class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Coba Lagi</button>`
            }
          </div>
        </div>
      `;
      page.appendChild(Footer());
      return page;
    }

    let paginationHTML = '';
    const hasNext = this.state.stories.length === this.state.pageSize && (this.state.currentPage * this.state.pageSize < this.state.totalStories);
    const hasPrev = this.state.currentPage > 1;
    const currentPage = this.state.currentPage;
    
    const totalPages = this.state.totalStories > 0 && !this.state.dataFromCache ? Math.ceil(this.state.totalStories / this.state.pageSize) : currentPage + (hasNext ? 1 : 0);

    let pageNumbers = [];
    const pageWindow = 2;

    if (totalPages > 1) {
        let startPage = Math.max(1, currentPage - pageWindow);
        let endPage = Math.min(totalPages, currentPage + pageWindow);

        if (currentPage - 1 <= pageWindow) {
            endPage = Math.min(totalPages, 1 + pageWindow * 2);
        }
        if (totalPages - currentPage <= pageWindow) {
            startPage = Math.max(1, totalPages - pageWindow * 2);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
    } else if (totalPages === 1 && this.state.stories.length > 0) {
        pageNumbers.push(1);
    }

    if (totalPages > 1 || (hasPrev || hasNext)) {
      paginationHTML = `
        <div class="flex justify-center items-center mt-8 sm:mt-12 gap-1 sm:gap-2 flex-wrap px-4">
          ${hasPrev ? `
            <button
              class="pagination-btn inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-gray-300 text-xs sm:text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              data-page="${currentPage - 1}"
              aria-label="Halaman sebelumnya"
            >
              <i class="fas fa-chevron-left mr-1 sm:mr-2"></i> Prev
            </button>
          ` : `
            <span class="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-gray-200 text-xs sm:text-sm font-medium bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
              <i class="fas fa-chevron-left mr-1 sm:mr-2"></i> Prev
            </span>
          `}
          ${pageNumbers.map(i => `
            <button
              class="pagination-btn inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border text-xs sm:text-sm font-medium ${i === currentPage
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'} rounded-lg transition-colors"
              data-page="${i}"
              aria-label="Halaman ${i}"
              ${i === currentPage ? 'aria-current="page"' : ''}
            >
              ${i}
            </button>
          `).join('')}
          ${hasNext ? `
            <button
              class="pagination-btn inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-gray-300 text-xs sm:text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              data-page="${currentPage + 1}"
              aria-label="Halaman berikutnya"
            >
              Next <i class="fas fa-chevron-right ml-1 sm:ml-2"></i>
            </button>
          ` : `
            <span class="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-gray-200 text-xs sm:text-sm font-medium bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
              Next <i class="fas fa-chevron-right ml-1 sm:ml-2"></i>
            </span>
          `}
        </div>
      `;
    }

    page.innerHTML = `
      <div class="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-book-open text-blue-500"></i>
            StoryHub
          </h1>
          <div id="current-datetime" class="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200 w-full sm:w-auto text-gray-700">
            ${this.getDateTimeHTML()}
          </div>
        </div>
        <div class="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label class="flex items-center gap-2 text-sm text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" id="filter-location" class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" ${this.state.location === 1 ? 'checked' : ''} />
            Tampilkan cerita dengan lokasi saja
          </label>
          <button id="clear-offline-data-btn" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow hover:shadow-md transition-all flex items-center gap-2">
            <i class="fas fa-trash-alt"></i> Hapus Data Offline
          </button>
        </div>
        ${this.state.dataFromCache ? `
          <div class="mb-6 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-lg shadow-sm" role="alert">
            <div class="flex items-center">
              <i class="fas fa-info-circle mr-2"></i>
              <p class="text-sm">Anda sedang melihat data yang disimpan secara offline. Beberapa fitur mungkin terbatas.</p>
            </div>
          </div>
        ` : ''}
        
        <div class="relative rounded-xl sm:rounded-2xl overflow-hidden mb-8 sm:mb-12 h-48 sm:h-64 md:h-80" data-aos="fade-in">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 opacity-90"></div>
          <div class="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Temukan Cerita Menakjubkan
            </h1>
            <p class="text-blue-50 max-w-2xl text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
              Jelajahi koleksi cerita inspiratif dari komunitas kami
            </p>
            <a 
              href="#/post-story" 
              data-navigate
              class="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300 text-sm sm:text-base"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <i class="fas fa-plus"></i>
              Bagikan Ceritamu
            </a>
          </div>
        </div>
        <div class="mb-8 sm:mb-12">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2" data-aos="fade-up">
              <i class="fas fa-clock-rotate-left text-blue-500"></i>
              Cerita Terbaru
            </h2>
            <div class="text-xs sm:text-sm text-gray-500 flex items-center gap-1" data-aos="fade-up">
              <i class="fas fa-circle-info"></i>
              ${this.state.stories.length > 0 ? `${this.state.stories.length} cerita ditampilkan` : 'Belum ada cerita'}
              ${this.state.totalStories > 0 && !this.state.dataFromCache ? ` (Total ${this.state.totalStories})` : ''}
            </div>
          </div>
          
          ${this.state.stories.length === 0 ? `
            <div class="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl border border-gray-200" data-aos="fade-up">
              <i class="fas fa-book text-3xl sm:text-4xl text-gray-300 mb-3 sm:mb-4"></i>
              <p class="text-gray-500 text-base sm:text-lg">Belum ada cerita tersedia. Jadilah yang pertama berbagi!</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stories-grid" style="grid-auto-rows: 1fr;">
              ${this.state.stories.map((story, index) => {
                const storyDate = new Date(story.createdAt).toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const imageOnErrorScript = `this.onerror=null; this.src='https://placehold.co/600x400/e2e8f0/94a3b8?text=Gambar+Rusak'; this.classList.add('object-contain');`;

                return `
                <a 
                  href="#/stories/${story.id}" 
                  data-navigate
                  data-aos="fade-up"
                  data-aos-delay="${index * 100}"
                  class="h-full block group relative"
                  aria-label="Lihat detail cerita ${story.name || 'Tanpa Judul'}"
                >
                  <button
                    class="save-story-btn absolute top-2 right-2 z-10 bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:bg-blue-700 transition transform hover:scale-110 disabled:bg-green-500 disabled:scale-100"
                    data-id="${story.id}"
                    title="Simpan untuk dibaca offline"
                  >
                    <i class="fas fa-save"></i>
                  </button>
                  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-blue-200 overflow-hidden">
                    <div class="relative h-40 sm:h-56 overflow-hidden bg-gray-200">
                      <img
                        src="${story.photoUrl || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Tidak+Ada+Gambar'}"
                        alt="Foto untuk cerita ${story.name || 'Tanpa Judul'}"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style="aspect-ratio: 16/9"
                        loading="lazy"
                        onerror="${imageOnErrorScript}"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div class="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        ${story.lat && story.lon ? '<i class="fas fa-map-marker-alt text-red-500"></i> Dengan Lokasi' : '<i class="fas fa-globe-asia text-gray-500"></i> Tanpa Lokasi'}
                      </div>
                    </div>
                    <div class="p-4 sm:p-5 flex flex-col flex-grow">
                      <div class="flex justify-between items-start mb-2 gap-2">
                        <h3 class="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                          ${story.name || 'Cerita Tanpa Judul'}
                        </h3>
                        <div class="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap pt-1">
                          <i class="fas fa-calendar-alt"></i>
                          ${storyDate}
                        </div>
                      </div>
                      <p class="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                        ${story.description || 'Tidak ada deskripsi.'}
                      </p>
                      <div class="flex justify-between items-center text-xs sm:text-sm text-gray-500 mt-auto pt-2 border-t border-gray-100">
                        <div class="flex items-center gap-1">
                          <i class="fas fa-user-circle text-blue-500"></i>
                          <span>${story.name ? story.name.split(' ')[0] : 'Anonim'}</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <i class="fas fa-clock text-gray-400"></i>
                          <span>${new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              `}).join('')}
            </div>
          `}
          ${paginationHTML}
        </div>
      </div>

      <button
        id="scroll-to-top"
        class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 hover:bg-blue-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center opacity-0 translate-y-4 pointer-events-none ${this.state.showScrollButton ? '!opacity-100 !translate-y-0 !pointer-events-auto' : ''}"
        title="Scroll to top"
        aria-label="Scroll to top"
        data-aos="fade-up"
        data-aos-anchor-placement="center-bottom"
      >
        <i class="fas fa-arrow-up text-sm sm:text-base"></i>
      </button>
    `;
    page.appendChild(Footer());

    return page;
  }
}