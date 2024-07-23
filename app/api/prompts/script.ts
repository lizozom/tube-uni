import { ScriptTopic } from '../../types';

export const prompt = (topic: string, word_count: number, next_topic: ScriptTopic, existing_chunks: Array<ScriptTopic>) => `  
We are writing the script for a podcast about ${topic}.
Write the next paragraph in the script.
${
  existing_chunks.length > 0 ? 
  `Here is the previous paragraph in the script: ${existing_chunks[existing_chunks.length - 1].content}` : 
  `Write a short introduction to the podcast. 
  Start the first item by saying "This is Tube Uni. You are listening to your very own podcast about ${topic}.
  Have a pleasant commute and enjoy your listening!<break time="1s"/>".`
}

Content:
The pargraph should have at least ${word_count} words.
The paragraph should be about ${next_topic.topic} (${next_topic.description}).
Keep the listener engaged and interested in the topic.
Don't repeat words too often.
Make it flow naturally, logically and continuously.

Tone:
Use SSML to enrich and improve the tone of the script.
Use it in moderation! Use it to emphasize important parts of the script.
Use <prosody> tags with attributes rate and volume to control the speed and volume of the speech.
Use <break /> tags to add pauses, where needed. 
Break tags should always be self-closing.
Don't use tags: <speak>, <mark>, <emphasis>, <prosody pitch>, and <lang> because they are not supported.

Output:
Don't use asterixes or any other special characters for formatting.
Don't add comments or staging instructions.
Don't write "Host:" or "Guest:".
Return only the text of the new paragraph.
`
