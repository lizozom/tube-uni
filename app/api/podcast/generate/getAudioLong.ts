import { Storage } from '@google-cloud/storage'
import { v1beta1 } from '@google-cloud/text-to-speech'
import { credentials } from './credentials'
import { type ScriptResponse } from '../../../types'

const ttsLongClient = new v1beta1.TextToSpeechLongAudioSynthesizeClient({
  credentials
})

const storageClient = new Storage({
  credentials
})

const GS_PATH = 'gs://tube-uni-podcasts/podcasts/'

const checkFileExists = async (fileName: string) => {
  const bucket = storageClient.bucket('tube-uni-podcasts')
  const resp = await bucket.file(fileName).exists()
  return resp[0]
}

const sleep = async (ms: number) => {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

const getAudioLongGcp = async (script: ScriptResponse, fileName: string) => {
  const request = {
    parent: `projects/${process.env.GOOGLE_PROJECT_NUMBER}/locations/global`,
    outputGcsUri: `${GS_PATH}${fileName}`,
    input: { ssml: script.content },
    voice: {
      languageCode: 'en-us',
      name: 'en-US-Neural2-F'
    },
    audioConfig: {
      audioEncoding: 'LINEAR16' as any,
      effectsProfileId: [
        'small-bluetooth-speaker-class-device'
      ],
      pitch: 0,
      speakingRate: 1
    }
  }

  const response = await ttsLongClient.synthesizeLongAudio(request)

  const [operation] = response
  if (operation?.name) {
    let counter = 0
    do {
      const checkDone = await ttsLongClient.checkSynthesizeLongAudioProgress(operation.name)
      counter++

      if (checkDone.done) {
        if (checkDone.error) {
          throw new Error(checkDone.error.message)
        }
        return 'ok';
      } else if (counter >= 100) {
        throw new Error('Audio generation took too long')
      } else {
        await sleep(1500)
      }
    } while (true)
  }
}

export const getAudioFilename = (topic: string, duration: number) => {
  return `${topic.replace(/ /g, '_')}_${duration}.mp3`
}

export const checkAudioExists = async (topic: string, duration: number) => {
  const fileName = getAudioFilename(topic, duration)
  return await checkFileExists(`podcasts/${fileName}`)
}

export const getAudioUrl = (topic: string, duration: number) => {
  const fileName = getAudioFilename(topic, duration)
  return `https://storage.googleapis.com/tube-uni-podcasts/podcasts/${fileName}`
}

export const getAudioLong = async (script: ScriptResponse, topic: string, duration: number) => {
  const fileName = getAudioFilename(topic, duration)
  const outputUrl = getAudioUrl(topic, duration)
  const fileExists = await checkAudioExists(topic, duration)

  if (!fileExists) {
    console.log(`Generating audio for ${topic} with duration ${duration}`)
    await getAudioLongGcp(script, fileName)
  }
  return outputUrl
}
