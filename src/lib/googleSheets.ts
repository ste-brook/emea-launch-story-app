import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Validate environment variables
const validateEnvVars = () => {
  const required = [
    'GOOGLE_SHEETS_CLIENT_EMAIL',
    'GOOGLE_SHEETS_PRIVATE_KEY',
    'GOOGLE_SHEETS_PROJECT_ID',
    'GOOGLE_SHEETS_ID',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Get sheet name
export async function getSheetName() {
  validateEnvVars();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetsList = response.data.sheets || [];
    if (sheetsList.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }
    
    console.log('Available sheets:', sheetsList.map(sheet => sheet.properties?.title));
    return sheetsList[0].properties?.title || 'Sheet1';
  } catch (error) {
    console.error('Error getting sheet name:', error);
    throw error;
  }
}

// Ensure headers exist
export async function ensureHeadersExist(sheetName: string) {
  validateEnvVars();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });
    
    const headers = response.data.values?.[0] || [];
    if (headers.length === 0) {
      throw new Error('No headers found in the sheet');
    }
    
    console.log('Headers found:', headers);
    return headers;
  } catch (error) {
    console.error('Error ensuring headers exist:', error);
    throw error;
  }
}

// Append data to sheet
export async function appendData(sheetName: string, data: any[]) {
  validateEnvVars();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  
  try {
    console.log('Appending data to Google Sheet');
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });
    
    console.log('Data appended successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error appending data:', error);
    throw error;
  }
}

// Get all data from sheet
export async function getAllData(sheetName: string) {
  validateEnvVars();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    
    return response.data.values || [];
  } catch (error) {
    console.error('Error getting all data:', error);
    throw error;
  }
}

// Process data for leaderboard
export function getLeaderboardData(data: any[]) {
  if (!data || data.length < 2) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  // Create a map to count submissions per consultant
  const submissionsMap = new Map();
  
  rows.forEach(row => {
    const consultantIndex = headers.indexOf('Launch Consultant');
    if (consultantIndex !== -1 && row[consultantIndex]) {
      const consultant = row[consultantIndex];
      submissionsMap.set(consultant, (submissionsMap.get(consultant) || 0) + 1);
    }
  });
  
  // Convert map to array and sort by submissions
  const leaderboardData = Array.from(submissionsMap.entries())
    .map(([name, submissions], index) => ({
      name,
      submissions,
      rank: index + 1,
    }))
    .sort((a, b) => b.submissions - a.submissions);
  
  console.log('Leaderboard data:', leaderboardData);
  return leaderboardData;
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