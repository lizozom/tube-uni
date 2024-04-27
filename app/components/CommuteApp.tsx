"use client";

import { useEffect, useState } from "react";
import { TubeStation } from "../types";
import { SplashScreen } from "./SplashScreen";
import { LoadingScreen } from "./LoaderScreen";
import { PlayScreen } from "./PlayScreen";
import { CommuteForm } from "./CommuteForm";


export interface CommuteAppProps {
    stations: Array<TubeStation>;
    topics: Array<string>;
    placeholderTopic: string;
}

export function CommuteApp(props: CommuteAppProps) {
  const { topics, stations, placeholderTopic } = props;

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [travelTimeMin, setTravelTimeMin] = useState<number | undefined>(undefined);
  const [topic, setTopic] = useState<string>();
  const [podcastResponse, setPodcastResponse] = useState<any>();

  useEffect(() => {
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, []);

  const hideSplash = () => {
    setShowSplash(false);
  }

  const onIsLoading = (isLoading: boolean) => {
    setIsLoading(isLoading);
  }

  const onPodcastResponse = (topic: string, duration: number, podcastResponse: any) => {
    setTopic(topic);
    setTravelTimeMin(duration);
    setPodcastResponse(podcastResponse);
  }

  const onBack = () => {
    setTopic('');
    setTravelTimeMin(undefined);
    setPodcastResponse(undefined);
  }

  if (topic && travelTimeMin && podcastResponse) {
    return (
      <PlayScreen 
        topic={topic} 
        duration={travelTimeMin} 
        onBack={onBack} 
        audio={podcastResponse.audio}>
            
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
  } else {
    return (
        <CommuteForm 
            stations={stations} 
            topics={topics} 
            placeholderTopic={placeholderTopic}
            onIsLoading={onIsLoading}
            onPodcastResponse={onPodcastResponse}
        
        ></CommuteForm>
    );
  }

}