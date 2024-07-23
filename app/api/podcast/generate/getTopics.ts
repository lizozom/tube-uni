import { getContentJson } from "./getContent";
import { ScriptTopic } from "../../../types";

export const getTopics = async (topic: string, durationSec: number, context: string[], retry: boolean = false) => {
  const durationOnlyContent = durationSec - 60 - 60; // intro and outro
  const maxChapters = Math.floor(durationOnlyContent / (60 * 3));
  const prompt = `
    Write a topic outline for a podcast about ${topic}.
    First topic is intro, last topic is outro.
    Add ${maxChapters} more topics in between.
    Return the response as a JSON list. Each item should look like this {
      "topic": "...",
      "description": "..."
    },
    IMPORTANT! Return ONLY a JSON object. Don't add quotes or comments around it.
  `
  return getContentJson<Array<ScriptTopic>>(prompt, context);
}