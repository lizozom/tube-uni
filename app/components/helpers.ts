import { PodcastRecord, PodcastResponse } from '../types'; 

export const storePodcastInHistory = (topic: string, duration: number, podcastResponse: PodcastResponse) => {
  if (typeof window !== 'undefined') {
    const storedPodcasts = localStorage.getItem('podcastHistory');
    const podcasts: PodcastRecord[] = storedPodcasts ? JSON.parse(storedPodcasts) : [];

    const newPodcast: PodcastRecord = {
      title: topic,
      duration: duration.toString(),
      createDate: new Date().toISOString(),
      url: podcastResponse.audioFile,
    };

    podcasts.push(newPodcast);
    localStorage.setItem('podcastHistory', JSON.stringify(podcasts));
  }
};
