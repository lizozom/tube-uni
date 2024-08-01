import language from '@google-cloud/language'
import { credentials } from './credentials'

const ignoreCategories = ['Finance', 'Politics', 'Legal', 'Health', 'Religion & Belief']

const langClient = new language.LanguageServiceClient({
  credentials
})

export const moderate = async (topic: string): Promise<boolean> => {
  const [moderationResponse] = await langClient.moderateText({
    document: {
      content: topic,
      type: 'PLAIN_TEXT'
    }
  })

  console.log(`Running moderation for ${topic}`)
  if (moderationResponse?.moderationCategories) {
    for (const category of moderationResponse.moderationCategories) {
      if (category.name && ignoreCategories.includes(category.name)) {
        continue
      }
      if (category.confidence && category.confidence > 0.7) {
        console.log(`Content ${topic} is flagged as ${category.name}`)
        return false
      }
    }
  }

  return true
}
