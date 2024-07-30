import { useEffect, useState } from 'react'
import { type PodcastRecord } from '../types' // Adjust the path as necessary

export const PodcastHistory: React.FC = () => {
  const [podcasts, setPodcasts] = useState<PodcastRecord[]>([])

  useEffect(() => {
    // Check if window is available to access localStorage
    if (typeof window !== 'undefined') {
      const storedPodcasts = window.localStorage.getItem('podcastHistory')
      if (storedPodcasts) {
        setPodcasts(JSON.parse(storedPodcasts))
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto mt-8 w-full p-2">
      <div className="overflow-y-auto h-min">
        <ul className="space-y-4">
          {podcasts.length > 0
            ? (
                podcasts.sort().map((podcast, index) => (
              <li key={index}>
                <a href={podcast.url} target="_blank" rel="noopener noreferrer" className="block bg-white shadow-md rounded-lg p-4 hover:bg-gray-100 transition">
                  <span className="text-xl font-semibold">{podcast.title}</span> in {podcast.duration} minutes
                  <p className="text-gray-600">
                    Created On: {new Date(podcast.createDate).toLocaleDateString()}
                  </p>
                </a>
              </li>
                ))
              )
            : (
            <p className="text-gray-500">No podcasts found.</p>
              )}
        </ul>
      </div>
    </div>
  )
}
