
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from '@vercel/kv';

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest"}, { apiVersion: 'v1beta' });

const getTopics = async (topic: string, durationSec: number) => {
  const maxChapters = durationSec / 60;
  const prompt = `
    I want to write a fun and educational podcast about ${topic}.
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
    Use this object and write the script for the podcast about ${topic}.
    The podcast has a single host. Don't introduce the host.
    Don't add comments or staging instructions.
    Reading the podcast should take ${duration} seconds.
    The script should be approximately ${duration/60*130} words. 
    Adjust the content length accordingly.
    If you want to add music, add a <MUSIC> tag.

    ${JSON.stringify(titlesObj, null, 2)}

  `;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return {
    content: text
  };
}

export async function GET(
  req: NextRequest
) {
  const { searchParams } = req.nextUrl;
  const topic = (searchParams.get('topic') || "This history of London").trim();
  const duration = Number(searchParams.get('duration') || 60 * 5);

  const key = `${topic.toLowerCase()}-${duration}`;
  const cached = await kv.get(key);
  if (cached) {
    return NextResponse.json(cached);
  }

  const topics = await getTopics(topic, duration);
  const script = await getScript(topic, duration, topics);
  const response = {
    topics,
    script
  };
  kv.set(key, response, { ex: 60 * 60 * 24 });
  return NextResponse.json(response);
}