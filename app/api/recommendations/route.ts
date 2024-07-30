import { type NextRequest, NextResponse } from 'next/server'
import { getContentJson } from '../podcast/generate/getContent'
import { prompt as recommendationPrompt } from '../prompts/recommendations'

export async function POST (req: NextRequest) {
  const body = await req.json()
  const topics = body.topics || []
  const history = body.history || []

  const prompt = recommendationPrompt(topics, history)
  const recommendations = await getContentJson<string[]>(prompt, [], { model: 'small' })

  return NextResponse.json(recommendations)
}
