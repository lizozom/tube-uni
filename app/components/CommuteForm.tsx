"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, Image } from "@nextui-org/react";
import { DistanceMatrixResponseData, TravelMode } from "@googlemaps/google-maps-services-js";
import { TubeStation } from "../types";
import { SplashScreen } from "./SplashScreen";
import StationSelector from "./StationSelector";
import TravelTimeSelector from "./TravelTimeSelector";

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

  useEffect(() => {
    setTopicPlaceholder(topics[Math.floor(Math.random() * topics.length)]);

    setTimeout(() => {
      setShowSplash(false);
    }, 3500);
  }, []);


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
                <Button className="mt-4 rounded-none create-button" onClick={onClick}>
                create podcast
                <div role="status" className={isLoading ? 'block' : 'hidden'}>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                </div>
                
                </Button>
            </div>
        </div>


        {podcastText ? JSON.stringify(podcastText, null, 4): ''}
      </div>
  )
}