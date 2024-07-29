"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { track } from "@vercel/analytics";

function downloadAudio(name: string, fileName: string) {
  // const byteCharacters = atob(mp3String);
  // const byteNumbers = new Array(byteCharacters.length);
  // for (let i = 0; i < byteCharacters.length; i++) {
  //     byteNumbers[i] = byteCharacters.charCodeAt(i);
  // }
  // const byteArray = new Uint8Array(byteNumbers);
  // const blob = new Blob([byteArray], { type: 'audio/mpeg' });

  // const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = fileName;
  a.download = `${name}.mp3`;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function PlayPodcast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const travelTimeMin = searchParams.get("travelTimeMin") as any as number;
  const audioFile = searchParams.get("audioFile");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!topic || !travelTimeMin || !audioFile) {
    return (
      <main>
        <h1>Invalid parameters</h1>
      </main>
    );
  }

  useEffect(() => {
    if (audioRef.current) {
      // Communicate with the service worker to cache the new podcast URL
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: "cacheNewPodcast",
          url: audioFile,
        });
      }
    }
  }, [audioFile]);

  const onBack = () => {
    track("backButtonClick");
    router.push("/app");
  };

  const playAudio = () => {
    // playAudioString(audio.audioContent);
    track("download", { topic: topic || "" });
    // downloadAudio(topic.toLowerCase().replace(/ /g, "_"), audioFile);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex real-100vh relative">
      <div className="flex m-auto flex-col items-center gap-8 ">
        <button onClick={playAudio}>
          <Image
            src="/images/Ready.svg"
            width={150}
            height={150}
            alt="logo"
            priority={true}
          />
        </button>
        <span className="text-2xl text-center items-center px-6">
          {topic} in {travelTimeMin} minutes
        </span>

        <audio id="podcastPlayer" ref={audioRef}>
          <source src={audioFile} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
      <button
        className="text-main absolute bottom-[35px] left-[50%] -translate-x-[50%]"
        onClick={onBack}
      >
        back to start
      </button>
    </div>
  );
}

export default PlayPodcast;
