
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from '@vercel/kv';
import { TextToSpeechClient, v1beta1 } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import language from '@google-cloud/language';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const credentials = {
  client_email: process.env.GOOGLE_ACCOUNT_EMAIL!,
  private_key: process.env.GOOGLE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n')
}

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
const ttsClient = new TextToSpeechClient({
  credentials
});
const ttsLongClient = new v1beta1.TextToSpeechLongAudioSynthesizeClient({
  credentials
});
const storageClient = new Storage({
  credentials
});
const langClient = new language.LanguageServiceClient({
  credentials
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
    Don't use asterixes or any other special characters for formatting.
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
      audioEncoding: "LINEAR16" as any,
      effectsProfileId: [
        "small-bluetooth-speaker-class-device"
      ],
      pitch: 0,
      speakingRate: 1
    }
  };

  const response = await ttsClient.synthesizeSpeech(request);

  if (response && response[0] && response[0].audioContent) {
    const audio: Buffer = response[0].audioContent as any as Buffer;
    const audioString = audio.toString('base64');
    return {
      audioContent: audioString,
    
    };
  } else {
    throw new Error("Failed to generate audio");
  }
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getTodaysDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}_${month}_${day}`;

}

const checkFileExists = async (fileName: string) => {
  const bucket = storageClient.bucket("tube-uni-podcasts");
  const resp = await  bucket.file(fileName).exists();
  return resp[0];

}

const getAudioLong = async (script: string, topic: string, duration: number) => {
  return new Promise(async (resolve, reject) => {
    const fileName = `${getTodaysDate()}_${topic.replace(/ /g, "_")}_${duration}.mp3`;
    const outputFileName = `https://storage.cloud.google.com/tube-uni-podcasts/podcasts/${fileName}`;
    const fileExists = await checkFileExists(`podcasts/${fileName}`);

    if (fileExists) {
      resolve(outputFileName);
    }

    const request = {
      parent: `projects/${process.env.GOOGLE_PROJECT_NUMBER}/locations/global`,
      outputGcsUri: `gs://tube-uni-podcasts/podcasts/${fileName}`,
      input: {text: script},
      voice: {
        languageCode: "en-US",
        name: "en-US-Studio-O"
      },
      audioConfig: {
        audioEncoding: "LINEAR16" as any,
        effectsProfileId: [
          "small-bluetooth-speaker-class-device"
        ],
        pitch: 0,
        speakingRate: 1
      }
    };


    try {
      const response = await ttsLongClient.synthesizeLongAudio(request);

      const [operation] = response;
      if (operation && operation.name) {

        let counter = 0;
        do {
          const checkDone = await ttsLongClient.checkSynthesizeLongAudioProgress(operation.name);
          counter++; 

          if (checkDone.done) {
            if (checkDone.error) {
              reject(checkDone.error);
            }
            const outputFileName = `https://storage.cloud.google.com/tube-uni-podcasts/podcasts/${fileName}`
            resolve(outputFileName);
            break;
          } else if (counter >= 50) {
            reject("Audio generation took too long");
            break;
          } else {
            await sleep(1500);
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

  const [ moderationResponse ] = await langClient.moderateText({
    document: {
      content: topic,
      type: 'PLAIN_TEXT'
    }
  });

  console.log("Running moderation")
  if (moderationResponse && moderationResponse.moderationCategories) {
    for (let category of moderationResponse.moderationCategories) {
      if (category.confidence && category.confidence > 0.3) {
        console.log(`Content is flagged as ${category.name}`);
        return NextResponse.json({ errorCode: 400 });
      }
    }
  }

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
  const fileName = await getAudioLong(response.script.content, topic, duration);
  response.audioFile = fileName;

  return NextResponse.json(response);
}