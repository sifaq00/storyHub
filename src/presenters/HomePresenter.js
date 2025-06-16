import { putStory, putStoryDetail } from '../utils/indexedDB-helper.js';

export default class HomePresenter {
  constructor(view, model, navigateTo) {
    this.view = view;
    this.model = model;
    this.navigateTo = navigateTo;
  }

  async loadStories(page = 1, size = 18, location = 0) {
    const token = localStorage.getItem("token");
    if (!token && !navigator.onLine) { 
        this.view.showLoading();
        try {
            const { stories, total, fromCache } = await this.model.fetchStoriesFromDB();
            if (stories && stories.length > 0) {
                this.view.showStories(stories, 1, stories.length, true); 
                this.view.showToast('Menampilkan data offline.', 'info');
            } else {
                this.view.showError("Anda offline dan tidak ada data cerita tersimpan.");
            }
        } catch (error) {
            this.view.showError(error.message || "Terjadi kesalahan saat memuat data offline.");
        }
        return;
    }
    
    if (!token) {
      this.view.showError("Anda perlu login terlebih dahulu");
     
      return;
    }

    this.view.showLoading();
    try {
      const { stories, total, fromCache } = await this.model.fetchStories(token, page, size, location);
      this.view.showStories(stories, page, total, fromCache || false);
      if (fromCache) {
        this.view.showToast('Menampilkan data offline. Koneksi bermasalah.', 'info');
      }
    } catch (error) {
      this.view.showError(error.message || "Terjadi kesalahan saat mengambil cerita");
    }
  }

  /**
   * Fungsi untuk menyimpan cerita yang dipilih untuk akses offline.
   * @param {Object} story Objek cerita yang akan disimpan.
   */
  async saveStoryForOffline(story) {
    try {
      if (!story || !story.id) {
        throw new Error("Data cerita tidak valid.");
      }
      await putStory(story);
      await putStoryDetail(story);
      this.view.showToast(`Cerita "${story.name}" berhasil disimpan.`, 'success');
    } catch (error) {
      console.error('Gagal menyimpan cerita:', error);
      this.view.showToast('Gagal menyimpan cerita.', 'error');
    }
  }

  navigateTo(path) {
    this.navigateTo(path);
  }
}