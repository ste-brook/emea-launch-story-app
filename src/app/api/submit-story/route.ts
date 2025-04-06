import { NextResponse } from 'next/server';
import { 
  getSheetName, 
  ensureHeadersExist, 
  appendData, 
  formatLineOfBusinessData 
} from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    console.log('Received story submission request');
    const story = await request.json();
    console.log('Story data:', JSON.stringify(story, null, 2));

    if (!story.merchantName) {
      console.log('Error: Merchant name is missing');
      return NextResponse.json(
        { error: 'Merchant name is required' },
        { status: 400 }
      );
    }

    console.log('Google Sheets credentials:', {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
      sheet_id: process.env.GOOGLE_SHEETS_ID,
      private_key_length: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length || 0
    });

    // Get the sheet name
    const sheetName = await getSheetName();
    
    // Ensure headers exist
    await ensureHeadersExist(sheetName);
    
    // Format the data for Google Sheets
    const values = formatLineOfBusinessData(story);
    
    // Append the data to the sheet
    await appendData(sheetName, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 }
    );
  }
} 