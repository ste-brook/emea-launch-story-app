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

export async function POST(request: Request) {
  try {
    const story = await request.json();

    if (!story.merchantName) {
      return NextResponse.json(
        { error: 'Merchant name is required' },
        { status: 400 }
      );
    }

    // Prepare the data for Google Sheets
    const values = [
      [
        story.submissionDate,
        story.merchantName,
        story.enhancedStory || story.notes, // Use notes if no enhanced story
        new Date().toISOString(), // Timestamp of submission
      ],
    ];

    // Append the data to the Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Stories!A:D', // Adjust range as needed
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 }
    );
  }
} 