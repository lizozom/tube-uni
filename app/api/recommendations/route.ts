import { NextRequest, NextResponse } from "next/server";
import { getContentJson } from '../podcast/generate/getContent';
import { prompt as recommendationPrompt } from '../prompts/recommendations';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const history = body.history || [];

  const prompt = recommendationPrompt(history);
  const recommendations = await getContentJson<Array<string>>(prompt);

  return NextResponse.json(recommendations);
}
