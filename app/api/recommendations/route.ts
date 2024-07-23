import { NextRequest, NextResponse } from "next/server";
import { getContent } from '../helpers/getContent';
import { parseContent } from '../helpers/parseContent';
import { prompt as recommendationPrompt } from '../prompts/recommendations';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const history = body.history || [];

  const prompt = recommendationPrompt(history);
  const recommendationsStr = await getContent(prompt) || '';
  const recommendations = parseContent(recommendationsStr) as Array<string>;

  return NextResponse.json(recommendations);
}
