
import { Storage } from '@google-cloud/storage';
import { v1beta1 } from '@google-cloud/text-to-speech';
import { credentials } from './credentials';
import OpenAI from "openai";
import { ScriptResponse } from './types';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

const ttsLongClient = new v1beta1.TextToSpeechLongAudioSynthesizeClient({
  credentials
});

const storageClient = new Storage({
  credentials
});

const GS_PATH = 'gs://tube-uni-podcasts/podcasts/';

const checkFileExists = async (fileName: string) => {
  const bucket = storageClient.bucket("tube-uni-podcasts");
  const resp = await bucket.file(fileName).exists();
  return resp[0];
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const getAudioLongGcp = async (script: ScriptResponse, fileName: string) => {
  return new Promise(async (resolve, reject) => {
    const request = {
      parent: `projects/${process.env.GOOGLE_PROJECT_NUMBER}/locations/global`,
      outputGcsUri: `${GS_PATH}${fileName}`,
      input: { text: script.content },
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
            resolve('ok');
            break;
          } else if (counter >= 100) {
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

const getAudioLongOpenAI = async (script: ScriptResponse, fileName: string) => {
  const mp3Promises = [];
  const mp3Chunks: Array<Buffer> = [];

  for (let i = 0; i < script.chunks.length; i++) {
    const chunk = script.chunks[i];
    const startTime = performance.now();
    
    mp3Promises.push(
      openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: chunk,
      })
      .then(response => response.arrayBuffer())
      .then(response => {
        console.log(`Chunk ${i} audio done, took ${performance.now() - startTime}ms`);
        return response;
      })
    );
  }

  const responses = await Promise.all(mp3Promises);

  for (let i = 0; i < responses.length; i++) {
    const mp3Buffer = responses[i];
    mp3Chunks.push(Buffer.from(mp3Buffer));
  }

  const combinedBuffer = Buffer.concat(mp3Chunks);
  
  // Save the combined buffer to the storage bucket
  storageClient.bucket("tube-uni-podcasts").file(`podcasts/${fileName}`).save(combinedBuffer);
}


export const getAudioLong = async (script: ScriptResponse, topic: string, duration: number) => {
  return new Promise(async (resolve, reject) => {

    const fileName = `${topic.replace(/ /g, "_")}_${duration}.mp3`;
    const outputUrl = `https://storage.googleapis.com/tube-uni-podcasts/podcasts/${fileName}`;
    const fileExists = await checkFileExists(`podcasts/${fileName}`);

    if (fileExists) {
      resolve(outputUrl);
    }

    if (process.env.TTS_PROVIDER === "openai") {
      await getAudioLongOpenAI(script, fileName);
      resolve(outputUrl);
    } else {
      await getAudioLongGcp(script, fileName);
      resolve(outputUrl);
    }
  });
}