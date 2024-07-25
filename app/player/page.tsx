"use client";

import { useSearchParams } from 'next/navigation';
import { PlayScreen } from "../components/PlayScreen";

export default function Player() {  
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const travelTimeMin = searchParams.get('travelTimeMin') as any as number;
  const audioFile = searchParams.get('audioFile');

  if (!topic || !travelTimeMin || !audioFile) {
    return (
      <main>
        <h1>Invalid parameters</h1>
      </main>
    );
  }

  return (
    <main>
      <PlayScreen 
        topic={topic} 
        duration={travelTimeMin as any as number} 
        audioFile={audioFile}>
        </PlayScreen>
    </main>
  );
}
