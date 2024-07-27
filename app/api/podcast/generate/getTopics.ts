import { getContentJson } from "./getContent";
import { getTotalContentLengthInWords, getIntroLengthInWords, getContentChunkLengthInWords } from './helpers'; 
import { TopicsResponse } from "../../../types";

export const getTopics = async (topic: string, durationSec: number, context: string[]) => {
  const contentLengthInWords = getTotalContentLengthInWords(durationSec); // intro and outro
  const maxChapters = Math.max(Math.floor(contentLengthInWords / (60 * 3)), 1); // at least one chapter
  const prompt = `
    Content:
    Write a topic outline for a podcast about ${topic}.
    This podcast is a single podcast and not a part of a series.
    First topic is intro, last topic is outro.
    Add ${maxChapters} more topics in between.
    Focus on creating a good story arc and keeping the listener engaged.
    Explain the storyarc in detail!

    Tone:
    Please write a response without using superlatives (e.g., "best," "most amazing," "greatest") 
    and avoid using an excess of adjectives. Focus on clear, concise, and factual language.

    Formatting:
    Return the response as a JSON object that looks like this. 
    {
      "storyarc": "...",
      "topics": [{
          "topic": "...",
          "description": "..."
      }, ...
      ]
    },

    IMPORTANT! Return ONLY a JSON object. Don't add quotes or comments around it.
  `
  const response = await getContentJson<TopicsResponse>(prompt, context);

  const introOutroDuration = getIntroLengthInWords(durationSec);
  const desiredChunkLength = getContentChunkLengthInWords(durationSec, response.topics);
  console.log(`Desired chunk length is ${desiredChunkLength}`);
  console.log(`Desired intro/outro length is ${introOutroDuration}`);

  response.topics.forEach((t, index) => {
    if (index === 0 || index === response.topics.length - 1) {
      t.words = introOutroDuration;
    } else {
      t.words = desiredChunkLength;
    }
  });

  return response;
}