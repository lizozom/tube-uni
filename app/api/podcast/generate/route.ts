import { type NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getAudioLong } from './getAudioLong'
import { moderate } from './moderate'
import { fetchContext } from './fetchContext'
import { getTopics } from './getTopics'
import { getScriptByTopics } from './getScriptByTopics'
import { notifyUser } from './notifyUser'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST (
  req: NextRequest
) {
  const body = await req.json()
  const topic = body.topic.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '') || 'This history of London'
  const duration = Number(body.duration) || 60 * 5
  const userId = body.userId

  if (topic.length < 3 || topic.length > 200) {
    console.error(`Invalid topic length: ${topic} (${topic.length})`)
    return NextResponse.json({ errorCode: 400 })
  }

  console.log(`Generating podcast for ${topic} with duration ${duration}`)

  const topicOk = await moderate(topic)

  if (!topicOk) {
    return NextResponse.json({ errorCode: 400 })
  }

  const key = `${topic.toLowerCase()}-${duration}`
  console.log('Cache is active: ', process.env.CACHE_ACTIVE)
  const cached = process.env.CACHE_ACTIVE === 'true' ? (await kv.get(key)) : false
  let startTime = performance.now()

  let response: any = {}
  if (cached) {
    console.log(`Cached response: ${key}`)
    response = cached
    if (!response.audioFile) {
      response.audioFile = await getAudioLong(response.script, topic, duration)
    }
  } else {
    try {
      console.log('Getting context')
      startTime = performance.now()
      const context = await fetchContext(topic)
      console.log(`Got context with ${context.length} items, took ${performance.now() - startTime}ms`)

      console.log('Getting topics')
      startTime = performance.now()
      const topics = await getTopics(topic, duration, context)
      console.log(`Got topics with ${topics.topics.length} items, took ${performance.now() - startTime}ms`)

      console.log('Getting script')
      startTime = performance.now()
      // const script = await getScript(topic, duration, {});
      const script = await getScriptByTopics(topic, duration, topics, context)
      console.log(`Got script, took ${performance.now() - startTime}ms`)

      console.log('Getting audio')
      startTime = performance.now()
      const fileName = await getAudioLong(script, topic, duration)
      console.log(`Got audio, took ${performance.now() - startTime}ms`)

      response = {
        topics,
        script,
        audioFile: fileName
      }

      if (userId) {
        await notifyUser(userId, topic, duration, response.audioFile)
      }
    } catch (e) {
      console.error(e)
      return NextResponse.json({ msg: 'Failed to generate script', errorCode: 500 })
    }
  }

  kv.set(key, response, { ex: 60 * 60 * 24 })

  return NextResponse.json(response)
}
