"use client";

import Image from "next/image";

export interface PlayScreenProps {
  topic: string;
  duration: number;
  audio: Record<string, any>;
  onBack: () => void;
}

function downloadAudio(name: string, mp3String: string) {
  const byteCharacters = atob(mp3String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'audio/mpeg' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function playAudioString(mp3String: string) {
  const byteCharacters = atob(mp3String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'audio/mpeg' });

  // Create a URL for the Blob
  const blobUrl = URL.createObjectURL(blob);

  // Create an audio element and set its source to the Blob URL
  const audio = new Audio(blobUrl);

  // Optionally, append the audio element to the DOM to play the audio
  document.body.appendChild(audio);

  audio.play();

}

export function PlayScreen(props: PlayScreenProps) {
  const { topic, duration, audio, onBack } = props;

  const playAudio = () => {
    debugger;
    // playAudioString(audio.audioContent);
    downloadAudio(topic.toLowerCase().replace(/ /g, "_"), audio.audioContent);  
  }
  
  return (
    <div className="flex h-screen relative">
        <div className="flex m-auto flex-col items-center gap-8 ">
          <button onClick={playAudio}>
            <Image
                src="/images/Ready.svg"
                width={150}
                height={150}
                alt="logo"
              />
            </button>
            <span className="text-2xl text-center items-center">{topic} in {duration} minutes</span>
        </div>
        <button className="text-2xl absolute bottom-[35px] left-[50%] -translate-x-[50%]" onClick={onBack}>
          back to start
        </button>
    </div>

  );
}
