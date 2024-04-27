
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from '@vercel/kv';

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro-latest",
    generationConfig: {
      maxOutputTokens: 15000,
    }
  }, 
  { 
    apiVersion: 'v1beta' 
  });

const getTopics = async (topic: string, durationSec: number) => {
  const maxChapters = durationSec / 60;
  const prompt = `
    Write a fun and educational podcast about ${topic}.
    The podcast will be ${durationSec} seconds long. 
    Don't mention the length of the podcast.
    Give me the title of the podcast and titles for the chapters of the podcast.
    The podcast should at most ${maxChapters} chapters. You can have less chapters.
    The first should be an introduction, the last one an outro.
    Return the response as a JSON object.
    It should have a topic field, title field, a length field (numberic, in seconds) and a chapters field.
    The chapters field should be an array of objects.
    Each object should have a title and a summary of the topic (not the actual text of the chapter).
    IMPORTANT! Return ONLY a JSON object. Don't add quotes or comments around it.
  `

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().replace('```json', '').replace('```', '');
  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error(e)
      return { error: "Failed to parse JSON" };
    } else {
      throw e;
    }
  }  

}

const getScript = async (topic: string, duration: number, titlesObj: Record<string, any>) => {
  const prompt = `
    Generate a response that contains at least ${duration/60*160} words and ${duration/60*160*4} tokens!!!!!!!!!
    Write a script with AT LEAST ${duration/60*160} words for a podcast about ${topic}.
    Start the podcast by saying "Welcome to tube uni, the podcast that teaches you something new every ride. Today's topic is ${topic}".
    INclude a short introduction about the topic.
    Include a short outro about the topic.
    Don't add comments or staging instructions.
    If you want to add music, add a <MUSIC> tag.

  `;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(`Script length is ${text.split(" ").length}ץ Asked for ${duration/60*160}`)
  return {
    content: text
  };
}

const getAudio = async (script: string) => {
  const request = {
    input: {text: script},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  const response = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${process.env.GOOGLE_MAPS_API_KEY}`, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  const parsedResponse: any = await response.json();
  return parsedResponse;

}

export async function GET(
  req: NextRequest
) {
  const { searchParams } = req.nextUrl;
  const topic = (searchParams.get('topic') || "This history of London").trim();
  const duration = Number(searchParams.get('duration') || 60 * 5);

  const key = `${topic.toLowerCase()}-${duration}`;
  const cached = undefined;// await kv.get(key);

  let response: any = {};
  if (cached) {
    response = cached;
  } else {
    // console.log("Getting topics");
    // const topics = await getTopics(topic, duration);
    console.log("Getting script")
    const script = await getScript(topic, duration, {});
    response = {
      script
    };
  }

  kv.set(key, response, { ex: 60 * 60 * 24 });

  console.log("Getting audio")
  const audio = await getAudio(response.script.content);
  response.audio = audio;

  return NextResponse.json(response);
}