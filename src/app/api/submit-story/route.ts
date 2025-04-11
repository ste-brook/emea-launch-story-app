import { NextResponse } from 'next/server';
import { 
  getSheetName, 
  appendData, 
  formatLineOfBusinessData 
} from '@/lib/googleSheets';
import { createLaunchStoryDoc } from '@/lib/googleDocs';
import { sendSlackNotification } from '@/lib/slack';
import type { BusinessType } from '@/components/StoryForm';

export async function POST(request: Request) {
  try {
    const story = await request.json();

    // Validate required fields
    const requiredFields = ['merchantName', 'launchConsultant', 'salesforceCaseLink', 'launchStatus', 'lineOfBusiness', 'opportunityRevenue'];
    const missingFields = requiredFields.filter(field => !story[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate opportunity revenue format
    if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(story.opportunityRevenue)) {
      return NextResponse.json(
        { error: 'Invalid opportunity revenue format. Please use numbers with optional thousands separators and up to 2 decimal places (e.g., 1,000,000.00)' },
        { status: 400 }
      );
    }

    // Validate GMV for selected lines of business
    const missingGmv = story.lineOfBusiness.filter((business: BusinessType) => !story.gmv[business]);
    if (missingGmv.length > 0) {
      return NextResponse.json(
        { error: `Missing GMV for: ${missingGmv.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate GMV format
    const gmvFormatError = story.lineOfBusiness.find((business: BusinessType) => {
      const gmvValue = story.gmv[business];
      return !/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(gmvValue);
    });

    if (gmvFormatError) {
      return NextResponse.json(
        { error: `Invalid GMV format for ${gmvFormatError}. Please use numbers with optional thousands separators and up to 2 decimal places (e.g., 1,000,000.00)` },
        { status: 400 }
      );
    }

    // Get sheet name once
    const sheetName = await getSheetName();
    
    // Format the data for Google Sheets
    const values = formatLineOfBusinessData(story);
    
    try {
      // Append to Google Sheet (critical operation)
      await appendData(sheetName, values);

      let docUrl = null;
      
      // Try to create Google Doc if configured (non-critical)
      if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
        try {
          docUrl = await createLaunchStoryDoc(story);
          console.log('Google Doc created successfully:', docUrl);
        } catch (docError) {
          console.error('Error creating Google Doc:', docError);
          // Don't fail the submission if doc creation fails
        }
      }

      // Send Slack notification in the background (non-blocking)
      sendSlackNotification({
        ...story,
        docUrl
      }).catch(error => {
        console.error('Error sending Slack notification:', error);
      });

      return NextResponse.json({ 
        success: true,
        docUrl,
        message: !docUrl ? 'Story saved successfully. Google Doc creation is temporarily unavailable.' : 'Story saved successfully.'
      });
    } catch (operationError) {
      console.error('Error saving to Google Sheet:', operationError);
      return NextResponse.json(
        { error: 'Failed to save story. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit story' },
      { status: 500 }
    );
  }
} 