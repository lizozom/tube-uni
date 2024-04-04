
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

const getData = async (topic: string, duration: number) => {
  const prompt = `
  Write the transcript for a podcast about ${topic} that is ${duration} seconds long. 
  The podcast has a single host.
  Don't use any comments in brackets. 
  Don't introduce the host.
  If you want to add music, put a <MUSIC> tag in the transcript.
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
  const topic = searchParams.get('topic') || "This history of London";
  const duration = Number(searchParams.get('duration') || 60 * 5);
  const endpointData = await getData(topic, duration);
  return NextResponse.json(endpointData);
}