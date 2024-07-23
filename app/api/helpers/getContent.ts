import { kv } from '@vercel/kv';
import { GoogleGenerativeAI } from "@google/generative-ai";
// fallback in case of 429 errors
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro-latest",
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
    const result = await model.generateContent(`
    ${prompt}
    ${context && context.length ? `Here is some additional context: ${context.join("\n\n")}` : ''}
    `
    );
    const response = await result.response;
    return response.text()
  }
  
  const getContentOpenAI = async (prompt: string) => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
    });
  
    return completion.choices[0].message.content;
  }
  
  export const getContent = async (prompt: string, context: string[] = []): Promise<string | null> => {
    try {
      const activeModel = await kv.get("active-model");
  
      // This is a fallback for when Gemini returns 429 errors
      if (activeModel === "openai") {
        return await getContentOpenAI(prompt);
      } else {
        return await getContentGemini(prompt, context);
      }
    } catch (e: any) {
        if (e.message.indexOf(429) > -1) {
            await kv.set("active-model", "openai", { ex: 1000 * 60 * 60 * 24 });
            return getContent(prompt, context);
        } else {
            throw e;
        }
    }
    return null;
  }

  export const getContentJson = async <T>(prompt: string, context: string[] = [], retry = false): Promise<T> => {
    const text = await getContent(prompt, context);
    if (!text) {
      throw new Error("Failed to get script");
    }
    try {
      return JSON.parse(text.replace('```json', '').replace('```', ''));
    } catch (e) {
      if (!retry && e instanceof SyntaxError) {
        console.warn("Failed to parse JSON, retrying generation");
        return getContentJson<T>(prompt, context, true);
      } else {
        console.error(text);
        console.error(e)
        throw e;
      }
    
    }  
  }