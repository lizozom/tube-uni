// hooks/useServiceWorker.tsx
import { useEffect } from 'react';
import { PodcastRecord } from '../types';


const useServiceWorker = (responseInfo?: PodcastRecord) => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          const storePodcast = (podcast: PodcastRecord) => {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'storePodcast',
                podcast: podcast,
              });
            }
          };

          // Example usage
          if (responseInfo) {
            storePodcast(responseInfo);
          } 
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, [responseInfo]);
};

export default useServiceWorker;
