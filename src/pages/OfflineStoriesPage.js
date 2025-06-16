import OfflineStoriesPresenter from '../presenters/OfflineStoriesPresenter.js';
import Footer from '../components/Footer.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { navigateTo } from '../App.js';

export default class OfflineStoriesPage {
  constructor() {
    this.state = {
      stories: [],
      loading: true,
      error: null,
    };
    this.presenter = new OfflineStoriesPresenter(this);
    this.pageElement = document.createElement('main');
    this.pageElement.id = 'main-content';
    this.pageElement.tabIndex = -1;
    this.pageElement.className = 'flex flex-col min-h-screen';

    this.handleDelete = this.handleDelete.bind(this);
  }

  showLoading() {
    this.state.loading = true;
    this.renderContent(); 
  }

  showError(msg) {
    this.state.error = msg;
    this.state.loading = false;
    this.renderContent(); 
  }

  showStories(stories) {
    this.state = { ...this.state, stories, loading: false, error: null };
    this.renderContent(); 
  }
  
  async handleDelete(e) {
    const button = e.target.closest('.delete-btn');
    if (button) {
      const storyId = button.dataset.id;
      const storyName = button.dataset.name || 'cerita ini';
      if (confirm(`Apakah Anda yakin ingin menghapus "${storyName}" dari daftar tersimpan?`)) {
        await this.presenter.deleteStory(storyId);
      }
    }
  }

  
  setupEventListeners() {
    const container = this.pageElement.querySelector('#offline-stories-container');
    if(container){
      container.addEventListener('click', this.handleDelete);
    }
    
    this.pageElement.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('href').substring(1);
        navigateTo(path);
      });
    });
  }

  
  afterRender() {
    this.presenter.loadStories();
  }

  renderContent() {
    let contentHTML = '';
    if (this.state.loading) {
      contentHTML = LoadingSpinner({ size: 'lg' }).outerHTML;
    } else if (this.state.error) {
      contentHTML = `<p class="text-center text-red-500">${this.state.error}</p>`;
    } else if (this.state.stories.length === 0) {
      contentHTML = `
        <div class="text-center py-16 bg-gray-50 rounded-lg">
          <i class="fas fa-folder-open text-5xl text-gray-300 mb-4"></i>
          <h2 class="text-xl font-semibold text-gray-700">Belum Ada Cerita Tersimpan</h2>
          <p class="text-gray-500 mt-2">Anda bisa menyimpan cerita dari halaman utama atau detail.</p>
        </div>
      `;
    } else {
      contentHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.state.stories.map(story => `
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg group">
              <div class="relative">
                <a href="#/stories/${story.id}" data-navigate>
                  <img src="${story.photoUrl}" alt="${story.name}" class="w-full h-48 object-cover group-hover:opacity-80 transition-opacity">
                </a>
                <button 
                  data-id="${story.id}" 
                  data-name="${story.name}" 
                  class="delete-btn absolute top-3 right-3 bg-red-500 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-red-600 transition transform hover:scale-110"
                  title="Hapus dari daftar"
                  aria-label="Hapus ${story.name} dari daftar"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="p-4">
                <a href="#/stories/${story.id}" data-navigate class="focus:outline-none">
                  <h3 class="font-bold text-lg mb-1 truncate group-hover:text-blue-600">${story.name}</h3>
                </a>
                <p class="text-gray-600 text-sm line-clamp-2">${story.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    this.pageElement.innerHTML = `
      <div class="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center gap-3 mb-6">
            <i class="fas fa-save text-2xl text-blue-600"></i>
            <h1 class="text-3xl font-bold text-gray-800">Cerita Tersimpan</h1>
        </div>
        <div id="offline-stories-container">
            ${contentHTML}
        </div>
      </div>
    `;
    this.pageElement.appendChild(Footer());

    this.setupEventListeners();
  }

  
  render() {
    this.renderContent(); 
    return this.pageElement;
  }
}