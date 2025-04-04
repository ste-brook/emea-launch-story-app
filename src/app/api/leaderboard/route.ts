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
      console.log('No data found in the sheet');
      return NextResponse.json({ contributors: [] });
    }

    // Get the headers and clean them
    const headers = response.data.values[0].map(header => header.toString().trim());
    console.log('Headers found:', headers);

    // Skip the header row and clean up the data
    const rows = response.data.values.slice(1).map(row => 
      row.map(cell => cell ? cell.toString().trim() : '')
    );
    
    // Count submissions by launch consultant
    const consultantCounts: Record<string, number> = {};
    
    rows.forEach(row => {
      // The first column (index 0) contains the launch consultant name
      const consultantName = row[0];
      if (consultantName && consultantName !== 'Launch Consultant') {
        consultantCounts[consultantName] = (consultantCounts[consultantName] || 0) + 1;
      }
    });
    
    // Convert to array and sort by submission count
    const contributors = Object.entries(consultantCounts)
      .map(([name, submissions]) => ({
        name,
        submissions,
        rank: 0 // Initialize rank as 0
      }))
      .sort((a, b) => b.submissions - a.submissions);
    
    // Assign ranks based on submission count
    contributors.forEach((contributor, index) => {
      if (index === 0) {
        contributor.rank = 1;
      } else {
        const prevContributor = contributors[index - 1];
        contributor.rank = contributor.submissions === prevContributor.submissions 
          ? prevContributor.rank 
          : index + 1;
      }
    });
    
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