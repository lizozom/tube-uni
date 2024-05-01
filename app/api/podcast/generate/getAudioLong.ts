
import { Storage } from '@google-cloud/storage';
import { v1beta1 } from '@google-cloud/text-to-speech';
import { credentials } from './credentials';

const ttsLongClient = new v1beta1.TextToSpeechLongAudioSynthesizeClient({
    credentials
  });

const storageClient = new Storage({
    credentials
  });

const checkFileExists = async (fileName: string) => {
    const bucket = storageClient.bucket("tube-uni-podcasts");
    const resp = await  bucket.file(fileName).exists();
    return resp[0];
}

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getAudioLong = async (script: string, topic: string, duration: number) => {
    return new Promise(async (resolve, reject) => {
      const fileName = `${topic.replace(/ /g, "_")}_${duration}.mp3`;
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
          audioEncoding: "MP3" as any,
          effectsProfileId: [
            "small-bluetooth-speaker-class-device"
          ],
          pitch: 0,
          speakingRate: 1
        }
      };

      console.log(request)
  
  
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
            } else if (counter >= 80) {
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
  