    export default class DetailStoryPresenter {
      constructor(view, model) {
        this.view = view;
        this.model = model;
      }

      async loadStory(storyId) {
        const token = localStorage.getItem("token");
        if (!token && !navigator.onLine) {
            this.view.showLoading?.(); 
            try {
                const storyDetail = await this.model.fetchStoryFromDB(storyId);
                if (storyDetail) {
                    let locationDetails = { 
                        address: "Detail lokasi tidak tersedia saat offline", 
                        coordinates: (storyDetail.lat && storyDetail.lon) ? `${storyDetail.lat.toFixed(4)}, ${storyDetail.lon.toFixed(4)} (cached)` : "N/A"
                    };
                    if (storyDetail.lat && storyDetail.lon && navigator.onLine) { 
                        locationDetails = await this.model.fetchLocationDetails(storyDetail.lat, storyDetail.lon);
                    } else if (storyDetail.lat && storyDetail.lon) {
                        
                        locationDetails.address = `Koordinat: ${storyDetail.lat.toFixed(4)}, ${storyDetail.lon.toFixed(4)} (detail alamat tidak tersedia offline)`;
                    }

                    this.view.showStory(storyDetail, locationDetails, true); 
                    this.view.showToast?.('Menampilkan data detail cerita offline.', 'info');
                } else {
                    this.view.showError?.(`Anda offline dan detail cerita untuk ID ${storyId} tidak tersimpan.`);
                }
            } catch (error) {
                this.view.showError?.(error.message || "Terjadi kesalahan saat memuat detail cerita offline.");
            } finally {
                this.view.hideLoading?.();
            }
            return;
        }


        if (!token) {
          this.view.showError?.("Anda perlu login untuk melihat detail cerita ini.");
          return;
        }
        
        this.view.showLoading?.();
        try {
          const { story, fromCache } = await this.model.fetchStory(storyId, token);
          let locationDetails = { address: "Tidak ada data lokasi", coordinates: "" };
          if (story && story.lat && story.lon) {
            locationDetails = await this.model.fetchLocationDetails(story.lat, story.lon);
          }
          this.view.showStory(story, locationDetails, fromCache || false);
          if (fromCache) {
            this.view.showToast?.('Menampilkan data detail cerita offline. Koneksi bermasalah.', 'info');
          }
        } catch (err) {
          this.view.showError?.(err.message || "Gagal memuat detail cerita");
        } finally {
            this.view.hideLoading?.();
        }
      }
    }
    