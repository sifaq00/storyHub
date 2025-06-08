    // src/presenters/HomePresenter.js
    export default class HomePresenter {
      constructor(view, model, navigateTo) {
        this.view = view;
        this.model = model;
        this.navigateTo = navigateTo;
      }

      async loadStories(page = 1, size = 18, location = 0) {
        const token = localStorage.getItem("token");
        if (!token && !navigator.onLine) { // Jika offline dan tidak ada token, coba tampilkan dari cache
            this.view.showLoading();
            try {
                const { stories, total, fromCache } = await this.model.fetchStoriesFromDB();
                if (stories && stories.length > 0) {
                    this.view.showStories(stories, 1, stories.length, true); // page 1, total = stories.length, fromCache true
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
          // Pertimbangkan untuk tidak langsung navigasi, biarkan pengguna melihat halaman (mungkin kosong)
          // this.navigateTo('/login'); 
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

      // Fungsi navigasi tetap sama
      navigateTo(path) {
        this.navigateTo(path);
      }
    }
    