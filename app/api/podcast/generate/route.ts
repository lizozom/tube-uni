
import { NextRequest, NextResponse } from "next/server";
import { kv } from '@vercel/kv';
import { getContent } from './getContent';
import { getAudioLong } from './getAudioLong';
import { moderate } from './moderate';
import { fetchContext } from './fetchContext';

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

    Here is some context to help you:
    ${context.join("\n")}
  `
  const text = await getContent(prompt);
  if (!text) {
    throw new Error("Failed to get script");
  }
  try {
    return JSON.parse(text.replace('```json', '').replace('```', ''));
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error(e)
      return { error: "Failed to parse JSON" };
    } else {
      throw e;
    }
  }  
}

const getScriptByTopics = async (topic: string, duration: number, topicsArr: Array<{topic: string, description: string}>, context: string[]) => {
  const scriptChunks = [];
  const wordsPerMinute = 160;
  const desiredWords = duration / 60 * wordsPerMinute;
  const desiredChunkLength = Math.floor((desiredWords - 2 * wordsPerMinute) / (topicsArr.length - 2));
  const commonPromptPart = `
      Don't use asterixes or any other special characters for formatting.
      Don't add comments or staging instructions.
      Don't write "Host:" or "Guest:".

      Here is some context to help you:
      ${context.join("\n")}
  `;

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
    let text = await getContent(prompt);
    if (!text) {
      throw new Error("Failed to get script chunk");
    }
    text = text.replace(/<MUSIC>/g, "");
    scriptChunks.push(text);
  }

  const script = scriptChunks.join('\n');

  console.log(`Script length is ${script.split(" ").length}. Asked for ${duration/60*160}`)
  return {
    content: script
  };
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
  const cached =  undefined;//await kv.get(key);

  let response: any = {};
  if (cached) {
    response = cached;
  } else {
    console.log("Getting context");
    const context = await fetchContext(topic);
    console.log(`Got context with ${context.length} items`);
    console.log("Getting topics");
    const topics = await getTopics(topic, duration, context);
    console.log(topics)
    console.log("Getting script")
    // const script = await getScript(topic, duration, {});
    const script = await getScriptByTopics(topic, duration, topics, context);
    response = {
      topics,
      script
    };
  }

  kv.set(key, response, { ex: 60 * 60 * 24 });

  console.log("Getting audio")
  const fileName = await getAudioLong(response.script.content, topic, duration);
  response.audioFile = fileName;

  return NextResponse.json(response);
}