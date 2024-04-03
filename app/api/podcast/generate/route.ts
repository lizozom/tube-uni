
import { NextRequest, NextResponse } from "next/server";
import { HarmBlockThreshold, HarmCategory, VertexAI } from '@google-cloud/vertexai';

const project = '	gemini-hackathon-419118';
const location = 'us-central1';
// For the latest list of available Gemini models in Vertex, please refer to https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models#gemini-models
const textModel =  'gemini-1.0-pro';
const vertexAi = new VertexAI({project: project, location: location});

// Instantiate models
const generativeModel = vertexAi.getGenerativeModel({
  model: textModel,
  // The following parameters are optional
  // They can also be passed to individual content generation requests
  safety_settings: [{
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, 
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }],
  generation_config: {
    max_output_tokens: 2560
  },
});

const getData = async (topic: string, duration: number) => {
  const request = {
    contents: [{
      role: 'user', 
      parts: [{
        text: `
        Write the transcript for a podcast about ${topic} that is ${duration} seconds long. 
        The podcast has a single host.
        Don't use any comments in brackets. 
        Don't introduce the host.
        If you want to add music, put a <MUSIC> tag in the transcript.
        ` 
      }]
    }],
  };
  const resp = await generativeModel.generateContent(request);
  return resp;
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