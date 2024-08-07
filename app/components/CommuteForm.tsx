'use client'

import { useEffect, useState } from 'react'
import { Button, Image } from '@nextui-org/react'
import { type DistanceMatrixResponseData } from '@googlemaps/google-maps-services-js'
import { type TubeStation } from '../types'
import StationSelector from './StationSelector'
import TravelTimeSelector from './TravelTimeSelector'
import { track } from '@vercel/analytics'

export interface CommuteFormProps {
  stations: TubeStation[]
  topics: string[]
  placeholderTopic: string
  onIsLoading: (isLoading: boolean) => void
  onPodcastResponse: (topic: string, duration: number, podcastResponse: any) => void
  onError: (errorOrCode?: Error) => void
}

export function CommuteForm (props: CommuteFormProps) {
  const { topics, stations, onIsLoading, onPodcastResponse } = props

  const [travelTimeMin, setTravelTimeMin] = useState<number | undefined>(undefined)
  const [start, setStart] = useState<string | undefined>()// ("Covent Garden");
  const [end, setEnd] = useState<string | undefined>()// ("Hyde Park Corner");
  const [topic, setTopic] = useState<string>()
  const [topicPlaceholder, setTopicPlaceholder] = useState<string>(props.placeholderTopic)
  const [podcastText, setPodcastText] = useState<string>('')
  const [canSubmit, setCanSubmit] = useState<boolean>(false)

  useEffect(() => {
    if (topic && travelTimeMin && topic.trim().length > 3) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }
  }, [topic, travelTimeMin])

  const generatePodcast = async () => {
    if (!topic || !travelTimeMin) return
    const params = new URLSearchParams({
      topic: topic.trim().toLowerCase(),
      duration: ((travelTimeMin || 5) * 60).toString()
    })

    // 3 minute timer
    const controller = new AbortController()
    const timeoutId = setTimeout(() => { controller.abort() }, 180000)
    const response: any = await fetch(`/api/podcast/generate?${params.toString()}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    const podcastContent: Record<string, any> = await response.json()
    const { errorCode, script } = podcastContent
    if (errorCode) {
      throw new Error(errorCode)
    }
    setPodcastText(script)
    onPodcastResponse(topic, travelTimeMin, podcastContent)
  }

  const onClick = async () => {
    onIsLoading(true)
    track('generateStart', { topic: topic || '' })
    try {
      // await fetchCommuteTime();
      await generatePodcast()
      track('generateComplete', { topic: topic || '' })
    } catch (e: any) {
      track('generateError', { topic: topic || '' })
      console.error(e)
      props.onError(e)
    } finally {
      onIsLoading(false)
    }
  }

  const loadTitle = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    track('loadTitle', { type: 'random', topic: randomTopic })
    setTopic(randomTopic)
  }

  const handleStartStationChange = (station: string) => {
    setStart(station)
  }

  const handleEndStationChange = (station: string) => {
    setEnd(station)
  }

  const handleTravelTimeChange = (time: number | undefined) => {
    track('travelTimeChange', { time: time || '' })
    setTravelTimeMin(time)
  }

  useEffect(() => {
    const fetchCommuteTime = async () => {
      if (!start || !end) return
      const params = new URLSearchParams({
        start: `${start} station, London`,
        end: `${end} station, London`
      })
      const response = await fetch(`/api/traverse_time?${params.toString()}`)
      const instructions: DistanceMatrixResponseData = await response.json()
      const travelTime = instructions.rows[0].elements[0].duration
      return Math.min(Math.floor(travelTime.value / 60), 20)
    }

    fetchCommuteTime().then(travelMin => {
      setTravelTimeMin(travelMin)
    })
  }, [start, end])

  return (
      <div className="w-100">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col flex-wrap content-end text-4xl px-4 pt-8 text-color-main">
                tube uni
            </div>
            <div className="flex flex-col flex-wrap me-auto relative w-[70%] min-w-[330px]">
                <StationSelector title="from" stations={stations} station={start} onChange={handleStartStationChange}/>
            </div>
            <div className="flex flex-col flex-wrap ms-auto relative w-[70%] min-w-[330px]">
                <StationSelector title="to" stations={stations} station={end} onChange={handleEndStationChange}/>
            </div>
            <div className="flex flex-col flex-wrap content-center">
                <TravelTimeSelector commuteTime={travelTimeMin} onChange={handleTravelTimeChange}></TravelTimeSelector>
            </div>
            <div className="flex flex-col flex-wrap content-center">
                <div className="text-main py-2 px-4">teach me about...</div>
                <div className="relative w-full h-fit">
                  <textarea
                      className="teach-me-input placeholder-white w-full p-4 text-main"
                      value={topic}
                      placeholder={topicPlaceholder ? `type something like "${topicPlaceholder}"` : ''}
                      rows={3}
                      onInput={e => { setTopic((e.target as HTMLTextAreaElement).value) }}
                      onFocus={e => { setTopicPlaceholder('') }}
                      onBlur={e => { setTopicPlaceholder(props.placeholderTopic) }}

                  ></textarea>
                  <button className="bg-transparent h-6 absolute bottom-10 -right-2 p-0 mx-2" onClick={loadTitle}>
                    <Image
                      src="/icons/refresh.svg"
                      className="h-6 w-6 m-4"
                      alt="refresh"
                    />
                  </button>
                </div>

            </div>

            <div className="text-m w-full text-center absolute bottom-[35px] left-[50%] -translate-x-[50%]">
                <Button className="mt-4 rounded-none create-button text-main" onClick={onClick} isDisabled={!canSubmit}>
                create podcast
                </Button>
            </div>
        </div>

        {podcastText ? JSON.stringify(podcastText, null, 4) : ''}
      </div>
  )
}
