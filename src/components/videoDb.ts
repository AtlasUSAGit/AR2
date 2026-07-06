/**
 * IndexedDB helper for storing and retrieving high-performance cinematic intro videos.
 * Allows users to upload their custom MP4 video file and play it instantly offline
 * within the sandbox iframe, bypassing network latency and CORS blockages.
 */

export function getStoredVideo(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("VideoIntroDB", 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("videos")) {
          resolve(null);
          return;
        }
        const transaction = db.transaction("videos", "readonly");
        const store = transaction.objectStore("videos");
        const getReq = store.get("introVideo");
        getReq.onsuccess = () => {
          const result = getReq.result;
          if (result instanceof Blob) {
            resolve(URL.createObjectURL(result));
          } else if (typeof result === 'string') {
            resolve(result); // If stored as a URL string or Base64
          } else {
            resolve(null);
          }
        };
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    } catch (e) {
      console.warn("IndexedDB not available:", e);
      resolve(null);
    }
  });
}

export function saveStoredVideo(fileOrUrl: Blob | string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("VideoIntroDB", 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const transaction = db.transaction("videos", "readwrite");
        const store = transaction.objectStore("videos");
        const putReq = store.put(fileOrUrl, "introVideo");
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => resolve(false);
      };
      request.onerror = () => resolve(false);
    } catch (e) {
      console.warn("Failed to write to IndexedDB:", e);
      resolve(false);
    }
  });
}

export function clearStoredVideo(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("VideoIntroDB", 1);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const transaction = db.transaction("videos", "readwrite");
        const store = transaction.objectStore("videos");
        const deleteReq = store.delete("introVideo");
        deleteReq.onsuccess = () => resolve(true);
        deleteReq.onerror = () => resolve(false);
      };
      request.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}
