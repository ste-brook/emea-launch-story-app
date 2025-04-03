import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { merchantName, notes } = await request.json();

    if (!notes) {
      return NextResponse.json(
        { error: 'Notes are required' },
        { status: 400 }
      );
    }

    const prompt = `As a Shopify Launch Consultant, please enhance the following story about helping a merchant launch their store. Make it engaging, professional, and highlight the key challenges and solutions. Include specific details and outcomes where possible.

Merchant Name: ${merchantName}
Original Notes: ${notes}

Please format the enhanced story in a clear, narrative structure that emphasizes:
1. The initial challenge or situation
2. The actions taken to address it
3. The specific solutions implemented
4. The positive outcomes achieved

Make the story engaging while maintaining professionalism.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert Shopify Launch Consultant who helps craft engaging success stories about helping merchants launch their stores."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const enhancedStory = completion.choices[0].message.content;

    return NextResponse.json({ enhancedStory });
  } catch (error) {
    console.error('Error enhancing story:', error);
    return NextResponse.json(
      { error: 'Failed to enhance story' },
      { status: 500 }
    );
  }
} 