import { YAMLParseError } from 'yaml';
import { getContent } from '../../helpers/getContent';
import { prompt as topicPrompt } from '../../prompts/topics';
import { parseContent } from '../../helpers/parseContent';

export const getTopics = async (topic: string, durationSec: number, context: string[], retry: boolean = false): Promise<Array<any>> => {
    const durationOnlyContent = durationSec - 60 - 60; // intro and outro
    const maxChapters = Math.floor(durationOnlyContent / (60 * 3));
    const prompt = topicPrompt(topic, maxChapters);
  
    const text = await getContent(prompt, context);
    if (!text) {
      throw new Error("Failed to get script");
    }
    try {
        console.log(text);
        return parseContent(text);
    } catch (e) {
      if (!retry && e instanceof YAMLParseError) {
        console.warn("Failed to parse YAML, retrying generation");
        return getTopics(topic, durationSec, context, true);
      } else {
        console.error(text);
        console.error(e)
        throw e;
      }
    
    }  
  }
  