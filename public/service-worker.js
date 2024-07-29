// public/service-worker.js

importScripts('https://cdn.jsdelivr.net/npm/idb@6.1.4/build/iife/index-min.js');

// Function to initialize IndexedDB
function openDatabase() {
  return idb.openDB('podcast-store', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('podcasts')) {
        const store = db.createObjectStore('podcasts', { keyPath: 'url' });
        store.createIndex('date', 'date', { unique: false });
      }
    }
  });
}

// Function to store a podcast in IndexedDB
async function storePodcast(podcast) {

  try {
    console.log('Fetching:', podcast.url);
    const response = await fetch(podcast.url, { mode: 'cors' }); // Ensure CORS mode is set
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const podcastBlob = await response.blob();
    const podcastData = {
      url: podcast.url,
      blob: podcastBlob,
      topic: podcast.topic,
      duration: podcast.duration,
      date: podcast.date,
      status: 'available'
    };
    const db = await openDatabase();
    const tx = db.transaction('podcasts', 'readwrite');
    const store = tx.objectStore('podcasts');
    await store.put(podcastData);
    await tx.done;
    console.log('Podcast stored:', podcast.url);
  } catch (error) {
    console.error('Failed to fetch and store podcast:', error);
  } finally {
  }
}

// Function to clean up old podcasts
async function cleanUpOldPodcasts() {
  const db = await openDatabase();
  const tx = db.transaction('podcasts', 'readwrite');
  const store = tx.objectStore('podcasts');
  const index = store.index('date');
  const now = new Date();
  const cutoffDate = new Date(now.setDate(now.getDate() - 14));

  const cursor = await index.openCursor();

  while (cursor) {
    if (new Date(cursor.value.date) < cutoffDate && cursor.value.status === 'available') {
      const updatedRecord = {
        ...cursor.value,
        blob: null,
        status: 'deleted'
      };
      await cursor.update(updatedRecord);
      console.log('Podcast marked as deleted:', cursor.value.url);
    }
    cursor.continue();
  }

  await tx.done;
}

// Set up a daily cleanup task
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  cleanUpOldPodcasts();
  setInterval(cleanUpOldPodcasts, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'storePodcast') {
    storePodcast(event.data.podcast);
  }
});
