"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import { DistanceMatrixResponseData } from "@googlemaps/google-maps-services-js";
import { TubeStation, PodcastRecord } from "../types";
import StationSelector from "./StationSelector";
import TravelTimeSelector from "./TravelTimeSelector";
import { track } from '@vercel/analytics';
import { 
  fetchRecommendations, 
  getCurrentRecommendations, 
  getPodcastTopics,
  getPodcastHistory,
 } from "./storage";

export interface CommuteFormProps {
    stations: Array<TubeStation>;
    topics: Array<string>;
    placeholderTopic: string;
    onIsLoading: (isLoading: boolean) => void;
    onPodcastResponse: (podcastRecord: PodcastRecord) => void;
    onError: (errorOrCode?: Error) => void;
}

export function CommuteForm(props: CommuteFormProps) {
  const { topics, stations, onIsLoading, onPodcastResponse } = props;

  const [travelTimeMin, setTravelTimeMin] = useState<number | undefined>(undefined);
  const [start, setStart] = useState<string | undefined>();//("Covent Garden");
  const [end, setEnd] = useState<string | undefined>();//("Hyde Park Corner");
  const [topic, setTopic] = useState<string>();
  const [topicPlaceholder, setTopicPlaceholder] = useState<string>(props.placeholderTopic);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [submitAction, setSubmitAction] = useState<'generate' | 'load'>('generate');
  const [history, setHistory] = useState<PodcastRecord[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const hasFetchedData = useRef(false);
  const recommendations = useRef(getCurrentRecommendations() || topics);

  useEffect(() => { 
    if (hasFetchedData.current) return;
    setHistory(getPodcastHistory());
    
    const getRecommendations = async (podcastTopics: string[]) => {
      hasFetchedData.current = true; 
      recommendations.current = await fetchRecommendations(podcastTopics);
    }

    const podcastTopics = getPodcastTopics();
    if (podcastTopics) {
      track('getRecommendations', { topics: JSON.stringify(podcastTopics) });
      getRecommendations(podcastTopics);
    }

  }, []);

  useEffect(() => {
    if (topic && travelTimeMin && topic.trim().length > 3) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [topic, travelTimeMin])


  const generatePodcast = async () => {
    if (!topic || !travelTimeMin) return;
    const params = new URLSearchParams({
      topic: topic.trim().toLowerCase(),
      duration: ((travelTimeMin || 5) * 60).toString(),
    });

    // 3 minute timer
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 180000)
    const response: any = await fetch(`/api/podcast/generate?${params.toString()}`, {signal: controller.signal} );
    clearTimeout(timeoutId);
    const podcastContent: Record<string, any> = await response.json();
    const { errorCode } = podcastContent;
    if (errorCode) {
      throw new Error(errorCode);
    }
    onPodcastResponse({
      url: podcastContent.audioFile,
      title: topic,
      duration: travelTimeMin,
      createDate: new Date().toISOString()
    });
  }

  const onClick = async () => {
    onIsLoading(true);
    track('generateStart', { topic: topic || '' });
    try {
      // await fetchCommuteTime();
      await generatePodcast();
      track('generateComplete', { topic: topic || '' });

    } catch (e: any ) {
      track('generateError', { topic: topic || '' });
      console.error(e);
      props.onError(e);
      onIsLoading(false);
    }
  }

  const loadTitle = () => {
    const randomTopic = recommendations.current[Math.floor(Math.random() * recommendations.current.length)];
    track('loadTitle', { type: 'random', topic: randomTopic })
    setTopic(randomTopic);
    setSubmitAction('generate');
  }

  const loadHistory = () => {
    const historyTopic = history[historyIndex];
    track('loadHistory', { type: 'history', topic: historyTopic.title, index: historyIndex });
    setHistoryIndex((historyIndex + 1) % history.length);
    setTravelTimeMin(historyTopic.duration as any as number);
    setTopic(historyTopic.title);
    setSubmitAction('load');
  }

  const handleStartStationChange = (station: string) => {
    setStart(station);
  }

  const handleEndStationChange = (station: string) => {
    setEnd(station);
  }

  const handleTravelTimeChange = (time: number | undefined) => {
    track('travelTimeChange', { time: time || '' });
    setTravelTimeMin(time);
  }

  useEffect(() => {
    const fetchCommuteTime = async () => {
      if (!start || !end) return;
      const params = new URLSearchParams({
        start: `${start} station, London`,
        end: `${end} station, London`
      });
      const response = await fetch(`/api/traverse_time?${params.toString()}` );
      const instructions: DistanceMatrixResponseData = await response.json();
      const travelTime = instructions.rows[0].elements[0].duration;
      return Math.min(Math.floor(travelTime.value / 60), 20);
    }
    
    fetchCommuteTime().then(travelMin => {
        setTravelTimeMin(travelMin);
    });
  }, [start, end]);

  return (
    <>
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
                rows={4}
                onInput={e => setTopic((e.target as HTMLTextAreaElement).value)}
                onFocus={e => setTopicPlaceholder('')}
                onBlur={e => setTopicPlaceholder(props.placeholderTopic)}
            
            ></textarea>
              <button className={`bg-transparent h-6 absolute bottom-10 -left-2 p-0 ${history.length > 0 ? 'block' : 'hidden'}`} onClick={loadHistory}>
                <Image
                  src="/icons/reload.svg"
                  className="h-6 w-6 mt-6 me-6 ms-4 mb-4"
                  alt="reload"
                  width="16"
                  height="16"
                priority={true}
                />
              </button>
            <button className="bg-transparent h-6 absolute bottom-10 -right-2 p-0" onClick={loadTitle}>
              <Image
                src="/icons/refresh.svg"
                className="h-6 w-6 mt-6 ms-6 me-4 mb-4"
                alt="refresh"
                priority={true}
                width="16"
                height="16"
              />
            </button>
          </div>

      </div>

      <div className="text-m w-full text-center absolute bottom-[35px] left-[50%] -translate-x-[50%]">
          <Button className="mt-4 rounded-none create-button text-main" onClick={onClick} isDisabled={!canSubmit}>
          {submitAction === 'generate' ? 'create podcast' : 'listen to podcast'}
          </Button>
      </div>
  </>
  )
}