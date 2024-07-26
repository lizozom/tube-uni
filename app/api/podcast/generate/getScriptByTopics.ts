import { getContent } from "./getContent";
import { ScriptResponse } from "./types";
import { joinChunksWithSSML, removeSSMLTags } from "../../helpers/ssml";
import ssmlCheck from "ssml-check";

export const getScriptByTopics = async (topic: string, duration: number, topicsArr: Array<{topic: string, description: string}>, context: string[]) => {
    const wordsPerMinute = 160;
    const desiredWords = duration / 60 * wordsPerMinute;
    // Intro \ outro should be at most 1 minute or less than 10% of the total duration
    // If the podcast is 5 minutes, the intro would be 0.5 minutes
    // If the podcast is 10 minutes, the intro would be 1 minute
    // If the podcast is 30 minutes, the intro would still be 1 minutes
    const introOutroDuration = Math.min(wordsPerMinute, desiredWords * 0.1); 
    const desiredChunkLength = Math.floor((desiredWords - 2 * introOutroDuration) / (topicsArr.length - 2));
    console.log(`Desired chunk length is ${desiredChunkLength}`);
    console.log(`Desired intro/outro length is ${introOutroDuration}`);
    const commonPromptPart = `
        Poscast topics:
        The podcast has the following chapters:
        ${topicsArr.map((t, index) => `${index + 1}. ${t.topic}`).join("\n")}
        Follow this nerative!

        Formatting:
        Don't use asterixes or any other special characters for formatting.
        Don't add comments or staging instructions.
        Don't write "Host:" or "Guest:".
  
        Tone:
        Keep the script tone conversational, informal and engaging.
        Use the following SSML tags to enrich and improve the tone of the script.
        Use it in moderation, to emphasize important parts of the script.
         * <prosody> tags with attributes rate and volume to control the speed and volume of the speech.
         * <break time="..."/> tags to add pauses, where needed. 
         * Break tags should always be self-closing. Break time should be only integer numbers with units (s or ms).
    `;
  
    const promptPromises: Array<Promise<string>> = []
    for (let i = 0; i < topicsArr.length; i++) {  
      const info = topicsArr[i];
      let prompt: string = '';
      if (i === 0) {
        prompt = `
        You are writing a podcast about ${topic}.
        Write a ${introOutroDuration} word introduction for the podcast.
        
        Start the by saying:
        This is Tube Uni. You are listening to your very own podcast about ${topic}<break time="300ms"/>. 
        Have a pleasant commute and enjoy your listening!<break time="1s"/>".

        ${commonPromptPart}
      `;
      } else if (i === topicsArr.length - 1) {
        prompt =  `
        You are writing a podcast about ${topic}.
        Write a ${introOutroDuration} word outro for the podcast.
        ${commonPromptPart}
      `;
      } else {
        prompt =  `
        You are writing a podcast about ${topic}.
        Write only the ${i} paragraph.
        It should have ${desiredChunkLength} words about ${info.topic} - ${info.description}.    
        
        ${commonPromptPart}
      `;
      }
  
      const startTime = performance.now();
      promptPromises.push(getContent(prompt, context).then((text) => {
        console.log(`Got prompt ${i}, took ${performance.now() - startTime}ms`);
        if (!text) {
          throw new Error("Failed to get script chunk");
        }
        return text;
      }));
    }
    
    let scriptChunks = await Promise.all(promptPromises);
    let script = joinChunksWithSSML(scriptChunks);

    // get rid of SSML if invalid
    const errors = await ssmlCheck.check(script);
    if (errors && errors.length > 0) {
      console.warn("SSML Validation failed", errors);
      scriptChunks = scriptChunks.map((chunk, index) => {
        return removeSSMLTags(chunk);
      });
      script = joinChunksWithSSML(scriptChunks);
    }
  
    console.log(`Script length is ${script.split(" ").length}. Asked for ${duration/60*160}`)
    return {
      content: script,
      chunks: scriptChunks
    } as ScriptResponse;
  }
  