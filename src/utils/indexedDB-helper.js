const DB_NAME = 'storyhub-db';
const DB_VERSION = 1;
const STORIES_STORE_NAME = 'stories'; 
const STORY_DETAILS_STORE_NAME = 'story-details'; 

/**
 * Membuka atau membuat database IndexedDB.
 * @returns {Promise<IDBDatabase>} Promise yang resolve dengan objek database.
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Browser Anda tidak mendukung IndexedDB.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('[IndexedDB] Error saat membuka database:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('[IndexedDB] Melakukan upgrade database...');
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORIES_STORE_NAME)) {
        const storiesStore = db.createObjectStore(STORIES_STORE_NAME, { keyPath: 'id' });
        storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log(`[IndexedDB] Object store '${STORIES_STORE_NAME}' dibuat.`);
      }

      if (!db.objectStoreNames.contains(STORY_DETAILS_STORE_NAME)) {
        db.createObjectStore(STORY_DETAILS_STORE_NAME, { keyPath: 'id' });
        console.log(`[IndexedDB] Object store '${STORY_DETAILS_STORE_NAME}' dibuat.`);
      }
    };
  });
};

/**
 * Menyimpan banyak cerita ke object store 'stories'.
 * Menghapus data lama sebelum memasukkan yang baru untuk menjaga data tetap fresh.
 * @param {Array<Object>} storiesData Array objek cerita.
 */
const putStories = async (storiesData) => {
  if (!Array.isArray(storiesData)) {
    console.error('[IndexedDB] putStories: Data harus berupa array.');
    return;
  }
  try {
    const db = await openDB();
    const transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);

    const clearRequest = store.clear();
    await new Promise((resolve, reject) => {
        clearRequest.onsuccess = resolve;
        clearRequest.onerror = (event) => reject(event.target.error);
    });

    for (const story of storiesData) {
      if (story && story.id) {
        store.put(story);
      }
    }
    return new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Gagal membuka DB atau menyimpan cerita:', error);
  }
};

/**
 * Menyimpan atau memperbarui satu cerita ke object store 'stories'.
 * @param {Object} story Objek cerita tunggal.
 */
const putStory = async (story) => {
  if (!story || !story.id) {
    console.error('[IndexedDB] putStory: Cerita harus memiliki ID.');
    return;
  }
  try {
    const db = await openDB();
    const transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    store.put(story);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Gagal menyimpan cerita tunggal (id: ${story.id}):`, error);
  }
};

/**
 * Mengambil semua cerita dari object store 'stories'.
 * @returns {Promise<Array<Object>>} Promise yang resolve dengan array objek cerita.
 */
const getAllStories = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORIES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => resolve(event.target.result || []);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Gagal membuka DB untuk getAllStories:', error);
    return [];
  }
};

/**
 * Menyimpan detail satu cerita ke object store 'story-details'.
 * @param {Object} storyDetail Objek detail cerita.
 */
const putStoryDetail = async (storyDetail) => {
  if (!storyDetail || !storyDetail.id) {
    console.error('[IndexedDB] putStoryDetail: Detail cerita harus memiliki ID.');
    return;
  }
  try {
    const db = await openDB();
    const transaction = db.transaction(STORY_DETAILS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORY_DETAILS_STORE_NAME);
    store.put(storyDetail);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Gagal membuka DB untuk putStoryDetail:', error);
  }
};

/**
 * Mengambil detail satu cerita dari object store 'story-details' berdasarkan ID.
 * @param {string} storyId ID cerita.
 * @returns {Promise<Object|undefined>} Promise yang resolve dengan objek detail cerita atau undefined jika tidak ditemukan.
 */
const getStoryDetail = async (storyId) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORY_DETAILS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORY_DETAILS_STORE_NAME);
    const request = store.get(storyId);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Gagal membuka DB untuk getStoryDetail:', error);
    return undefined;
  }
};

/**
 * Menghapus satu cerita dari 'stories' dan 'story-details' berdasarkan ID.
 * @param {string} storyId ID cerita yang akan dihapus.
 */
const deleteStory = async (storyId) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORIES_STORE_NAME, STORY_DETAILS_STORE_NAME], 'readwrite');
    const storiesStore = transaction.objectStore(STORIES_STORE_NAME);
    const detailsStore = transaction.objectStore(STORY_DETAILS_STORE_NAME);

    storiesStore.delete(storyId);
    detailsStore.delete(storyId);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`[IndexedDB] Cerita dengan ID ${storyId} telah dihapus.`);
        resolve();
      };
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Gagal menghapus cerita (id: ${storyId}):`, error);
    throw error;
  }
};


const clearAllData = async () => {
  try {
    const db = await openDB();
    const objectStoreNames = [STORIES_STORE_NAME, STORY_DETAILS_STORE_NAME];
    const transaction = db.transaction(objectStoreNames, 'readwrite');

    const promises = objectStoreNames.map(storeName => {
      return new Promise((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => {
          console.log(`[IndexedDB] Object store '${storeName}' berhasil dikosongkan.`);
          resolve();
        };
        request.onerror = (event) => {
          console.error(`[IndexedDB] Error mengosongkan '${storeName}':`, event.target.error);
          reject(event.target.error);
        };
      });
    });

    await Promise.all(promises);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('[IndexedDB] Semua data di object stores telah dihapus (transaksi selesai).');
        resolve();
      };
      transaction.onerror = (event) => {
        console.error('[IndexedDB] Error pada transaksi clearAllData:', event.target.error);
        reject(event.target.error);
      };
    });

  } catch (error) {
    console.error('[IndexedDB] Error saat menghapus semua data:', error);
    throw error;
  }
};

export {
  openDB,
  putStories,
  putStory,
  getAllStories,
  putStoryDetail,
  getStoryDetail,
  deleteStory,
  clearAllData,
};