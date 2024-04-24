"use client";

import { useEffect, useState } from "react";
import { Button, Image } from "@nextui-org/react";
import { DistanceMatrixResponseData, TravelMode } from "@googlemaps/google-maps-services-js";
import { TubeStation } from "../types";
import { SplashScreen } from "./SplashScreen";
import StationSelector from "./StationSelector";
import TravelTimeSelector from "./TravelTimeSelector";
import { LoadingScreen } from "./LoaderScreen";

export interface CommuteFormProps {
    stations: Array<TubeStation>;
}

const topics = [
    'the history of toothbrushes',
    'how frogs make love',
    'how coffee came to europe',
    'what is a unicorn',
    'why flowers bloom in spring',
    'where do squirrels sleep',
    'the way to make silicone',
]

export function CommuteForm(props: CommuteFormProps) {
  const stations = props.stations;

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [travelTimeMin, setTravelTimeMin] = useState<number | undefined>(undefined);
  const [start, setStart] = useState<string | undefined>("Covent Garden");
  const [end, setEnd] = useState<string | undefined>("Hyde Park Corner");
  const [topic, setTopic] = useState<string>();
  const [topicPlaceholder, setTopicPlaceholder] = useState<string>();
  const [podcastText, setPodcastText] = useState<string>('');
  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  useEffect(() => {
    setTopicPlaceholder(topics[Math.floor(Math.random() * topics.length)]);

    setTimeout(() => {
      setShowSplash(false);
    }, 3500);
  }, []);

  useEffect(() => {
    if (topic && travelTimeMin) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [topic, travelTimeMin])


  const generatePodcast = async () => {
    if (!topic) return;
    const params = new URLSearchParams({
      topic,
      duration: ((travelTimeMin || 5) * 60).toString(),
    });
    const response: any = await fetch(`/api/podcast/generate?${params.toString()}` );
    const podcastContent: any = await response.json();
    setPodcastText(podcastContent.script);
  }

  const onClick = async () => {
    setIsLoading(true);
    // await fetchCommuteTime();
    await generatePodcast();
    setIsLoading(false);
  }

  const loadTitle = () => {
    setTopic(topics[Math.floor(Math.random() * topics.length)]);
  }

  const handleStartStationChange = (station: string) => {
    setStart(station);
  }

  const handleEndStationChange = (station: string) => {
    setEnd(station);
  }

  const handleTravelTimeChange = (time: number | undefined) => {
    setTravelTimeMin(time);
  }

  useEffect(() => {
    const fetchCommuteTime = async () => {
      if (!start || !end) return;
      const params = new URLSearchParams({
        start: `${start}, London`,
        end: `${end}, London`
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


  if (showSplash) {
    return (
      <SplashScreen></SplashScreen>
    )
  } else if (isLoading) {
    return (
      <LoadingScreen></LoadingScreen>
    )
  }

  return (
      <div className="w-100">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col flex-wrap content-end text-4xl px-4 pt-8 text-color-main">
                tube uni
            </div>
            <div className="flex flex-col flex-wrap content-start">
                <StationSelector title="from" stations={stations} station={start} onChange={handleStartStationChange}/>
            </div>
            <div className="flex flex-col flex-wrap content-end">
                <StationSelector title="to" stations={stations} station={end} onChange={handleEndStationChange}/>
            </div>
            <div className="flex flex-col flex-wrap content-center">
                <TravelTimeSelector commuteTime={travelTimeMin} onChange={handleTravelTimeChange}></TravelTimeSelector>
            </div>
            <div className="flex flex-col flex-wrap content-center">
                <div className="text-lg p-2">teach me about...</div>
                <div className="relative w-full h-fit">
                  <textarea 
                      className="teach-me-input placeholder-white w-full p-2"
                      value={topic} 
                      placeholder={`type something like "${topicPlaceholder}"`}
                      rows={3}
                      onInput={e => setTopic((e.target as HTMLTextAreaElement).value)}
                  
                  ></textarea>
                  <Button className="bg-transparent w-4 h-4 min-w-4 absolute bottom-4 right-0 p-0 mx-2" onClick={loadTitle}>
                    <Image
                      src="/icons/refresh.png"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                      alt="refresh"
                    />
                  </Button>
                </div>

            </div>

            <div className="flex flex-col flex-wrap content-center">
                <Button className="mt-4 rounded-none create-button" onClick={onClick} isDisabled={!canSubmit}>
                create podcast                
                </Button>
            </div>
        </div>


        {podcastText ? JSON.stringify(podcastText, null, 4): ''}
      </div>
  )
}