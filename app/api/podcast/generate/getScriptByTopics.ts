import { getContent } from "./getContent";
import { ScriptResponse } from "./types";
import { joinChunksWithSSML } from "../../helpers/joinChunks";

export const getScriptByTopics = async (topic: string, duration: number, topicsArr: Array<{topic: string, description: string}>, context: string[]) => {
    const wordsPerMinute = 160;
    const desiredWords = duration / 60 * wordsPerMinute;
    const desiredChunkLength = Math.floor((desiredWords - 2 * wordsPerMinute) / (topicsArr.length - 2));
    const commonPromptPart = `
        Don't use asterixes or any other special characters for formatting.
        Don't add comments or staging instructions.
        Don't write "Host:" or "Guest:".
  
        Use the following SSML tags to enrich and improve the tone of the script.
        Use it in moderation, to emphasize important parts of the script.
         * <prosody> tags with attributes rate and volume to control the speed and volume of the speech.
         * <break /> tags to add pauses, where needed. Break tags should always be self-closing.
    `;
  
    const promptPromises: Array<Promise<string>> = []
    for (let i = 0; i < topicsArr.length; i++) {  
      const info = topicsArr[i];
      let prompt: string = '';
      if (i === 0) {
        prompt = `
        You are writing a podcast about ${topic}.
        Write a ${wordsPerMinute} word introduction.
        The topic of the paragraph about ${info.topic} and more specifically about ${info.description}
        Start the by saying "This is Tube Uni. You are listening to your very own podcast about ${topic}. Have a pleasant commute and enjoy your listening!".
        ${commonPromptPart}
      `;
      } else if (i === topicsArr.length - 1) {
        prompt =  `
        You are writing a podcast about ${topic}.
        Write a ${wordsPerMinute} word outro.
        The topic of the paragraph about ${info.topic} and more specifically about ${info.description}
        ${commonPromptPart}
      `;
      } else {
        prompt =  `
        You are writing a podcast about ${topic}.
        Write a ${desiredChunkLength} word paragraph about ${info.topic} and more specifically about ${info.description}
        ${commonPromptPart}
      `;
      }
  
      const startTime = performance.now();
      promptPromises.push(getContent(prompt, context).then((text) => {
        console.log(`Got prompt ${i}, took ${performance.now() - startTime}ms`);
        if (!text) {
          throw new Error("Failed to get script chunk");
        }
        text = text?.replace(/<MUSIC>/g, "") || '';
        return text;
      }));
    }
    
    const scriptChunks = await Promise.all(promptPromises);
    const script = joinChunksWithSSML(scriptChunks);
  
    console.log(`Script length is ${script.split(" ").length}. Asked for ${duration/60*160}`)
    return {
      content: script,
      chunks: scriptChunks
    } as ScriptResponse;
  }
  