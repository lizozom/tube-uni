
import { NextRequest, NextResponse } from "next/server";
import { kv } from '@vercel/kv';
import { getContent } from './getContent';
import { getAudioLong } from './getAudioLong';
import { moderate } from './moderate';
import { fetchContext } from './fetchContext';
import { ScriptResponse } from './types';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
// Helper functions

const getTopics = async (topic: string, durationSec: number, context: string[]) => {
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
  const text = await getContent(prompt, context);
  if (!text) {
    throw new Error("Failed to get script");
  }
  try {
    return JSON.parse(text.replace('```json', '').replace('```', ''));
  } catch (e) {
    console.error(text);
    console.error(e)
    throw e;
  
  }  
}

const getScriptByTopics = async (topic: string, duration: number, topicsArr: Array<{topic: string, description: string}>, context: string[]) => {
  const wordsPerMinute = 160;
  const desiredWords = duration / 60 * wordsPerMinute;
  const desiredChunkLength = Math.floor((desiredWords - 2 * wordsPerMinute) / (topicsArr.length - 2));
  const commonPromptPart = `
      Don't use asterixes or any other special characters for formatting.
      Don't add comments or staging instructions.
      Don't write "Host:" or "Guest:".
  `;

  const promptPromises: Array<Promise<string>> = []
  for (let i = 0; i < topicsArr.length; i++) {  
    const info = topicsArr[i];
    let prompt: string = '';
    if (i === 0) {
      prompt = `
      You are writing a podcast about ${topic}.
      Write a ${wordsPerMinute} word introduction.
      The topic of the paragraph about ${info.topic} and more specifically about ${info.description}
      Start the by saying "This is Tube Uni. You are listening to your very own podcast about ${topic}. Have a pleasant commute and enjoy your listening!".
      ${commonPromptPart}
    `;
    } else if (i === topicsArr.length - 1) {
      prompt =  `
      You are writing a podcast about ${topic}.
      Write a ${wordsPerMinute} word outro.
      The topic of the paragraph about ${info.topic} and more specifically about ${info.description}
      ${commonPromptPart}
    `;
    } else {
      prompt =  `
      You are writing a podcast about ${topic}.
      Write a ${desiredChunkLength} word paragraph about ${info.topic} and more specifically about ${info.description}
      ${commonPromptPart}
    `;
    }

    const startTime = performance.now();
    promptPromises.push(getContent(prompt, context).then((text) => {
      console.log(`Got prompt ${i}, took ${performance.now() - startTime}ms`);
      if (!text) {
        throw new Error("Failed to get script chunk");
      }
      text = text?.replace(/<MUSIC>/g, "") || '';
      return text;
    }));
  }
  
  const scriptChunks = await Promise.all(promptPromises);
  const script = scriptChunks.join('\n');

  console.log(`Script length is ${script.split(" ").length}. Asked for ${duration/60*160}`)
  return {
    content: script,
    chunks: scriptChunks
  } as ScriptResponse;
}

export async function GET(
  req: NextRequest
) {
  const { searchParams } = req.nextUrl;
  const topic = (searchParams.get('topic') || "This history of London").trim();
  const duration = Number(searchParams.get('duration') || 60 * 5);

  const topicOk = await moderate(topic);

  if (!topicOk) {
    return NextResponse.json({ errorCode: 400 });
  }

  const key = `${topic.toLowerCase()}-${duration}`;
  const cached =  process.env.CACHE_ACTIVE ? await kv.get(key) : false;
  let startTime = performance.now();

  let response: any = {};
  if (cached) {
    console.log(`Cached response: ${key}`);
    response = cached;
  } else {
    try {
      console.log("Getting context");
      startTime = performance.now();
      const context = await fetchContext(topic);
      console.log(`Got context with ${context.length} items, took ${performance.now() - startTime}ms`);

      console.log("Getting topics");
      startTime = performance.now();
      const topics = await getTopics(topic, duration, context);
      console.log(`Got topics with ${topics.length} items, took ${performance.now() - startTime}ms`)

      console.log("Getting script")
      startTime = performance.now();
      // const script = await getScript(topic, duration, {});
      const script = await getScriptByTopics(topic, duration, topics, context);
      console.log(`Got script, took ${performance.now() - startTime}ms`);
      response = {
        topics,
        script
      };
    } catch (e) {
      console.error(e);
      return NextResponse.json({ msg: "Failed to generate script", errorCode: 500 });
    }
  }

  kv.set(key, response, { ex: 60 * 60 * 24 });

  console.log("Getting audio")
  try {
    startTime = performance.now();
    const fileName = await getAudioLong(response.script, topic, duration);
    response.audioFile = fileName;
    console.log(`Got audio, took ${performance.now() - startTime}ms`);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ msg: "Failed to generate script", errorCode: 500 });
  }

  return NextResponse.json(response);
}