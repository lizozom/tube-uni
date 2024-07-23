import { topicsPrompt } from '../../prompts';
import { getContentYaml, parseContent } from '../../helpers';
import { ScriptTopic } from '../../../types';

export const getTopics = async (topic: string, durationSec: number, context: string[], retry: boolean = false): Promise<Array<ScriptTopic>> => {
    const durationOnlyContent = durationSec - 60 - 60; // intro and outro
    const maxChapters = Math.floor(durationOnlyContent / (60 * 3));
    const prompt = topicsPrompt(topic, maxChapters);
  
    return getContentYaml(prompt, context) as Promise<Array<ScriptTopic>>;
  }
  