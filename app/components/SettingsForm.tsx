"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import TopicSelector from "./TopicSelector";

export function SettingsForm() {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [topics, setTopics] = useState<string[]>([]);

  const onClick = () => {
    localStorage.setItem("podcastTopics", JSON.stringify(topics));
    router.push("/app");
  };

  const onSelect = (topics: string[]) => {
    if (topics.length > 1) {
      setIsDisabled(false);
    } else {
      setTopics(topics);
      setIsDisabled(true);
    }
  };

  return (
    <>
      <TopicSelector onSelect={onSelect} />
      <div className="text-m w-full text-center absolute bottom-[35px] left-[50%] -translate-x-[50%]">
        <Button
          className="mt-4 rounded-none create-button text-main"
          onClick={onClick}
          isDisabled={isDisabled}
        >
          go on then
        </Button>
      </div>
    </>
  );
}
