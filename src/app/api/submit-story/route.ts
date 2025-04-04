import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Headers for the Google Sheet
const HEADERS = [
  'Launch Consultant',
  'Merchant Name',
  'Salesforce Case Link',
  'Merchant Segment',
  'GMV',
  'Line of Business',
  'Story',
  'Submission Date'
];

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
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_PROJECT_ID,
      sheet_id: process.env.GOOGLE_SHEET_ID,
      private_key_length: process.env.GOOGLE_PRIVATE_KEY?.length || 0
    });

    // Get the spreadsheet metadata to find available sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const sheetsList = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title).filter(Boolean) || [];
    console.log('Available sheets:', sheetsList);

    // Use the first sheet if 'Stories' doesn't exist
    const sheetName = sheetsList.includes('Stories') ? 'Stories' : sheetsList[0];
    if (!sheetName) {
      throw new Error('No sheets found in the spreadsheet');
    }
    console.log('Using sheet:', sheetName);

    // Check if headers exist, if not, create them
    try {
      console.log('Checking if headers exist in the sheet');
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${sheetName}!A1:H1`,
      });

      if (!response.data.values || response.data.values.length === 0) {
        console.log('Headers not found, creating them');
        // Headers don't exist, create them
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `${sheetName}!A1:H1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [HEADERS],
          },
        });
        console.log('Headers created successfully');
      } else {
        console.log('Headers already exist in the sheet');
      }
    } catch (error) {
      console.error('Error checking/creating headers:', error);
      // Continue with submission even if header creation fails
    }

    // Format line of business as comma-separated string
    const lineOfBusinessString = Array.isArray(story.lineOfBusiness) 
      ? story.lineOfBusiness.join(', ')
      : story.lineOfBusiness || '';

    // Prepare the data for Google Sheets with the correct column order
    const values = [
      [
        (story.launchConsultant || '').trim(), // Column A: Launch Consultant
        (story.merchantName || '').trim(), // Column B: Merchant Name
        (story.salesforceCaseLink || '').trim(), // Column C: Salesforce Case Link
        (story.storeType || '').trim(), // Column D: Merchant Segment
        (story.gmv || '').trim(), // Column E: GMV
        lineOfBusinessString.trim(), // Column F: Line of Business
        (story.enhancedStory || '').trim(), // Column G: Story
        (story.submissionDate || new Date().toISOString().split('T')[0]).trim(), // Column H: Submission Date
      ],
    ];

    console.log('Prepared data for Google Sheets:', JSON.stringify(values, null, 2));

    // Append the data to the Google Sheet
    console.log('Appending data to Google Sheet');
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A:H`, // Updated range to match all columns
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    
    console.log('Data appended successfully:', JSON.stringify(appendResponse.data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting story:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 }
    );
  }
} 