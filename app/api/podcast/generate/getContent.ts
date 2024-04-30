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


const getContentGemini = async (prompt: string) => {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text()
  }
  
  const getContentOpenAI = async (prompt: string) => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });
  
    return completion.choices[0].message.content;
  }
  
  export const getContent = async (prompt: string): Promise<string | null> => {
    try {
      const activeModel = await kv.get("active-model");
  
      if (activeModel === "openai") {
        return await getContentOpenAI(prompt);
      } else {
        return await getContentGemini(prompt);
      }
    } catch (e: any) {
        if (e.message.indexOf(429) > -1) {
            await kv.set("active-model", "openai", { ex: 1000 * 60 * 60 * 24 });
            return getContent(prompt);
        } else {
            throw e;
        }
    }
    return null;
  }