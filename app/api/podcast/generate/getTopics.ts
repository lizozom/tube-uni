import { getContentJson } from './getContent'
import { getTotalContentLengthInWords } from './helpers'
import { type ScriptTopic } from '../../../types'

export const getTopics = async (topic: string, durationSec: number, context: string[], retry: boolean = false) => {
  const contentLengthInWords = getTotalContentLengthInWords(durationSec) // intro and outro
  const maxChapters = Math.max(Math.floor(contentLengthInWords / (60 * 3)), 1) // at least one chapter
  const prompt = `
    Write a topic outline for a podcast about ${topic}.
    First topic is intro, last topic is outro.
    Add ${maxChapters} more topics in between.
    Return the response as a JSON list. Each item should look like this {
      "topic": "...",
      "description": "..."
    },
    IMPORTANT! Return ONLY a JSON object. Don't add quotes or comments around it.
  `
  const topics = await getContentJson<ScriptTopic[]>(prompt, context)
  console.debug(`Got topics: ${JSON.stringify(topics)}`)
  return topics
}
