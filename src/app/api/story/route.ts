import { NextResponse } from 'next/server';
import { getSheetName, appendData, formatLineOfBusinessData } from '@/api/integrations/googleSheets';
import { generateStorySummary, generateStoryTitle } from '@/api/integrations/openAI';

export async function POST(request: Request) {
  try {
    const story = await request.json();
    
    // Generate story summary and title using OpenAI
    const [summary, title] = await Promise.all([
      generateStorySummary(story.story),
      generateStoryTitle(story.story)
    ]);
    
    // Add the generated summary and title to the story data
    const enrichedStory = {
      ...story,
      summary,
      title,
      submissionDate: new Date().toISOString().split('T')[0]
    };
    
    // Get the sheet name
    const sheetName = await getSheetName();
    
    // Format the data for Google Sheets
    const formattedData = formatLineOfBusinessData(enrichedStory);
    
    // Append the data to the sheet
    await appendData(sheetName, formattedData[0]);
    
    return NextResponse.json({ 
      success: true,
      summary,
      title
    });
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 }
    );
  }
} 