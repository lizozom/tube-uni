import { PodcastRecord, PodcastResponse } from '../types'; 

export const storePodcastInHistory = (topic: string, duration: number, podcastResponse: PodcastResponse) => {
  if (typeof window !== 'undefined') {
    const storedPodcasts = window.localStorage.getItem('podcastHistory');
    const podcasts: PodcastRecord[] = storedPodcasts ? JSON.parse(storedPodcasts) : [];

    const newPodcast: PodcastRecord = {
      title: topic,
      duration: duration.toString(),
      createDate: new Date().toISOString(),
      url: podcastResponse.audioFile,
    };

    podcasts.push(newPodcast);
    window.localStorage.setItem('podcastHistory', JSON.stringify(podcasts));
  }
};

export const getPodcastHistory = () => {
  if (typeof window !== 'undefined') {
    const storedPodcasts = window.localStorage.getItem('podcastHistory');
    return storedPodcasts ? JSON.parse(storedPodcasts) : [];
  }
  return [];
}

export const fetchRecommendations = async (podcastTopics: string[]) => {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ topics: podcastTopics })
  });

  const recommendations = await response.json();

  if (typeof window !== 'undefined') {
    window.localStorage.setItem("topicRecommendations", JSON.stringify(recommendations));
  }

  return recommendations;
}

export const getCurrentRecommendations = () => {
  const storedRecommendations = typeof window !== 'undefined' ? window.localStorage.getItem("topicRecommendations") : null;
  if (!storedRecommendations) return null;
  return JSON.parse(storedRecommendations);
}

export const getPodcastTopics = () => {
  const storedPodcastTopics = typeof window !== 'undefined' ? window.localStorage.getItem('podcastTopics') : null;
  if (!storedPodcastTopics) return null;
  return JSON.parse(storedPodcastTopics);
}

export const setPodcastTopics = (topics: string[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('podcastTopics', JSON.stringify(topics));
  }
}