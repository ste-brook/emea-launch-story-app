import { NextResponse } from 'next/server';
import { 
  getSheetName, 
  ensureHeadersExist, 
  appendData, 
  formatLineOfBusinessData 
} from '@/lib/googleSheets';
import type { BusinessType } from '@/components/StoryForm';

export async function POST(request: Request) {
  try {
    console.log('Received story submission request');
    const story = await request.json();
    console.log('Story data:', JSON.stringify(story, null, 2));

    // Validate required fields
    const requiredFields = ['merchantName', 'launchConsultant', 'salesforceCaseLink', 'launchStatus', 'lineOfBusiness'];
    const missingFields = requiredFields.filter(field => !story[field]);
    
    if (missingFields.length > 0) {
      console.log('Error: Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate GMV for selected lines of business
    const missingGmv = story.lineOfBusiness.filter((business: BusinessType) => !story.gmv[business]);
    if (missingGmv.length > 0) {
      console.log('Error: Missing GMV for:', missingGmv);
      return NextResponse.json(
        { error: `Missing GMV for: ${missingGmv.join(', ')}` },
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
    console.log('Using sheet:', sheetName);
    
    // Ensure headers exist
    const headers = await ensureHeadersExist(sheetName);
    console.log('Headers found:', headers);
    
    // Format the data for Google Sheets
    const values = formatLineOfBusinessData(story);
    console.log('Formatted data:', values);
    
    // Append the data to the sheet
    await appendData(sheetName, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit story' },
      { status: 500 }
    );
  }
} 