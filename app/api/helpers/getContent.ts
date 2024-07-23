import { YAMLParseError } from 'yaml';
import { kv } from '@vercel/kv';
import { GoogleGenerativeAI } from "@google/generative-ai";
// fallback in case of 429 errors
import OpenAI from "openai";
import { parseContent } from './parseContent';

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
    generationConfig: {
      maxOutputTokens: 15000,
    }
  }, 
  { 
    apiVersion: 'v1beta' 
  });

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

const getContentGemini = async (prompt: string, context: string[]) => {
    console.log("--------------------");
    console.log(prompt);
    const result = await model.generateContent(`
    ${prompt}
    ${context && context.length ? `Here is some additional context: ${context.join("\n\n")}` : ''}
    `
    );
    const response = await result.response;
    console.log((response as any).usageMetadata);
    const text = response.text();
    console.log(text);
    console.log("--------------------");
    return text;
  }
  
  const getContentOpenAI = async (prompt: string) => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
    });
  
    return completion.choices[0].message.content;
  }
  
  export const getContent = async (prompt: string, context: string[] = []): Promise<string> => {
    try {
      // const activeModel = await kv.get("active-model");
  
      // This is a fallback for when Gemini returns 429 errors
      // if (activeModel === "openai") {
        // return await getContentOpenAI(prompt);
      // } else {
        return await getContentGemini(prompt, context);
      // }
    } catch (e: any) {
        if (e.message.indexOf(429) > -1) {
          console.warn(e);  
          console.log("429 error, switching to OpenAI");
        } 
        throw e;
        
    }
  }

  export const getContentYaml = async (prompt: string, context: string[] = [], retry: boolean = false): Promise<any> => {
    const text = await getContent(prompt, context);
    if (!text) {
      throw new Error("Failed to get content");
    }
    try {
      return parseContent(text);
    } catch (e) {
      if (!retry && e instanceof YAMLParseError) {
        console.warn("Failed to parse YAML, retrying generation");
        console.warn(e)
        return getContentYaml(prompt, context, true);
      } else {
        console.error(text);
        console.error(e)
        throw e;
      }
    }
  }
  