"use client";

import { track } from '@vercel/analytics';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { TubeStation, PodcastResponse } from "../types";
import { LoadingScreen } from "./LoaderScreen";
import { CommuteForm } from "./CommuteForm";
import { ErrorScreen } from "./ErrorScreen";
import { storePodcastInHistory, getPodcastTopics } from "./storage";
import useViewportHeight from "./useViewportHeight";

export interface CommuteAppProps {
    stations: Array<TubeStation>;
    topics: Array<string>;
    placeholderTopic: string;
}

export function CommuteApp(props: CommuteAppProps) {
  const { topics, stations, placeholderTopic } = props;
  const router = useRouter();    
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorOrCode, setErrorOrCode] = useState<Error | undefined>(undefined);

  useViewportHeight();

  useEffect(() => {
    const podcastTopics = getPodcastTopics();
    if (!podcastTopics) {
      router.push('/app/settings');
    }
  }, [router]);

  const onIsLoading = (isLoading: boolean) => {
    setIsLoading(isLoading);
  }

  const onError = (errorOrCode?: Error) => {
    setIsError(true);
    setErrorOrCode(errorOrCode);
  }

  const onPodcastResponse = (topic: string, duration: number, podcastResponse: PodcastResponse) => {
    track('podcastGenerated', { topic: topic || '' });
    storePodcastInHistory(topic, duration, podcastResponse);
    const params = new URLSearchParams();
    params.set("topic", topic);
    params.set("travelTimeMin", duration.toString());
    params.set("audioFile", podcastResponse.audioFile);
    router.push(`/player?${params.toString()}`);
  }

  if (isLoading) {
    return (
      <LoadingScreen></LoadingScreen>
    )
  } else if (isError) {
    return (
    <ErrorScreen
      errorOrCode={errorOrCode}
     />)
  } else {
    return (
      <>
        <CommuteForm 
            stations={stations} 
            topics={topics} 
            placeholderTopic={placeholderTopic}
            onIsLoading={onIsLoading}
            onPodcastResponse={onPodcastResponse}
            onError={onError}
        
        ></CommuteForm>
        {/* <PodcastHistory></PodcastHistory> */}
      </>
    );
  }

}