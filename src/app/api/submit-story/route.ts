import { NextResponse } from 'next/server';
import { 
  getSheetName, 
  ensureHeadersExist, 
  appendData, 
  formatLineOfBusinessData 
} from '@/lib/googleSheets';
import { createLaunchStoryDoc } from '@/lib/googleDocs';
import { sendSlackNotification } from '@/lib/slack';
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

    // Validate GMV format
    const gmvFormatError = story.lineOfBusiness.find((business: BusinessType) => {
      const gmvValue = story.gmv[business];
      return !/^\d+(?:,\d{3})*$/.test(gmvValue);
    });

    if (gmvFormatError) {
      console.log('Error: Invalid GMV format for:', gmvFormatError);
      return NextResponse.json(
        { error: `Invalid GMV format for ${gmvFormatError}. Please use numbers with optional thousands separators (e.g., 1,000,000)` },
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

    // Create a Google Doc for the story
    console.log('Creating Google Doc for the story...');
    let docUrl;
    try {
      docUrl = await createLaunchStoryDoc(story);
      console.log('Google Doc created successfully:', docUrl);
    } catch (docError) {
      console.error('Error creating Google Doc:', docError);
      // Don't fail the whole submission if doc creation fails
      docUrl = null;
    }

    // Send Slack notification
    console.log('Sending Slack notification...');
    try {
      await sendSlackNotification({
        ...story,
        docUrl: docUrl
      });
    } catch (slackError) {
      console.error('Error sending Slack notification:', slackError);
      // Don't fail the submission if Slack notification fails
    }

    return NextResponse.json({ 
      success: true,
      docUrl: docUrl || null
    });
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit story' },
      { status: 500 }
    );
  }
} 