import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_RULES } from '@/config/ai-rules';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(request: Request) {
  try {
    const { merchantName, notes, additionalPrompt } = await request.json();

    if (!merchantName || !notes) {
      return NextResponse.json(
        { error: 'Merchant name and notes are required' },
        { status: 400 }
      );
    }

    console.log('Sending request to OpenAI to enhance story...');
    console.log('Original notes:', notes);
    if (additionalPrompt) {
      console.log('Additional instructions:', additionalPrompt);
    }

    const completion = await openai.chat.completions.create({
      ...AI_RULES.modelConfig,
      messages: [
        {
          role: "system" as const,
          content: AI_RULES.systemMessage
        },
        {
          role: "user" as const,
          content: AI_RULES.promptTemplate(merchantName, notes)
        },
        ...(additionalPrompt ? [{
          role: "user" as const,
          content: `Please update the story based on these additional instructions: ${additionalPrompt}`
        }] : [])
      ],
    });

    const enhancedStory = completion.choices[0]?.message?.content;

    if (!enhancedStory) {
      throw new Error('No response from OpenAI');
    }

    console.log('Enhanced story:', enhancedStory);

    return NextResponse.json({ enhancedStory });
  } catch (error) {
    console.error('Error enhancing story:', error);
    return NextResponse.json(
      { error: 'Error enhancing story' },
      { status: 500 }
    );
  }
} 