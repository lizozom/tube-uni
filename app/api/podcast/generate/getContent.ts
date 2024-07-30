import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.API_KEY!)

export interface ContentOptions {
  retry?: boolean
  model?: 'small' | 'large'
}

const getContentGemini = async (prompt: string, context: string[], options: ContentOptions) => {
  const model = genAI.getGenerativeModel({
    model: options.model === 'small' ? 'gemini-1.5-flash-latest' : 'gemini-1.5-pro-latest',
    generationConfig: {
      maxOutputTokens: 15000
    }
  },
  {
    apiVersion: 'v1beta'
  })
  const result = await model.generateContent(`
    ${prompt}
    ${context && (context.length > 0) ? `Here is some additional context: ${context.join('\n\n')}` : ''}
    `
  )
  const response = result.response
  return response.text()
}

export const getContent = async (prompt: string, context: string[] = [], options: ContentOptions = {}): Promise<string | null> => {
  try {
    return await getContentGemini(prompt, context, options)
  } catch (e: any) {
    if (e.message.indexOf(429) > -1) {
      return await getContentGemini(prompt, context, {
        ...options,
        retry: true
      })
    } else {
      throw e
    }
  }
}

export const getContentJson = async <T>(prompt: string, context: string[] = [], options: ContentOptions = {}): Promise<T> => {
  const { retry = false } = options
  const text = await getContent(prompt, context, options)
  if (!text) {
    throw new Error('Failed to get script')
  }
  try {
    const response = JSON.parse(text.replace('```json', '').replace('```', ''))
    console.debug(`Got JSON response: ${JSON.stringify(response, null, 2)}`)
    return response
  } catch (e) {
    if (!retry && e instanceof SyntaxError) {
      console.warn('Failed to parse JSON, retrying generation')
      return await getContentJson<T>(prompt, context, {
        ...options,
        retry: true
      })
    } else {
      console.error(text)
      console.error(e)
      throw e
    }
  }
}
