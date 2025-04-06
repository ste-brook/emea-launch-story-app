import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Headers for the Google Sheet
export const HEADERS = [
  'Launch Consultant',
  'Merchant Name',
  'Salesforce Case Link',
  'Opportunity Revenue',
  'Launch Status',
  'D2C GMV',
  'B2B GMV',
  'POS Pro GMV',
  'Enhanced Story',
  'Submission Date'
];

// Get the sheet name to use
export async function getSheetName(): Promise<string> {
  try {
    // Get the spreadsheet metadata to find available sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    });

    const sheetsList = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title).filter(Boolean) || [];
    console.log('Available sheets:', sheetsList);

    // Use the first sheet if 'Stories' doesn't exist
    const sheetName = sheetsList.includes('Stories') ? 'Stories' : sheetsList[0];
    if (!sheetName) {
      throw new Error('No sheets found in the spreadsheet');
    }
    console.log('Using sheet:', sheetName);
    
    return sheetName;
  } catch (error) {
    console.error('Error getting sheet name:', error);
    throw error;
  }
}

// Ensure headers exist in the sheet
export async function ensureHeadersExist(sheetName: string): Promise<void> {
  try {
    console.log('Checking if headers exist in the sheet');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A1:J1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      console.log('Headers not found, creating them');
      // Headers don't exist, create them
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: `${sheetName}!A1:J1`,
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
    throw error;
  }
}

// Append data to the sheet
export async function appendData(sheetName: string, values: any[][]): Promise<any> {
  try {
    console.log('Appending data to Google Sheet');
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    console.log('Data appended successfully:', appendResponse.data);
    return appendResponse.data;
  } catch (error) {
    console.error('Error appending data:', error);
    throw error;
  }
}

// Get all data from the sheet
export async function getAllData(sheetName: string): Promise<any[][]> {
  try {
    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A:J`,
    });

    if (!response.data.values || response.data.values.length <= 1) {
      console.log('No data found in the sheet');
      return [];
    }

    return response.data.values;
  } catch (error) {
    console.error('Error getting data:', error);
    throw error;
  }
}

// Format line of business data for Google Sheets
export function formatLineOfBusinessData(story: any): any[][] {
  // Format line of business as comma-separated string
  const lineOfBusinessString = Array.isArray(story.lineOfBusiness) 
    ? story.lineOfBusiness.join(', ')
    : story.lineOfBusiness || '';

  // Prepare the data for Google Sheets with the correct column order
  const values = [
    [
      story.launchConsultant || '', // Column A: Launch Consultant
      story.merchantName || '', // Column B: Merchant Name
      story.salesforceCaseLink || '', // Column C: Salesforce Case Link
      story.opportunityRevenue || '', // Column D: Opportunity Revenue
      story.launchStatus || '', // Column E: Launch Status
      story.lineOfBusiness?.includes('D2C') ? `Yes = ${story.gmv?.D2C || ''}` : 'n/a', // Column F: D2C GMV
      story.lineOfBusiness?.includes('B2B') ? `Yes = ${story.gmv?.B2B || ''}` : 'n/a', // Column G: B2B GMV
      story.lineOfBusiness?.includes('POS Pro') ? `Yes = ${story.gmv?.['POS Pro'] || ''}` : 'n/a', // Column H: POS Pro GMV
      story.enhancedStory || '', // Column I: Enhanced Story
      new Date().toISOString().split('T')[0], // Column J: Submission Date
    ],
  ];

  console.log('Prepared data for Google Sheets:', values);
  return values;
}

// Get leaderboard data
export function getLeaderboardData(data: any[][]): any[] {
  if (!data || data.length <= 1) {
    return [];
  }

  // Get the headers and clean them
  const headers = data[0].map(header => 
    typeof header === 'string' ? header.trim().replace(/\n/g, ' ') : ''
  );
  console.log('Headers found:', headers);

  // Find the Launch Consultant column index
  const consultantIndex = headers.findIndex(header => 
    header.toLowerCase().includes('launch consultant')
  );

  if (consultantIndex === -1) {
    console.error('Launch Consultant column not found');
    return [];
  }

  // Count submissions by consultant
  const consultantCounts: Record<string, number> = {};
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row && row[consultantIndex]) {
      const consultant = row[consultantIndex].trim();
      if (consultant) {
        consultantCounts[consultant] = (consultantCounts[consultant] || 0) + 1;
      }
    }
  }

  // Convert to array and sort by count
  const leaderboardData = Object.entries(consultantCounts)
    .map(([name, count]) => ({ name, submissions: count }))
    .sort((a, b) => b.submissions - a.submissions)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  console.log('Leaderboard data:', leaderboardData);
  return leaderboardData;
} 