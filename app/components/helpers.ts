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

export const fetchRecommendations = async (podcastTopics: string[]) => {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ topics: podcastTopics })
  });

  const recommendations = await response.json();
  localStorage.setItem("topicRecommendations", JSON.stringify(recommendations));
  return recommendations;
}

export const getCurrentRecommendations = () => {
  const storedRecommendations = localStorage.getItem("topicRecommendations");
  if (!storedRecommendations) return null;
  return JSON.parse(storedRecommendations);
}