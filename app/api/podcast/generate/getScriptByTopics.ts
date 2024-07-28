import { getContent } from "./getContent";
import { ScriptResponse, TopicsResponse } from "../../../types";
import { joinChunksWithSSML, removeSSMLTags } from "../../helpers/ssml";
import ssmlCheck from "ssml-check";

export const getScriptByTopics = async (topic: string, duration: number, topics: TopicsResponse, context: string[]) => {
    const topicsArr = topics.topics;
    const commonPromptPart = `
        Content:
        The podcast follows this story arc (don't mention it explicitly in the script): 
        ${topics.storyarc}

        The podcast has the following chapters:
        ${topicsArr.map((t, index) => `${index + 1}. ${t.topic} (${t.words} words)`).join("\n")}

        Formatting:
        Don't use asterisk (*) or any special characters.
        Don't add comments or staging instructions.
        Don't write "Host:" or "Guest:".
  
        Tone:
        Keep the script concise, conversational, informal, and engaging.
        Avoid using too many superlatives or exclamations.
        Use the following SSML tags to enhance the tone of the script in moderation to accentuate important parts:
          <prosody> tags with attributes rate and volume to control the speed and volume of the speech. Valid values for volume are: x-soft, soft, medium, loud.
          <break time="..."/> tags to add pauses where needed. Break tags should always be self-closing, with break time specified in integer numbers and units (s or ms).
          <emphasis level="..."> tags with valid levels: strong, moderate, reduced.
    `;
  
    const promptPromises: Array<Promise<string>> = []
    for (let i = 0; i < topicsArr.length; i++) {  
      const info = topicsArr[i];
      let prompt: string = '';
      if (i === 0) {
        prompt = `
        You are writing a podcast about ${topic}.
        Write a very short, 2-3 sentense, ${info.words} word introduction for the podcast (including the opener).
        
        Start it by saying:
        This is Tube Uni. You are listening to your very own podcast about ${topic}. 
        <break time="300ms"/>
        Have a pleasant commute and enjoy your listening!
        <break time="1s"/>

        ${commonPromptPart}
      `;
      } else if (i === topicsArr.length - 1) {
        prompt =  `
        You are writing a podcast about ${topic}.
        Write a ${info.words} word outro for the podcast.
        ${commonPromptPart}
      `;
      } else {
        prompt =  `
        You are writing a podcast about ${topic}.
        Write only the ${i} paragraph.
        It should have ${info.words} words about ${info.topic} - ${info.description}.    
        
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
  