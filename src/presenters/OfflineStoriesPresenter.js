import { getAllStories, deleteStory } from '../utils/indexedDB-helper.js';

export default class OfflineStoriesPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStories() {
    this.view.showLoading();
    try {
      const stories = await getAllStories();
      this.view.showStories(stories);
    } catch (error) {
      console.error('Error loading saved stories:', error);
      this.view.showError('Gagal memuat cerita yang tersimpan.');
    }
  }
  
  async deleteStory(storyId) {
    try {
      await deleteStory(storyId);
      await this.loadStories();
    } catch(error) {
      console.error('Error deleting story:', error);
      this.view.showError('Gagal menghapus cerita.');
    }
  }
}