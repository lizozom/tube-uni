import { ScriptResponse } from './types';
import { scriptPrompt } from '../../prompts';
import { ScriptTopic } from '../../../types';
import { getContent, getContentYaml, joinChunksWithSSML } from '../../helpers';
  
export const getScriptByTopics = async (
  topic: string, 
  duration: number, 
  topicsArr: Array<ScriptTopic>, 
  context: string[], 
  retry: boolean = false
): Promise<ScriptResponse> => {
    const wordsPerMinute = 160;
    const desiredWords = duration / 60 * wordsPerMinute;
    const desiredChunkLength = Math.floor((desiredWords - 2 * wordsPerMinute) / (topicsArr.length - 2));

    const scriptChunks: Array<ScriptTopic> = [];

    for (let i = 0; i < topicsArr.length; i++) {
      const scriptTopic = topicsArr[i];
      const chunkPrompt = scriptPrompt(topic, desiredChunkLength, scriptTopic, scriptChunks);
      const scriptResponse = await getContent(chunkPrompt, context);
      if (!scriptResponse) {
        throw new Error("Failed to get script");
      }
      scriptChunks.push({
        ...scriptTopic,
        content: scriptResponse,
      });
    }

    const chunks = scriptChunks.map((topic) => topic.content) as string[];
    const contentLength = chunks
      .map(chunk => chunk.split(" ").length)
      .reduce((acc, val) => acc + val, 0);
    console.log(`Script length is ${contentLength}. Asked for ${duration/60*160}`)
    return {
      chunks,
      content: joinChunksWithSSML(chunks),
    }
  }