"use client";

import { Button } from "@nextui-org/react";
import CommuteListbox from "./components/CommuteListbox";
import { useState } from "react";
import { DistanceMatrixResponseData, TravelMode } from "@googlemaps/google-maps-services-js";

export default function Home() {
  const [travelTime, setTravelTime] = useState<{text: string, value: number} | null>(null);
  const [start, setStart] = useState<string>('Tower Bridge, London');
  const [end, setEnd] = useState<string>('Borough Market, London');
  const [topic, setTopic] = useState<string>('The history of the London Underground');
  const [commuteMode, setCommuteMode] = useState<string>(TravelMode.driving);
  const [podcastText, setPodcastText] = useState<string>('');

  const fetchCommuteTime = async () => {
    const params = new URLSearchParams({
      start,
      end,
      mode: commuteMode
    });
    const response = await fetch(`/api/traverse_time?${params.toString()}` );
    const instructions: DistanceMatrixResponseData = await response.json();
    const travelTime = instructions.rows[0].elements[0].duration;
    setTravelTime(travelTime)
  }

  const generatePodcast = async () => {
    const params = new URLSearchParams({
      topic,
      duration: (travelTime?.value || 60 * 5).toString(),
    });
    const response: any = await fetch(`/api/podcast/generate?${params.toString()}` );
    const podcastContent: any = await response.json();
    setPodcastText(podcastContent.response.candidates[0].content.parts[0].text);
  }


  const onClick = async () => {
    await fetchCommuteTime();
    await generatePodcast();
  }

  const handlecommuteModeChange = (method: Record<string, any>) => {
    setCommuteMode(method.mode);
  }

  return (
    <main className="flex min-h-screen flex-col items-left justify-between p-24">
      <div>
        <div className="text-l font-bold">Where are you traveling from?</div>
        <input className="border-2 border-gray-300 p-2" value={start} onInput={e => setStart((e.target as HTMLTextAreaElement).value)}/>
        <div className="text-l font-bold">Where are you traveling to?</div>
        <input className="border-2 border-gray-300 p-2" value={end} onInput={e => setEnd((e.target as HTMLTextAreaElement).value)}/>
        <div className="text-l font-bold">Topic to learn about?</div>
        <input className="border-2 border-gray-300 p-2" value={topic} onInput={e => setTopic((e.target as HTMLTextAreaElement).value)}/>
        <div className="text-l font-bold">How are you commuting?</div>
        <CommuteListbox onChange={handlecommuteModeChange}/>
        <br/>
        <Button className="mt-4" onClick={onClick}>Generate Podcast</Button>
        {travelTime ? <div>Your commute should take {travelTime.text}. Generating podcast...</div> : null}
        {podcastText}
      </div>
    </main>
  );
}
