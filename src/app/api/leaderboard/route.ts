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

export async function GET() {
  try {
    console.log('Fetching leaderboard data');
    
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

    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A:G`,
    });

    if (!response.data.values || response.data.values.length <= 1) {
      // Only headers or no data
      return NextResponse.json({ contributors: [] });
    }

    // Skip the header row
    const rows = response.data.values.slice(1);
    
    // Count submissions by launch consultant
    const consultantCounts: Record<string, number> = {};
    
    rows.forEach(row => {
      if (row[0]) { // Column A contains the launch consultant name
        const consultantName = row[0].trim();
        consultantCounts[consultantName] = (consultantCounts[consultantName] || 0) + 1;
      }
    });
    
    // Convert to array and sort by submission count
    const contributors = Object.entries(consultantCounts)
      .map(([name, submissions], index) => ({
        name,
        submissions,
        rank: index + 1
      }))
      .sort((a, b) => b.submissions - a.submissions);
    
    console.log('Leaderboard data:', contributors);
    
    return NextResponse.json({ contributors });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 