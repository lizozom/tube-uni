'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { track } from '@vercel/analytics'
import usePodcastBlob from '../hooks/usePodcastBlob'
import useViewportHeight from '../hooks/useViewportHeight'
import PlayButton from './PlayButton'

function PlayPodcast () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const audioFile = searchParams.get('audioFile')
  const topic = searchParams.get('topic')
  const travelTimeMin = searchParams.get('travelTimeMin') as any as number
  const { podcastBlob, loading, error } = usePodcastBlob(audioFile)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState(false)

  useViewportHeight()

  // use the podcast blob to play the audio
  useEffect(() => {
    if (!audioRef.current) return

    if (podcastBlob) {
      const url = URL.createObjectURL(podcastBlob)
      audioRef.current.src = url
    }
  }, [podcastBlob])

  useEffect(() => {
    if (!loading && !error && podcastBlob) {
      setCanPlay(true)
    }
  }, [podcastBlob, loading, error])

  if (!topic || !travelTimeMin || !audioFile) {
    return (
      <main>
        <h1>Invalid parameters</h1>
      </main>
    )
  }

  const onBack = () => {
    track('backButtonClick')
    router.push('/app')
  }

  const playAudio = () => {
    track('download', { topic: topic || '' })
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="flex real-100vh relative">
      <div className="flex m-auto flex-col items-center gap-8 ">
        <PlayButton playAudio={playAudio} canPlay={canPlay} />
        <span className="text-2xl text-center items-center px-6">
          {topic} in {travelTimeMin} minutes
        </span>

        <audio id="podcastPlayer" ref={audioRef}>
          Your browser does not support the audio element.
        </audio>
      </div>
      <button
        className="text-main absolute bottom-[35px] left-[50%] -translate-x-[50%]"
        onClick={onBack}
      >
        back to start
      </button>
    </div>
  )
}

export default PlayPodcast
