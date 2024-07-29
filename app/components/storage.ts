import { PodcastRecord } from '../types'; 

export const storePodcastInHistory = (topic: string, duration: number, podcastResponse: PodcastRecord) => {
  if (typeof window !== 'undefined') {
    const storedPodcasts = window.localStorage.getItem('podcastHistory');
    const podcasts: PodcastRecord[] = storedPodcasts ? JSON.parse(storedPodcasts) : [];

    const newPodcast: PodcastRecord = {
      title: topic,
      duration,
      createDate: new Date().toISOString(),
      url: podcastResponse.url,
    };

    podcasts.push(newPodcast);
    window.localStorage.setItem('podcastHistory', JSON.stringify(podcasts));
  }
};

export const getPodcastHistory = (): PodcastRecord[] => {
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

  return recommendations as string[];
}

export const getCurrentRecommendations = () => {
  const storedRecommendations = typeof window !== 'undefined' ? window.localStorage.getItem("topicRecommendations") : null;
  if (!storedRecommendations) return null;
  return JSON.parse(storedRecommendations) as string[];
}

export const getPodcastTopics = () => {
  const storedPodcastTopics = typeof window !== 'undefined' ? window.localStorage.getItem('podcastTopics') : null;
  if (!storedPodcastTopics) return null;
  return JSON.parse(storedPodcastTopics) as string[];
}

export const setPodcastTopics = (topics: string[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('podcastTopics', JSON.stringify(topics));
  }
}