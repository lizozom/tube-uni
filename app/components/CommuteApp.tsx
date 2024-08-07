'use client'

import { useEffect, useState } from 'react'
import { type TubeStation, type PodcastResponse } from '../types'
import { SplashScreen } from './SplashScreen'
import { LoadingScreen } from './LoaderScreen'
import { PlayScreen } from './PlayScreen'
import { CommuteForm } from './CommuteForm'
import { ErrorScreen } from './ErrorScreen'
import { track } from '@vercel/analytics'

export interface CommuteAppProps {
  stations: TubeStation[]
  topics: string[]
  placeholderTopic: string
}

export function CommuteApp (props: CommuteAppProps) {
  const { topics, stations, placeholderTopic } = props

  const [showSplash, setShowSplash] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [errorOrCode, setErrorOrCode] = useState<Error | undefined>(undefined)
  const [travelTimeMin, setTravelTimeMin] = useState<number | undefined>(undefined)
  const [topic, setTopic] = useState<string>()
  const [podcastResponse, setPodcastResponse] = useState<PodcastResponse>()

  useEffect(() => {
    const vh = window.innerHeight * 0.01
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }, [])

  const hideSplash = () => {
    setShowSplash(false)
  }

  const onIsLoading = (isLoading: boolean) => {
    setIsLoading(isLoading)
  }

  const onError = (errorOrCode?: Error) => {
    setIsError(true)
    setErrorOrCode(errorOrCode)
  }

  const onPodcastResponse = (topic: string, duration: number, podcastResponse: PodcastResponse) => {
    setTopic(topic)
    setTravelTimeMin(duration)
    setPodcastResponse(podcastResponse)
  }

  const onBack = () => {
    track('backButtonClick')
    setTopic('')
    setIsError(false)
    setErrorOrCode(undefined)
    setTravelTimeMin(undefined)
    setPodcastResponse(undefined)
  }

  if (topic && travelTimeMin && podcastResponse) {
    return (
      <PlayScreen
        topic={topic}
        duration={travelTimeMin}
        onBack={onBack}
        audioFile={podcastResponse.audioFile}>

        </PlayScreen>
    )
  } else if (showSplash) {
    return (
      <SplashScreen onClick={hideSplash}></SplashScreen>
    )
  } else if (isLoading) {
    return (
      <LoadingScreen></LoadingScreen>
    )
  } else if (isError) {
    return (
    <ErrorScreen
      errorOrCode={errorOrCode}
      onBack={onBack} >
      </ErrorScreen>)
  } else {
    return (
        <CommuteForm
            stations={stations}
            topics={topics}
            placeholderTopic={placeholderTopic}
            onIsLoading={onIsLoading}
            onPodcastResponse={onPodcastResponse}
            onError={onError}

        ></CommuteForm>
    )
  }
}
