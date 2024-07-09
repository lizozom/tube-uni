
import language from '@google-cloud/language';
import { credentials } from './credentials';

const langClient = new language.LanguageServiceClient({
    credentials
  });

export const moderate = async (topic: string): Promise<boolean> => {

  const [ moderationResponse ] = await langClient.moderateText({
    document: {
      content: topic,
      type: 'PLAIN_TEXT'
    }
  });

  console.log("Running moderation")
  if (moderationResponse && moderationResponse.moderationCategories) {
    for (let category of moderationResponse.moderationCategories) {
      if (category.confidence && category.confidence > 0.7) {
        console.log(`Content ${topic} is flagged as ${category.name}`);
        return false;
      }
    }
  }

  return true;
}