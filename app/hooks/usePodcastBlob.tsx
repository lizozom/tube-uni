// hooks/useFetchPodcast.tsx
import { useEffect, useState } from 'react'
import { openDB } from 'idb'

const usePodcastBlob = (podcastUrl?: string | null) => {
  const [podcastBlob, setPodcastBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPodcast = async () => {
      if (!podcastUrl) {
        return
      }
      try {
        const db = await openDB('podcast-store', 1)
        const tx = db.transaction('podcasts', 'readonly')
        const store = tx.objectStore('podcasts')
        const storedPodcast = await store.get(podcastUrl)

        if (storedPodcast?.blob) {
          // Podcast found in IndexedDB
          setPodcastBlob(storedPodcast.blob)
        } else {
          // Podcast not found in IndexedDB, fetch from URL
          const response = await fetch(podcastUrl, { mode: 'cors' })
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`)
          }
          const podcastBlob = await response.blob()
          setPodcastBlob(podcastBlob)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPodcast()
  }, [podcastUrl])

  return { podcastBlob, loading, error }
}

export default usePodcastBlob
