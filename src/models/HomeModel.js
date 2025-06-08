// src/models/HomeModel.js
import { putStories, getAllStories } from '../utils/indexedDB-helper.js';

export default class HomeModel {
  async fetchStories(token, page = 1, size = 18, location = 0) {
    const url = `https://story-api.dicoding.dev/v1/stories?page=${page}&size=${size}&location=${location}`;
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        console.warn('[HomeModel] Gagal mengambil dari API, mencoba IndexedDB:', data.message);
        const offlineStories = await this.fetchStoriesFromDB();
        if (offlineStories.length > 0) {
            return { stories: offlineStories, total: offlineStories.length, fromCache: true };
        }
        throw new Error(data.message || "Gagal mengambil cerita dan tidak ada data offline.");
      }

      if (data.listStory && data.listStory.length > 0) {
        await putStories(data.listStory);
      }
      
      return {
        stories: data.listStory,
        total: data.totalStories || data.listStory.length,
        fromCache: false,
      };
    } catch (error) {
      console.error('[HomeModel] Error jaringan/API saat fetchStories:', error);
      const offlineStories = await this.fetchStoriesFromDB();
      if (offlineStories.length > 0) {
        return { stories: offlineStories, total: offlineStories.length, fromCache: true };
      }
      throw error;
    }
  }

  async fetchStoriesFromDB() {
    try {
      const stories = await getAllStories();
      return stories;
    } catch (error) {
      console.error('[HomeModel] Gagal mengambil cerita dari IndexedDB:', error);
      return [];
    }
  }
}