// src/models/DetailStoryModel.js
import { putStoryDetail, getStoryDetail } from '../utils/indexedDB-helper.js';

export default class DetailStoryModel {
  async fetchStory(storyId, token) {
    try {
      const response = await fetch(`https://story-api.dicoding.dev/v1/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        console.warn(`[DetailStoryModel] Gagal mengambil detail dari API, mencoba IndexedDB...`);
        const offlineStoryDetail = await this.fetchStoryFromDB(storyId);
        if (offlineStoryDetail) {
            return { story: offlineStoryDetail, fromCache: true };
        }
        throw new Error(data.message || `Gagal mengambil detail cerita ${storyId}.`);
      }

      if (data.story) {
        await putStoryDetail(data.story);
      }
      return { story: data.story, fromCache: false };

    } catch (error) {
      console.error(`[DetailStoryModel] Error jaringan/API saat fetchStory '${storyId}':`, error);
      const offlineStoryDetail = await this.fetchStoryFromDB(storyId);
      if (offlineStoryDetail) {
        return { story: offlineStoryDetail, fromCache: true };
      }
      throw error;
    }
  }

  async fetchStoryFromDB(storyId) {
    try {
      return await getStoryDetail(storyId);
    } catch (error) {
      console.error(`[DetailStoryModel] Gagal mengambil detail dari IndexedDB '${storyId}':`, error);
      return undefined;
    }
  }

  async fetchLocationDetails(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            return {
                address: "Detail lokasi tidak tersedia saat offline",
                coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)} (cached)`
            };
        }
        const data = await response.json();
        return {
          address: data.display_name || "Lokasi tidak diketahui",
          coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)}`
        };
    } catch (error) {
        console.error('[DetailStoryModel] Gagal mengambil detail lokasi:', error);
        return {
            address: "Gagal memuat detail lokasi",
            coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)}`
        };
    }
  }
}