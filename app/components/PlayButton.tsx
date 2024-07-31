import React, { useState, useEffect } from 'react'

interface PlayButtonProps {
  playAudio: () => void
  canPlay: boolean
}

const PlayButton: React.FC<PlayButtonProps> = ({ playAudio, canPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (canPlay) {
      setIsPlaying(!isPlaying)
      playAudio()
    }
  }

  useEffect(() => {
    if (!canPlay) {
      setIsPlaying(false)
    }
  }, [canPlay])

  return (
    <div className="button-container" onClick={togglePlay}>
      <div className={`button ${isPlaying ? 'flipped' : ''}`}>
        <svg className="play" width="147" height="147" viewBox="0 0 147 147" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="73.5" cy="73.5" r="73.5" fill="#CD3F3E" />
          <path d="M52.4473 39.1108C52.4473 38.1525 52.8364 37.6734 53.6148 37.6734C53.9608 37.6734 54.3067 37.7605 54.6527 37.9347L114.328 72.5626C114.934 72.9111 115.236 73.3467 115.236 73.8694C115.236 74.392 114.934 74.8276 114.328 75.1761L54.6527 109.804C54.3067 109.978 54.004 110.065 53.7446 110.065C52.8797 110.065 52.4473 109.586 52.4473 108.628L52.4473 39.1108Z" fill="#F2F2F2" />
        </svg>
        <svg className="pause" width="147" height="147" viewBox="0 0 147 147" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="73.5" cy="73.5" r="73.5" fill="#CD3F3E" />
          <rect x="50" y="37" width="15" height="73" fill="#F2F2F2" />
          <rect x="82" y="37" width="15" height="73" fill="#F2F2F2" />
        </svg>
      </div>
    </div>
  )
}

export default PlayButton
