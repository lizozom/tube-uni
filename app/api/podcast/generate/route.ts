
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from '@vercel/kv';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

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
    Start the podcast by saying "This is Tube Uni. You are listening to your very own podcast about ${topic} . Have a pleasant commute and enjoy your listening!".
    INclude a short introduction about the topic.
    Include a short outro about the topic.
    Don't add comments or staging instructions.
    Don't write "Host:" or "Guest:".
    If you want to add music, add a <MUSIC> tag.

  `;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  text = text.replace(/<MUSIC>/g, "");
  console.log(`Script length is ${text.split(" ").length}. Asked for ${duration/60*160}`)
  return {
    content: text
  };
}

const getAudio = async (script: string) => {
  const request = {
    input: {text: script},
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: "en-US",
      name: "en-US-Studio-O"
    },
    audioConfig: {
      audioEncoding: "LINEAR16",
      effectsProfileId: [
        "small-bluetooth-speaker-class-device"
      ],
      pitch: 0,
      speakingRate: 1
    }
  };

  const response = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${process.env.GOOGLE_MAPS_API_KEY}`, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  const parsedResponse: any = await response.json();
  return parsedResponse;

}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getAudioLong = async (script: string, topic: string) => {
  return new Promise(async (resolve, reject) => {
    const request = {
      parent: `projects/${process.env.GOOGLE_PROJECT}/locations/global`,
      output_gcs_uri: `gs://tube-uni-podcasts/podcasts/${topic.replace(/ /g, "_")}_${new Date().getTime()}.mp3`,
      input: {text: script},
      voice: {
        languageCode: "en-US",
        name: "en-US-Studio-O"
      },
      audioConfig: {
        audioEncoding: "LINEAR16",
        effectsProfileId: [
          "small-bluetooth-speaker-class-device"
        ],
        pitch: 0,
        speakingRate: 1
      }
    };


    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1beta1/projects/${process.env.GOOGLE_PROJECT}/locations/global:synthesizeLongAudio?key=${process.env.GOOGLE_MAPS_API_KEY}`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      const parsedResponse: any = await response.json();

      if (parsedResponse.name && parsedResponse.done === false) {

        let counter = 0;
        do {
          const checkDone = await fetch(`https://texttospeech.googleapis.com/v1beta1/${parsedResponse.name}?key=${process.env.GOOGLE_MAPS_API_KEY}`, {
            method: 'GET',
          });
          const checkDoneResponse: any = await checkDone.json();
          counter++; // 'Invalid authentication from policy (go/gcs-rpc-sp): Rejected by impersonation_policy (attempt to impersonate cloud-ml-tts-frontend@prod.google.com -- if impersonation was unintentional, see go/dpci-faq#from-context-impersonation): Permission 'auth.impersonation.impersonateProdUser' not granted to cloud-tts-lrs-worker-composite@prod.google.com, because no ALLOW or ALLOW_WITH_LOG rule includes that permission.; RpcSecurityPolicy http://rpcsp/p/FdEbu-XK1Hsfp3UWaU6wj-nZYeP40BxIVKe7ZAu8W7g '

          if (checkDoneResponse.done) {
            if (checkDoneResponse.error) {
              reject(checkDoneResponse.error);
            }
            resolve(checkDoneResponse);
            break;
          } else if (counter >= 20) {
            reject("Audio generation took too long");
            break;
          } else {
            await sleep(1000);
          }
        } while (true);
      }

    } catch (e) {
      reject(e);
    }
  });
}


export async function GET(
  req: NextRequest
) {
  const { searchParams } = req.nextUrl;
  const topic = (searchParams.get('topic') || "This history of London").trim();
  const duration = Number(searchParams.get('duration') || 60 * 5);

  const key = `${topic.toLowerCase()}-${duration}`;
  const cached = await kv.get(key);

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