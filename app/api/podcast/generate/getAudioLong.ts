
import { Storage } from '@google-cloud/storage';
import { v1beta1 } from '@google-cloud/text-to-speech';
import { credentials } from './credentials';
import { ScriptResponse } from '../../../types';

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
      input: { ssml: script.content },
      voice: {
        languageCode: "en-gb",
        name: "en-GB-Studio-C"
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

export const getAudioFilename = (topic: string, duration: number) => {
  return `${topic.replace(/ /g, "_")}_${duration}.mp3`;
}

export const checkAudioExists = async (topic: string, duration: number) => {
  const fileName = getAudioFilename(topic, duration);
  return checkFileExists(`podcasts/${fileName}`);
}

export const getAudioUrl = (topic: string, duration: number) => {
  const fileName = getAudioFilename(topic, duration);
  return `https://storage.googleapis.com/tube-uni-podcasts/podcasts/${fileName}`;
}

export const getAudioLong = async (script: ScriptResponse, topic: string, duration: number) => {
  return new Promise(async (resolve, reject) => {

    const fileName = getAudioFilename(topic, duration);
    const outputUrl = getAudioUrl(topic, duration);
    const fileExists = await checkAudioExists(topic, duration);

    if (fileExists) {
      resolve(outputUrl);
    } else {
      console.log(`Generating audio for ${topic} with duration ${duration}`);
      await getAudioLongGcp(script, fileName);
      resolve(outputUrl);
    }
  });
}